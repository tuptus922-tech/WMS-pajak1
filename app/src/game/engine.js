// Silnik gry — czysta symulacja bez Reacta i bez DOM (da się ją odpalić w Node).
// Stan to zwykły obiekt JSON; funkcje go mutują i zwracają { ok, msg }.

import { ITEMS, ITEM_BY_ID, CATEGORIES } from './data/items.js';
import { LOCATIONS, LOCATION_BY_ID, CLIENTS, CLIENT_BY_ID, WEATHER, WEATHER_BY_ID } from './data/world.js';
import { VEHICLE_BY_ID } from './data/vehicles.js';
import { BUILDING_BY_ID, STAFF, STAFF_BY_ID, PERK_BY_ID } from './data/base.js';
import { EVENTS, EVENT_BY_ID } from './data/events.js';
import { GOALS } from './data/goals.js';
import { ACHIEVEMENTS } from './data/achievements.js';
import { DAY, fmtMoney, fmtHour, dayOf, isNight } from './format.js';

export const SAVE_VERSION = 1;
export const MIN_PER_SEC = 12; // minut gry na sekundę przy prędkości 1×

export const KINDS = {
  normal: { label: 'Zlecenie', pay: 1, xp: 1, rep: 0.6, size: 1 },
  pilne: { label: 'PILNE', pay: 1.35, xp: 1.2, rep: 1, size: 0.9 },
  vip: { label: 'VIP', pay: 1.8, xp: 1.5, rep: 2.5, size: 1.5 },
  kontrakt: { label: 'KONTRAKT', pay: 1.5, xp: 1.4, rep: 2, size: 2.4 },
};

const COLOR = { green: '#2f6b3a', blue: '#1f5f8b', orange: '#b4551f', amber: '#a07617', muted: '#6b6a60' };

let rnd = Math.random;
export function setRandom(fn) {
  rnd = fn;
}
const rand = () => rnd();
const randInt = (a, b) => a + Math.floor(rand() * (b - a + 1));
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const round5 = (v) => Math.max(5, Math.round(v / 5) * 5);

function weighted(list, weightOf) {
  let total = 0;
  const weights = list.map((x) => {
    const w = Math.max(0, weightOf(x));
    total += w;
    return w;
  });
  if (total <= 0) return null;
  let r = rand() * total;
  for (let i = 0; i < list.length; i++) {
    r -= weights[i];
    if (r <= 0) return list[i];
  }
  return list[list.length - 1];
}

// ---------------------------------------------------------------------------
// Nowa gra
// ---------------------------------------------------------------------------

function emptyStats() {
  return {
    orders: 0, pilne: 0, vip: 0, kontrakty: 0, kontraktyFailed: 0, expired: 0,
    earned: 0, spent: 0, fuel: 0, wages: 0, km: 0,
    repairs: 0, scrapped: 0, lost: 0, damaged: 0, returns: 0, bought: 0, delivered: 0,
    events: 0, maxConvoy: 0, maxPayout: 0, maxCash: 0,
    clients: {}, locs: {},
  };
}

export function newGame() {
  const time = 7 * 60;
  const s = {
    v: SAVE_VERSION,
    time,
    speed: 1,
    paused: false,
    cash: 600,
    rep: 50,
    xp: 0,
    level: 1,
    perkPoints: 0,
    uid: 1,
    stock: { koc: 8, karimata: 6, spiwor: 4, menazka: 6, latarka: 3, saperka: 3, woda: 8, chleb: 5, drewno: 3 },
    faults: {},
    repairs: [],
    incoming: [],
    orders: [],
    nextOrderAt: time + 5,
    trips: [],
    loans: [],
    vehicles: [{ uid: 1, type: 'taczka', cond: 100, km: 0, trip: null, serviceUntil: 0 }],
    buildings: { magazyn: 1, warsztat: 1, biuro: 1, garaz: 1 },
    staff: {},
    auto: { dyspozytor: true },
    perks: {},
    market: null,
    weather: 'slonce',
    forecast: [],
    mods: [],
    goal: 0,
    ach: {},
    stats: emptyStats(),
    today: { income: 0, expense: 0, orders: 0 },
    history: [],
    feed: [],
    fx: [],
    event: null,
    lastEvents: [],
    nextEventAt: time + DAY * 1.1,
    nextAutoAt: 0,
    intro: true,
  };
  s.forecast = [rollWeather(), rollWeather(), rollWeather()];
  s.market = rollMarket(s);
  spawnOrder(s);
  spawnOrder(s);
  return s;
}

// Uzupełnia brakujące pola w zapisie ze starszej wersji gry.
export function migrate(saved) {
  const fresh = newGame();
  const s = { ...fresh, ...saved };
  s.stats = { ...emptyStats(), ...(saved.stats || {}) };
  s.buildings = { ...fresh.buildings, ...(saved.buildings || {}) };
  s.auto = { ...fresh.auto, ...(saved.auto || {}) };
  s.fx = [];
  s.v = SAVE_VERSION;
  return s;
}

// ---------------------------------------------------------------------------
// Wartości pochodne
// ---------------------------------------------------------------------------

export function xpNeed(level) {
  return Math.round(36 * Math.pow(level, 1.8) + 4 * Math.pow(level, 3));
}

export const hasStaff = (s, id) => !!s.staff[id];
export const hasPerk = (s, id) => !!s.perks[id];
export const buildingLevel = (s, id) => s.buildings[id] || 0;

export function buildingValue(s, id) {
  const b = BUILDING_BY_ID[id];
  const lvl = buildingLevel(s, id);
  return lvl > 0 ? b.levels[lvl - 1].value : b.base ?? 0;
}

// Wymagany poziom gracza dla kolejnego poziomu budynku.
export function buildingReqLevel(b, targetLvl) {
  return Math.max(b.lvl, b.lvl + (targetLvl - 1 - (b.start ? 1 : 0)) * 2);
}

export function getMod(s, type, key = null) {
  let m = 1;
  for (const mod of s.mods) {
    if (mod.type !== type || mod.until <= s.time) continue;
    if (mod.key && mod.key !== key) continue;
    m *= mod.mult;
  }
  return m;
}

export const hasMod = (s, type, key = null) =>
  s.mods.some((m) => m.type === type && m.until > s.time && (!m.key || m.key === key));

export function weatherOf(s) {
  const w = WEATHER_BY_ID[s.weather] || WEATHER[0];
  if (!hasPerk(s, 'meteorolog')) return w;
  return { ...w, speed: 1 - (1 - w.speed) / 2, dmg: 1 + (w.dmg - 1) / 2 };
}

export function capacity(s) {
  return Math.round(buildingValue(s, 'magazyn') * (hasPerk(s, 'kwatermistrz') ? 1.12 : 1));
}

// Każda posiadana sztuka sprzętu ma swoje miejsce na półce — także wydana i ta w naprawie.
// Dzięki temu zwrot z terenu zawsze się mieści. Zapasy zajmują miejsce tylko, gdy leżą na stanie.
export function usedSpace(s) {
  let used = 0;
  for (const id in s.stock) used += s.stock[id] * ITEM_BY_ID[id].vol;
  for (const inc of s.incoming) used += inc.qty * ITEM_BY_ID[inc.id].vol;
  const out = outCounts(s);
  for (const id in out) if (ITEM_BY_ID[id].kind === 'gear') used += out[id] * ITEM_BY_ID[id].vol;
  const bad = faultCounts(s);
  for (const id in bad) used += bad[id] * ITEM_BY_ID[id].vol;
  return used;
}

export const freeSpace = (s) => capacity(s) - usedSpace(s);
export const boardSize = (s) => buildingValue(s, 'biuro') + (hasPerk(s, 'lacznosciowiec') ? 1 : 0);
export const garageSlots = (s) => buildingValue(s, 'garaz');
export const repairSlots = (s) => buildingValue(s, 'warsztat');

export function repairSpeed(s) {
  return (1 + (buildingLevel(s, 'warsztat') - 1) * 0.15 + (hasStaff(s, 'serwisant') ? 0.25 : 0)) * getMod(s, 'repairSpeed');
}

export function loadMinutes(s) {
  return Math.max(1, Math.round(buildingValue(s, 'rampa') * (hasPerk(s, 'goniec') ? 0.5 : 1)));
}

export function fuelMult(s) {
  return (
    s.market.fuel *
    (1 - buildingValue(s, 'stacja') / 100) *
    (hasPerk(s, 'przewodnik') ? 0.85 : 1) *
    (hasStaff(s, 'szeftransportu') ? 0.9 : 1) *
    getMod(s, 'fuel')
  );
}

export function payoutMult(s) {
  return (
    (1 +
      (buildingLevel(s, 'biuro') - 1) * 0.03 +
      (hasStaff(s, 'ksiegowa') ? 0.08 : 0) +
      (hasPerk(s, 'skarbnik') ? 0.06 : 0) +
      (s.rep - 50) * 0.003) *
    getMod(s, 'payout')
  );
}

const CAT_PERK = {
  biwak: ['obozownik', 0.15],
  zapasy: ['kuchcik', 0.12],
  kuchnia: ['kuchcik', 0.12],
  narzedzia: ['pionier', 0.2],
  medyczne: ['ratownik', 0.2],
  woda: ['ratownik', 0.2],
  elektro: ['elektryk', 0.2],
  imprezy: ['organizator', 0.2],
};

function catBonus(s, cat) {
  const p = CAT_PERK[cat];
  let m = p && hasPerk(s, p[0]) ? 1 + p[1] : 1;
  if (cat === 'zapasy') m *= 1 + buildingValue(s, 'chlodnia') / 100;
  return m;
}

export function unitPrice(s, item) {
  let p = item.price * (s.market.mult[item.cat] || 1);
  if (s.market.deal && s.market.deal.id === item.id) p *= 1 - s.market.deal.off;
  if (hasStaff(s, 'zaopatrzeniowiec')) p *= 0.92;
  if (hasPerk(s, 'negocjator')) p *= 0.94;
  p *= getMod(s, 'price', item.cat);
  return Math.max(1, Math.round(p));
}

export function sellPrice(s, item) {
  const share = item.kind === 'gear' ? (hasPerk(s, 'handlarz') ? 0.6 : 0.35) : 0.5;
  return Math.max(1, Math.floor(item.price * share));
}

export function deliveryMinutes(s, item) {
  const base = item.lvl <= 3 ? 40 : 80 + item.lvl * 10;
  return Math.round(base * (hasStaff(s, 'zaopatrzeniowiec') ? 0.5 : 1) * getMod(s, 'delivery'));
}

export function repairCost(s, item) {
  return Math.max(1, Math.round(item.fix * (hasPerk(s, 'sobieradek') ? 0.8 : 1)));
}

export function scrapValue(s, item) {
  return Math.max(1, Math.round(item.price * 0.08 * (hasPerk(s, 'handlarz') ? 2 : 1)));
}

export function isItemAvailable(s, item) {
  if (item.lvl > s.level) return false;
  if (item.cold && buildingLevel(s, 'chlodnia') < 1) return false;
  return true;
}

export function isLocationOpen(s, loc) {
  if (loc.lvl > s.level) return false;
  if (loc.req) for (const b in loc.req) if (buildingLevel(s, b) < loc.req[b]) return false;
  return true;
}

export function isLocationClosed(s, loc) {
  const w = weatherOf(s);
  if (w.closed && w.closed.includes(loc.access)) return true;
  return s.mods.some((m) => m.type === 'closed' && m.key === loc.id && m.until > s.time);
}

export function canReach(vt, loc) {
  if (loc.km > vt.range) return false;
  if (vt.terrain.includes('air')) return true;
  return vt.terrain.includes(loc.access);
}

export function vehicleSpeed(s, vt, loc) {
  let v = vt.speed;
  const air = vt.terrain.includes('air');
  if (!air) v *= weatherOf(s).speed;
  if (hasPerk(s, 'tropiciel') && loc && loc.access === 'offroad') v *= 1.25;
  if (hasPerk(s, 'sternik') && vt.terrain.includes('water')) v *= 1.3;
  if (hasPerk(s, 'goniec') && vt.cap <= 20) v *= 1.2;
  if (hasStaff(s, 'szeftransportu')) v *= 1.15;
  return v * getMod(s, 'speed');
}

export function vehicleStatus(s, v) {
  if (v.trip) return 'trip';
  if (v.serviceUntil > s.time) return 'service';
  if (v.cond <= 5) return 'broken';
  return 'idle';
}

export function isGrounded(s, vt) {
  const w = weatherOf(s);
  return !!w.grounded && vt.terrain.some((t) => w.grounded.includes(t));
}

export function serviceCost(s, v) {
  const vt = VEHICLE_BY_ID[v.type];
  return Math.round(5 + vt.price * 0.1 * ((100 - v.cond) / 100) * (hasStaff(s, 'mechanik') ? 0.5 : 1));
}

export function vehicleResale(v) {
  const vt = VEHICLE_BY_ID[v.type];
  return Math.round(vt.price * 0.5 * (0.5 + v.cond / 200));
}

// Ile sztuk jest poza magazynem: w kursie, u klienta albo na rampie zwrotów.
export function outCounts(s) {
  const out = {};
  for (const t of s.trips) {
    if (t.phase !== 'out') continue;
    for (const ln of t.order.lines) out[ln.id] = (out[ln.id] || 0) + ln.qty;
  }
  for (const loan of s.loans) for (const ln of loan.lines) out[ln.id] = (out[ln.id] || 0) + ln.qty;
  return out;
}

export function faultCounts(s) {
  const bad = {};
  for (const id in s.faults) bad[id] = s.faults[id].repair + s.faults[id].broken;
  for (const r of s.repairs) bad[r.item] = (bad[r.item] || 0) + 1;
  return bad;
}

export function totals(s) {
  let available = 0;
  let out = 0;
  let broken = 0;
  for (const id in s.stock) available += s.stock[id];
  const o = outCounts(s);
  for (const id in o) if (ITEM_BY_ID[id].kind === 'gear') out += o[id];
  const f = faultCounts(s);
  for (const id in f) broken += f[id];
  return { available, out, broken };
}

export function dailyCosts(s) {
  let wages = 0;
  let upkeep = 0;
  for (const st of STAFF) if (s.staff[st.id]) wages += st.wage;
  for (const v of s.vehicles) upkeep += VEHICLE_BY_ID[v.type].upkeep;
  return { wages, upkeep, total: wages + upkeep };
}

// ---------------------------------------------------------------------------
// Drobne mutatory
// ---------------------------------------------------------------------------

function feed(s, text, meta, tag = '', color = COLOR.muted) {
  s.feed.unshift({ text, meta: `${meta} · ${fmtHour(s.time)}`, tag, color });
  if (s.feed.length > 40) s.feed.length = 40;
}

function fx(s, type, data = {}) {
  s.fx.push({ type, ...data });
}

function toast(s, text) {
  fx(s, 'toast', { text });
}

function earn(s, amount, isOrder = false) {
  s.cash += amount;
  s.today.income += amount;
  if (isOrder) s.stats.earned += amount;
  if (s.cash > s.stats.maxCash) s.stats.maxCash = s.cash;
}

function spend(s, amount) {
  s.cash -= amount;
  s.today.expense += amount;
  s.stats.spent += amount;
}

function addRep(s, delta) {
  let d = delta;
  if (d > 0) {
    d *= 1 - s.rep / 130;
    if (hasStaff(s, 'handlowiec')) d *= 1.5;
    if (hasPerk(s, 'dobryduch')) d *= 1.3;
  }
  s.rep = clamp(s.rep + d, 0, 100);
}

function addXp(s, amount) {
  s.xp += Math.max(0, Math.round(amount));
  while (s.xp >= xpNeed(s.level)) {
    s.xp -= xpNeed(s.level);
    s.level += 1;
    s.perkPoints += 1;
    const bonus = 40 * s.level;
    earn(s, bonus);
    fx(s, 'levelup', { level: s.level, bonus });
    feed(s, `Awans na poziom ${s.level}!`, 'Nowy stopień', `+${fmtMoney(bonus)}`, COLOR.green);
  }
}

function addStock(s, id, qty) {
  s.stock[id] = (s.stock[id] || 0) + qty;
}

function takeStock(s, id, qty) {
  s.stock[id] = (s.stock[id] || 0) - qty;
  if (s.stock[id] <= 0) delete s.stock[id];
}

function addFault(s, id, repair, broken) {
  if (!repair && !broken) return;
  const f = s.faults[id] || { repair: 0, broken: 0 };
  f.repair += repair;
  f.broken += broken;
  s.faults[id] = f;
}

function cleanFault(s, id) {
  const f = s.faults[id];
  if (f && f.repair <= 0 && f.broken <= 0) delete s.faults[id];
}

function addMod(s, type, key, mult, hours, label) {
  s.mods.push({ type, key, mult, until: s.time + hours * 60, label });
}

// ---------------------------------------------------------------------------
// Rynek i pogoda
// ---------------------------------------------------------------------------

function rollWeather() {
  return weighted(WEATHER, (w) => w.w).id;
}

function rollMarket(s) {
  const mult = {};
  for (const c of CATEGORIES) mult[c.id] = Math.round((0.86 + rand() * 0.3) * 100) / 100;
  const pool = ITEMS.filter((it) => isItemAvailable(s, it));
  const dealItem = pick(pool);
  return {
    mult,
    fuel: Math.round((0.85 + rand() * 0.35) * 100) / 100,
    deal: dealItem ? { id: dealItem.id, off: Math.round((0.22 + rand() * 0.18) * 100) / 100 } : null,
  };
}

// ---------------------------------------------------------------------------
// Zlecenia
// ---------------------------------------------------------------------------

function fleetCapFor(s, loc) {
  let cap = 0;
  for (const v of s.vehicles) {
    const vt = VEHICLE_BY_ID[v.type];
    if (canReach(vt, loc)) cap += vt.cap;
  }
  return cap;
}

function orderVolume(lines) {
  return lines.reduce((sum, ln) => sum + ln.qty * ITEM_BY_ID[ln.id].vol, 0);
}

function demandFor(s, cat) {
  const w = weatherOf(s);
  return ((w.demand && w.demand[cat]) || 1) * getMod(s, 'demand', cat);
}

// Bazowa wartość zlecenia: szybki wzrost na starcie, potem liniowo,
// a po 20. poziomie już tylko symbolicznie — inaczej gospodarka odlatuje.
function orderValue(level) {
  return 45 + 30 * Math.pow(Math.min(level, 8), 1.35) + 30 * Math.max(0, Math.min(level, 20) - 8) + 6 * Math.max(0, level - 20);
}

export function generateOrder(s) {
  const clients = CLIENTS.filter((cl) => {
    if (cl.lvl > s.level) return false;
    const loc = LOCATION_BY_ID[cl.loc];
    return isLocationOpen(s, loc) && !isLocationClosed(s, loc) && fleetCapFor(s, loc) > 0;
  });
  if (!clients.length) return null;
  const out = outCounts(s);
  const owned = (id) => (s.stock[id] || 0) + (out[id] || 0) > 0;

  for (let attempt = 0; attempt < 8; attempt++) {
    // Nowsi klienci trafiają się częściej, żeby świeżo odblokowane miejsca żyły.
    const cl = weighted(clients, (c) => c.w * (1 + c.lvl / (s.level + 2)));
    const loc = LOCATION_BY_ID[cl.loc];

    const trader = hasStaff(s, 'handlowiec') ? 0.05 : 0;
    const roll = rand();
    let kind = 'normal';
    const vipChance = s.level >= 4 && s.rep >= 55 ? 0.06 + trader : 0;
    const kontraktChance = s.level >= 5 ? 0.09 + trader : 0;
    const pilneChance = s.level >= 2 ? 0.18 : 0;
    if (roll < vipChance) kind = 'vip';
    else if (roll < vipChance + kontraktChance) kind = 'kontrakt';
    else if (roll < vipChance + kontraktChance + pilneChance) kind = 'pilne';
    const K = KINDS[kind];

    const value = cl.size * orderValue(s.level) * (0.7 + rand() * 0.6) * K.size;
    let lineCount = 1 + randInt(0, Math.min(3, Math.floor((s.level + 1) / 2)));
    if (kind === 'kontrakt') lineCount += 1;

    const cats = Object.keys(cl.cats);
    const chosen = [];
    for (let i = 0; i < lineCount; i++) {
      const cat = weighted(cats, (c) => cl.cats[c] * demandFor(s, c));
      const pool = ITEMS.filter((it) => it.cat === cat && isItemAvailable(s, it) && !chosen.includes(it));
      // Klienci częściej pytają o to, co baza już ma w ofercie.
      const item = weighted(pool, (it) => (owned(it.id) ? 6 : 1) * (1 + it.lvl / s.level));
      if (item) chosen.push(item);
    }
    if (!chosen.length) continue;

    const hasGear = chosen.some((it) => it.kind === 'gear');
    let days = 0;
    if (hasGear) {
      days = 1 + randInt(0, Math.min(4, 1 + Math.floor(s.level / 3)));
      if (kind === 'kontrakt') days += 2;
    }

    const share = value / chosen.length;
    // Pierwsze zlecenia nowej gry proszą tylko o tyle, ile leży na półce — żeby było od czego zacząć.
    const gentle = s.level === 1 && s.stats.orders < 4;
    let lines = chosen.map((it) => {
      const unit = it.kind === 'gear' ? it.rent * days : it.sell;
      let qty = clamp(Math.round(share / unit), 1, it.maxQty);
      if (gentle && s.stock[it.id] > 0) qty = Math.min(qty, s.stock[it.id]);
      return { id: it.id, qty };
    });

    // Zlecenie musi się zmieścić na pojazdach, którymi gracz dojedzie do klienta.
    const capLimit = fleetCapFor(s, loc);
    let vol = orderVolume(lines);
    if (vol > capLimit) {
      const f = capLimit / vol;
      lines = lines.map((ln) => ({ id: ln.id, qty: Math.max(1, Math.floor(ln.qty * f)) }));
      vol = orderVolume(lines);
      while (vol > capLimit && lines.length > 1) {
        lines.sort((a, b) => b.qty * ITEM_BY_ID[b.id].vol - a.qty * ITEM_BY_ID[a.id].vol);
        lines.shift();
        vol = orderVolume(lines);
      }
      if (vol > capLimit) continue;
    }

    let base = 0;
    for (const ln of lines) {
      const it = ITEM_BY_ID[ln.id];
      base += ln.qty * (it.kind === 'gear' ? it.rent * days : it.sell) * catBonus(s, it.cat);
    }
    const hard = loc.access === 'road' ? 1 : 1.3;
    const fee = 8 + 3.5 * loc.km * hard;
    let payout = (base * cl.pay * K.pay + fee) * payoutMult(s);
    if (kind === 'kontrakt' && hasPerk(s, 'logistyk')) payout *= 1.15;
    payout = round5(payout);

    const stretch = 1 + buildingValue(s, 'wieza') / 100;
    const hours = { normal: [14, 26], pilne: [4, 7], vip: [8, 14], kontrakt: [8, 12] }[kind];
    const window = (hours[0] + rand() * (hours[1] - hours[0])) * 60 * stretch;

    return {
      id: ++s.uid,
      client: cl.id,
      kind,
      lines,
      days,
      vol,
      payout,
      xp: Math.round((3 + 0.5 * Math.pow(payout, 0.75)) * K.xp),
      created: s.time,
      expires: s.time + window,
      accepted: false,
      // Kontrakt po przyjęciu dostaje dłuższy termin realizacji.
      term: kind === 'kontrakt' ? Math.round((30 + rand() * 24) * 60 * stretch) : 0,
    };
  }
  return null;
}

function orderInterval(s) {
  const rate =
    (1 + 0.035 * (s.level - 1)) *
    (0.7 + (s.rep / 100) * 0.6) *
    (1 + buildingValue(s, 'wieza') / 100) *
    (hasPerk(s, 'logistyk') ? 1.2 : 1) *
    getMod(s, 'demand');
  let minutes = Math.max(25, 170 / rate) * (0.6 + rand() * 0.8);
  if (isNight(s.time)) minutes *= 1.6;
  return minutes;
}

function spawnOrder(s) {
  if (s.orders.length >= boardSize(s)) return false;
  const o = generateOrder(s);
  if (!o) return false;
  s.orders.push(o);
  if (o.kind !== 'normal') fx(s, 'sound', { name: 'alert' });
  return true;
}

function failContract(s, o) {
  const penalty = Math.round(o.payout * 0.2);
  spend(s, penalty);
  addRep(s, -5);
  s.stats.kontraktyFailed += 1;
  feed(s, `Zerwany kontrakt: ${CLIENT_BY_ID[o.client].name}`, 'Kara umowna', `−${fmtMoney(penalty)}`, COLOR.orange);
  toast(s, `Kontrakt przepadł. Kara ${fmtMoney(penalty)} i renoma w dół.`);
}

export function dismissOrder(s, orderId) {
  const i = s.orders.findIndex((o) => o.id === orderId);
  if (i < 0) return { ok: false, msg: 'Nie ma takiego zlecenia.' };
  const [o] = s.orders.splice(i, 1);
  if (o.kind === 'kontrakt' && o.accepted) failContract(s, o);
  // Zwolnione miejsce na tablicy szybko zajmie kolejny klient.
  s.nextOrderAt = Math.min(s.nextOrderAt, s.time + 15 + rand() * 25);
  return { ok: true, msg: 'Zlecenie odrzucone.' };
}

export function acceptContract(s, orderId) {
  const o = s.orders.find((x) => x.id === orderId);
  if (!o || o.kind !== 'kontrakt' || o.accepted) return { ok: false, msg: 'Tego nie da się przyjąć.' };
  o.accepted = true;
  o.expires = s.time + o.term;
  return { ok: true, msg: 'Kontrakt przyjęty. Teraz trzeba dotrzymać słowa.' };
}

// ---------------------------------------------------------------------------
// Kursy
// ---------------------------------------------------------------------------

// Sprawdza zlecenie z wybranymi pojazdami. Używane przez okno wysyłki i przez dispatch().
export function planTrip(s, order, uids) {
  const cl = CLIENT_BY_ID[order.client];
  const loc = LOCATION_BY_ID[cl.loc];
  const plan = { ok: false, reason: '', cap: 0, vol: order.vol, minutes: 0, back: 0, eta: 0, fuel: 0, load: loadMinutes(s), missing: [], km: loc.km };

  for (const ln of order.lines) {
    const have = s.stock[ln.id] || 0;
    if (have < ln.qty) plan.missing.push({ id: ln.id, need: ln.qty - have });
  }

  let speed = Infinity;
  let vehicleProblem = '';
  let fuel = 0;
  for (const uid of uids) {
    const v = s.vehicles.find((x) => x.uid === uid);
    if (!v) continue;
    const vt = VEHICLE_BY_ID[v.type];
    const st = vehicleStatus(s, v);
    if (st !== 'idle') vehicleProblem = `${vt.name} nie jest gotowy do drogi.`;
    else if (!canReach(vt, loc)) vehicleProblem = `${vt.name} tam nie dojedzie.`;
    else if (isGrounded(s, vt)) vehicleProblem = `${vt.name} jest uziemiony przez pogodę.`;
    plan.cap += vt.cap;
    speed = Math.min(speed, vehicleSpeed(s, vt, loc));
    fuel += vt.cost * loc.km * 2;
  }
  plan.fuel = Math.round(fuel * fuelMult(s));
  if (uids.length && speed < Infinity) {
    plan.back = Math.max(1, Math.round((loc.km / speed) * 60));
    plan.minutes = plan.load + plan.back;
    plan.eta = s.time + plan.minutes;
  }

  if (isLocationClosed(s, loc)) plan.reason = 'Dojazd jest dziś zamknięty.';
  else if (plan.missing.length) plan.reason = 'Brakuje towaru na magazynie.';
  else if (!uids.length) plan.reason = 'Wybierz pojazd.';
  else if (vehicleProblem) plan.reason = vehicleProblem;
  else if (plan.cap < order.vol) plan.reason = 'Za mała ładowność.';
  else if (plan.eta > order.expires) plan.reason = 'Nie zdążysz przed terminem.';
  plan.ok = !plan.reason;
  return plan;
}

// Dobiera najmniejszy zestaw wolnych pojazdów, który udźwignie zlecenie i zdąży.
export function autoPickVehicles(s, order) {
  const loc = LOCATION_BY_ID[CLIENT_BY_ID[order.client].loc];
  const free = s.vehicles.filter((v) => {
    const vt = VEHICLE_BY_ID[v.type];
    return vehicleStatus(s, v) === 'idle' && canReach(vt, loc) && !isGrounded(s, vt);
  });
  const capOf = (v) => VEHICLE_BY_ID[v.type].cap;
  const single = free
    .filter((v) => capOf(v) >= order.vol)
    .sort((a, b) => capOf(a) - capOf(b))
    .find((v) => planTrip(s, order, [v.uid]).eta <= order.expires);
  if (single) return [single.uid];
  const sorted = [...free].sort((a, b) => capOf(b) - capOf(a));
  const chosen = [];
  let cap = 0;
  for (const v of sorted) {
    if (cap >= order.vol) break;
    chosen.push(v.uid);
    cap += capOf(v);
  }
  return cap >= order.vol ? chosen : [];
}

export function dispatch(s, orderId, uids) {
  const i = s.orders.findIndex((o) => o.id === orderId);
  if (i < 0) return { ok: false, msg: 'Zlecenie już nieaktualne.' };
  const order = s.orders[i];
  const plan = planTrip(s, order, uids);
  if (!plan.ok) return { ok: false, msg: plan.reason };

  for (const ln of order.lines) takeStock(s, ln.id, ln.qty);
  s.orders.splice(i, 1);
  if (plan.fuel > 0) {
    spend(s, plan.fuel);
    s.stats.fuel += plan.fuel;
  }
  const trip = {
    id: ++s.uid,
    order,
    loc: CLIENT_BY_ID[order.client].loc,
    vehs: [...uids],
    start: s.time,
    arrive: s.time + plan.minutes,
    back: s.time + plan.minutes + plan.back,
    backMin: plan.back,
    phase: 'out',
    km: plan.km,
  };
  for (const uid of uids) s.vehicles.find((v) => v.uid === uid).trip = trip.id;
  s.trips.push(trip);
  if (uids.length > s.stats.maxConvoy) s.stats.maxConvoy = uids.length;
  fx(s, 'sound', { name: 'go' });
  return { ok: true, msg: `Kurs wyruszył → ${LOCATION_BY_ID[trip.loc].name}` };
}

function linesText(lines) {
  const parts = lines.slice(0, 2).map((ln) => `${ln.qty}× ${ITEM_BY_ID[ln.id].name}`);
  if (lines.length > 2) parts.push(`+${lines.length - 2}`);
  return parts.join(', ');
}

function deliver(s, trip) {
  const o = trip.order;
  const cl = CLIENT_BY_ID[o.client];
  earn(s, o.payout, true);
  s.stats.orders += 1;
  s.today.orders += 1;
  if (o.kind === 'pilne') s.stats.pilne += 1;
  if (o.kind === 'vip') s.stats.vip += 1;
  if (o.kind === 'kontrakt') s.stats.kontrakty += 1;
  if (o.payout > s.stats.maxPayout) s.stats.maxPayout = o.payout;
  s.stats.clients[o.client] = (s.stats.clients[o.client] || 0) + 1;
  s.stats.locs[cl.loc] = (s.stats.locs[cl.loc] || 0) + 1;
  for (const ln of o.lines) s.stats.delivered += ln.qty;
  addRep(s, KINDS[o.kind].rep);

  const gear = o.lines.filter((ln) => ITEM_BY_ID[ln.id].kind === 'gear');
  if (gear.length) {
    s.loans.push({ id: ++s.uid, client: o.client, lines: gear.map((ln) => ({ ...ln })), since: s.time, until: s.time + o.days * DAY, state: 'field' });
  }
  feed(s, `${linesText(o.lines)} → ${cl.name}`, KINDS[o.kind].label, `+${fmtMoney(o.payout)}`, COLOR.green);
  fx(s, 'coin', { amount: o.payout, text: `${cl.icon} ${cl.name}: +${fmtMoney(o.payout)}` });
  addXp(s, o.xp);

  // Zużycie floty. Zajeżdżony pojazd potrafi stanąć w drodze powrotnej.
  const wearMult = (hasPerk(s, 'mechanik') ? 0.7 : 1) * (hasStaff(s, 'mechanik') ? 0.7 : 1);
  for (const uid of trip.vehs) {
    const v = s.vehicles.find((x) => x.uid === uid);
    if (!v) continue;
    const vt = VEHICLE_BY_ID[v.type];
    v.cond = Math.max(0, v.cond - trip.km * 2 * vt.wear * wearMult);
    v.km += trip.km * 2;
    s.stats.km += trip.km * 2;
    if (v.cond < 25 && rand() < 0.25) {
      trip.back += 120;
      trip.broke = true;
      feed(s, `${vt.name} stanął na trasie`, 'Awaria', '+2 h', COLOR.orange);
    }
  }
  trip.phase = 'back';
}

// ---------------------------------------------------------------------------
// Zwroty i warsztat
// ---------------------------------------------------------------------------

export function acceptReturn(s, loanId, silent = false) {
  const i = s.loans.findIndex((l) => l.id === loanId);
  if (i < 0) return { ok: false, msg: 'Nie ma takiego zwrotu.' };
  const loan = s.loans[i];
  if (loan.state !== 'ramp') return { ok: false, msg: 'Sprzęt jest jeszcze u klienta.' };

  const cl = CLIENT_BY_ID[loan.client];
  const days = Math.max(1, Math.round((loan.until - loan.since) / DAY));
  const dmgBase =
    cl.rough *
    (loan.dmgMult || 1) *
    (hasPerk(s, 'gospodarz') ? 0.85 : 1) *
    (hasStaff(s, 'bhp') ? 0.8 : 1) *
    (1 + 0.12 * (days - 1));
  const lostChance = 0.012 * cl.rough * (buildingLevel(s, 'monitoring') >= 2 ? 0.5 : 1);
  const scrapShare = hasPerk(s, 'zlotaraczka') ? 0.06 : 0.18;
  const insured = hasMod(s, 'insurance');

  let good = 0;
  let damaged = 0;
  let broken = 0;
  let lost = 0;
  let refund = 0;
  for (const ln of loan.lines) {
    const it = ITEM_BY_ID[ln.id];
    let ok = 0;
    let rep = 0;
    let brk = 0;
    for (let n = 0; n < ln.qty; n++) {
      const r = rand();
      if (r < lostChance) {
        lost += 1;
        refund += Math.round(it.price * 0.7);
      } else if (r < lostChance + Math.min(0.6, it.dmg * dmgBase)) {
        if (rand() < scrapShare) {
          brk += 1;
          if (insured) refund += it.price;
        } else rep += 1;
      } else ok += 1;
    }
    if (ok) addStock(s, ln.id, ok);
    addFault(s, ln.id, rep, brk);
    good += ok;
    damaged += rep;
    broken += brk;
  }
  s.loans.splice(i, 1);
  s.stats.returns += 1;
  s.stats.damaged += damaged + broken;
  s.stats.lost += lost;
  if (refund > 0) earn(s, refund);

  const bad = damaged + broken;
  const tag = bad || lost ? `${bad} uszk.${lost ? `, ${lost} zgub.` : ''}` : 'komplet';
  feed(s, `Zwrot: ${linesText(loan.lines)}`, cl.name, tag, bad || lost ? COLOR.orange : COLOR.blue);
  let msg = `Przyjęto ${good} szt.`;
  if (damaged) msg += ` ${damaged} do naprawy.`;
  if (broken) msg += ` ${broken} zniszczone.`;
  if (lost) msg += ` ${lost} zgubione.`;
  if (refund) msg += ` Odszkodowanie ${fmtMoney(refund)}.`;
  if (!silent) fx(s, 'sound', { name: bad ? 'bad' : 'ok' });
  return { ok: true, msg };
}

export function acceptAllReturns(s) {
  let done = 0;
  for (const loan of [...s.loans]) {
    if (loan.state === 'ramp' && acceptReturn(s, loan.id, true).ok) done += 1;
  }
  if (!done) return { ok: false, msg: 'Rampa jest pusta.' };
  fx(s, 'sound', { name: 'ok' });
  return { ok: true, msg: `Przyjęto zwroty: ${done}.` };
}

export function startRepair(s, itemId) {
  const f = s.faults[itemId];
  if (!f || f.repair <= 0) return { ok: false, msg: 'Nie ma czego naprawiać.' };
  if (s.repairs.length >= repairSlots(s)) return { ok: false, msg: 'Wszystkie stanowiska w warsztacie zajęte.' };
  const it = ITEM_BY_ID[itemId];
  const cost = repairCost(s, it);
  if (s.cash < cost) return { ok: false, msg: `Naprawa kosztuje ${fmtMoney(cost)}.` };
  spend(s, cost);
  f.repair -= 1;
  cleanFault(s, itemId);
  s.repairs.push({ id: ++s.uid, item: itemId, left: it.fixMin, total: it.fixMin });
  return { ok: true, msg: `${it.name} trafia na stół.` };
}

export function scrapItem(s, itemId) {
  const f = s.faults[itemId];
  if (!f || f.broken <= 0) return { ok: false, msg: 'Nie ma czego złomować.' };
  const it = ITEM_BY_ID[itemId];
  const value = scrapValue(s, it) * f.broken;
  s.stats.scrapped += f.broken;
  earn(s, value);
  const n = f.broken;
  f.broken = 0;
  cleanFault(s, itemId);
  return { ok: true, msg: `Zezłomowano ${n} szt. za ${fmtMoney(value)}.` };
}

// ---------------------------------------------------------------------------
// Hurtownia
// ---------------------------------------------------------------------------

export function buyItem(s, itemId, qty) {
  const it = ITEM_BY_ID[itemId];
  if (!it || qty <= 0) return { ok: false, msg: 'Nie ma takiego towaru.' };
  if (!isItemAvailable(s, it)) return { ok: false, msg: 'Ten towar nie jest jeszcze dostępny.' };
  const cost = unitPrice(s, it) * qty;
  if (s.cash < cost) return { ok: false, msg: `Potrzebujesz ${fmtMoney(cost)}.` };
  if (qty * it.vol > freeSpace(s)) return { ok: false, msg: 'Za mało miejsca w magazynie.' };
  spend(s, cost);
  s.stats.bought += qty;
  const minutes = deliveryMinutes(s, it);
  s.incoming.push({ uid: ++s.uid, id: itemId, qty, at: s.time + minutes, total: minutes });
  fx(s, 'sound', { name: 'buy' });
  return { ok: true, msg: `Zamówiono ${qty}× ${it.name}. Dostawa za ${minutes} min.` };
}

export function sellItem(s, itemId, qty) {
  const it = ITEM_BY_ID[itemId];
  const have = s.stock[itemId] || 0;
  if (!it || qty <= 0 || have < qty) return { ok: false, msg: 'Nie masz tyle na stanie.' };
  const value = sellPrice(s, it) * qty;
  takeStock(s, itemId, qty);
  earn(s, value);
  return { ok: true, msg: `Sprzedano ${qty}× ${it.name} za ${fmtMoney(value)}.` };
}

// ---------------------------------------------------------------------------
// Flota, budynki, kadra, sprawności
// ---------------------------------------------------------------------------

function reqsMet(s, req) {
  if (!req) return true;
  for (const b in req) if (buildingLevel(s, b) < req[b]) return false;
  return true;
}

export function buyVehicle(s, typeId) {
  const vt = VEHICLE_BY_ID[typeId];
  if (!vt) return { ok: false, msg: 'Nie ma takiego pojazdu.' };
  if (vt.lvl > s.level) return { ok: false, msg: `Dostępne od poziomu ${vt.lvl}.` };
  if (!reqsMet(s, vt.req)) {
    const b = Object.keys(vt.req)[0];
    return { ok: false, msg: `Wymaga: ${BUILDING_BY_ID[b].name} (poz. ${vt.req[b]}).` };
  }
  if (s.vehicles.length >= garageSlots(s)) return { ok: false, msg: 'Brak miejsca w garażu — rozbuduj go.' };
  if (s.cash < vt.price) return { ok: false, msg: `Potrzebujesz ${fmtMoney(vt.price)}.` };
  spend(s, vt.price);
  s.vehicles.push({ uid: ++s.uid, type: typeId, cond: 100, km: 0, trip: null, serviceUntil: 0 });
  feed(s, `Nowy pojazd: ${vt.name}`, 'Flota', `−${fmtMoney(vt.price)}`, COLOR.blue);
  fx(s, 'sound', { name: 'buy' });
  return { ok: true, msg: `${vt.icon} ${vt.name} stoi w garażu!` };
}

export function sellVehicle(s, uid) {
  const i = s.vehicles.findIndex((v) => v.uid === uid);
  if (i < 0) return { ok: false, msg: 'Nie ma takiego pojazdu.' };
  const v = s.vehicles[i];
  if (v.trip) return { ok: false, msg: 'Pojazd jest w trasie.' };
  if (s.vehicles.length <= 1) return { ok: false, msg: 'To twój ostatni pojazd.' };
  const value = vehicleResale(v);
  s.vehicles.splice(i, 1);
  earn(s, value);
  return { ok: true, msg: `Sprzedano za ${fmtMoney(value)}.` };
}

export function serviceVehicle(s, uid) {
  const v = s.vehicles.find((x) => x.uid === uid);
  if (!v) return { ok: false, msg: 'Nie ma takiego pojazdu.' };
  if (v.trip) return { ok: false, msg: 'Pojazd jest w trasie.' };
  if (v.serviceUntil > s.time) return { ok: false, msg: 'Pojazd już jest w serwisie.' };
  if (v.cond >= 99.5) return { ok: false, msg: 'Pojazd jest w idealnym stanie.' };
  const cost = serviceCost(s, v);
  if (s.cash < cost) return { ok: false, msg: `Serwis kosztuje ${fmtMoney(cost)}.` };
  spend(s, cost);
  v.cond = 100;
  v.serviceUntil = s.time + (hasStaff(s, 'mechanik') ? 90 : 180);
  return { ok: true, msg: `${VEHICLE_BY_ID[v.type].name} pojechał do serwisu.` };
}

export function upgradeBuilding(s, id) {
  const b = BUILDING_BY_ID[id];
  if (!b) return { ok: false, msg: 'Nie ma takiego budynku.' };
  const lvl = buildingLevel(s, id);
  if (lvl >= b.levels.length) return { ok: false, msg: 'To już najwyższy poziom.' };
  const need = buildingReqLevel(b, lvl + 1);
  if (s.level < need) return { ok: false, msg: `Dostępne od poziomu ${need}.` };
  const next = b.levels[lvl];
  if (s.cash < next.cost) return { ok: false, msg: `Potrzebujesz ${fmtMoney(next.cost)}.` };
  spend(s, next.cost);
  s.buildings[id] = lvl + 1;
  feed(s, `${b.name}: ${next.name}`, 'Rozbudowa', `−${fmtMoney(next.cost)}`, COLOR.blue);
  fx(s, 'sound', { name: 'build' });
  return { ok: true, msg: `${b.icon} ${next.name} gotowe!` };
}

export function hireStaff(s, id) {
  const st = STAFF_BY_ID[id];
  if (!st || s.staff[id]) return { ok: false, msg: 'Ta osoba już u was pracuje.' };
  if (st.lvl > s.level) return { ok: false, msg: `Dostępne od poziomu ${st.lvl}.` };
  if (s.cash < st.fee) return { ok: false, msg: `Potrzebujesz ${fmtMoney(st.fee)} na start.` };
  spend(s, st.fee);
  s.staff[id] = true;
  feed(s, `Zatrudniono: ${st.name}`, 'Kadra', `${fmtMoney(st.wage)}/dzień`, COLOR.blue);
  fx(s, 'sound', { name: 'buy' });
  return { ok: true, msg: `${st.icon} ${st.name} dołącza do kadry.` };
}

export function fireStaff(s, id) {
  if (!s.staff[id]) return { ok: false, msg: 'Nikt taki u was nie pracuje.' };
  delete s.staff[id];
  return { ok: true, msg: `${STAFF_BY_ID[id].name} odchodzi z bazy.` };
}

export function buyPerk(s, id) {
  const p = PERK_BY_ID[id];
  if (!p || s.perks[id]) return { ok: false, msg: 'Tę sprawność już masz.' };
  if (s.perkPoints < p.cost) return { ok: false, msg: 'Za mało punktów sprawności.' };
  s.perkPoints -= p.cost;
  s.perks[id] = true;
  fx(s, 'sound', { name: 'levelup' });
  return { ok: true, msg: `${p.icon} Sprawność „${p.name}” zdobyta!` };
}

export function setAuto(s, id, on) {
  s.auto[id] = !!on;
  return { ok: true, msg: on ? 'Automat włączony.' : 'Automat wyłączony.' };
}

// ---------------------------------------------------------------------------
// Zdarzenia losowe
// ---------------------------------------------------------------------------

function eventApi(s) {
  const scale = (n) => Math.round((n * (1 + (s.level - 1) * 0.4)) / 5) * 5;
  const stockIds = (pred) => Object.keys(s.stock).filter((id) => s.stock[id] > 0 && pred(ITEM_BY_ID[id]));
  return {
    s,
    rand,
    randInt,
    scale,
    zl: fmtMoney,
    cash: (n) => (n >= 0 ? earn(s, n) : spend(s, -n)),
    rep: (n) => addRep(s, n),
    xp: (n) => addXp(s, n),
    has: (id) => hasStaff(s, id),
    give: (id, qty) => addStock(s, id, qty),
    take: (id, qty) => {
      if ((s.stock[id] || 0) < qty) return false;
      takeStock(s, id, qty);
      return true;
    },
    mod: (type, key, mult, hours, label) => addMod(s, type, key, mult, hours, label),
    pickItem: (pred) => pick(ITEMS.filter((it) => isItemAvailable(s, it) && pred(it))) || ITEM_BY_ID.koc,
    pickCat: () => pick(CATEGORIES.filter((c) => ITEMS.some((it) => it.cat === c.id && isItemAvailable(s, it)))),
    faultCount: () => Object.values(faultCounts(s)).reduce((a, b) => a + b, 0),
    // Usuwa z magazynu ułamek sztuk pasujących do warunku. Zwraca liczbę straconych.
    loseStock: (pred, frac) => {
      let lost = 0;
      for (const id of stockIds(pred)) {
        const n = Math.min(s.stock[id], Math.ceil(s.stock[id] * frac));
        if (n > 0) {
          takeStock(s, id, n);
          lost += n;
        }
      }
      return lost;
    },
    // Przenosi sprzęt z magazynu do warsztatu: `count` losowych sztuk albo ułamek pasujących.
    breakStock: (count, pred = (x) => x.kind === 'gear', frac = 0) => {
      let moved = 0;
      const ids = stockIds((x) => x.kind === 'gear' && pred(x));
      if (frac > 0) {
        for (const id of ids) {
          const n = Math.min(s.stock[id], Math.ceil(s.stock[id] * frac));
          takeStock(s, id, n);
          addFault(s, id, n, 0);
          moved += n;
        }
        return moved;
      }
      for (let n = 0; n < count && ids.length; n++) {
        const id = pick(ids);
        if (!(s.stock[id] > 0)) continue;
        takeStock(s, id, 1);
        addFault(s, id, 1, 0);
        moved += 1;
      }
      return moved;
    },
    freeRepairs: (max) => {
      let done = 0;
      for (const id of Object.keys(s.faults)) {
        while (s.faults[id] && s.faults[id].repair > 0 && done < max) {
          s.faults[id].repair -= 1;
          addStock(s, id, 1);
          s.stats.repairs += 1;
          done += 1;
        }
        cleanFault(s, id);
      }
      return done;
    },
    vehDamage: (amount) => {
      const v = pick(s.vehicles);
      v.cond = Math.max(0, v.cond - amount);
      return VEHICLE_BY_ID[v.type].name;
    },
    worstVehicle: () => Math.min(...s.vehicles.map((v) => v.cond)),
    closeLocation: (hours) => {
      const open = LOCATIONS.filter((l) => isLocationOpen(s, l) && l.access === 'road' && l.km > 2);
      if (!open.length) return null;
      const loc = pick(open);
      addMod(s, 'closed', loc.id, 1, hours, `Zamknięty dojazd: ${loc.name}`);
      return loc.name;
    },
  };
}

function triggerEvent(s) {
  const pool = EVENTS.filter((e) => (e.lvl || 1) <= s.level && !s.lastEvents.includes(e.id) && (!e.when || e.when(s)));
  if (!pool.length) {
    s.nextEventAt = s.time + 120;
    return;
  }
  const ev = pick(pool);
  s.event = { id: ev.id, result: null };
  s.lastEvents.push(ev.id);
  if (s.lastEvents.length > 8) s.lastEvents.shift();
  fx(s, 'sound', { name: 'alert' });
}

export function eventChoices(s) {
  if (!s.event) return [];
  const api = eventApi(s);
  return EVENT_BY_ID[s.event.id].choices.map((c) => ({ label: c.label, hint: c.hint ? c.hint(api) : '' }));
}

export function chooseEvent(s, index) {
  if (!s.event || s.event.result) return { ok: false, msg: '' };
  const ev = EVENT_BY_ID[s.event.id];
  const choice = ev.choices[index];
  if (!choice) return { ok: false, msg: '' };
  const result = choice.run(eventApi(s));
  s.event.result = result;
  s.stats.events += 1;
  feed(s, ev.title, 'Zdarzenie', ev.icon, COLOR.amber);
  return { ok: true, msg: '' };
}

export function closeEvent(s) {
  s.event = null;
  s.nextEventAt = s.time + DAY * (0.8 + rand() * 1.2);
  return { ok: true, msg: '' };
}

// ---------------------------------------------------------------------------
// Zadania i odznaki
// ---------------------------------------------------------------------------

export function goalProgress(s) {
  const g = GOALS[s.goal];
  if (!g) return null;
  const [cur, max] = g.prog(s);
  return { goal: g, cur: Math.min(cur, max), max, index: s.goal, count: GOALS.length };
}

function checkGoals(s) {
  let g = GOALS[s.goal];
  while (g) {
    const [cur, max] = g.prog(s);
    if (cur < max) break;
    s.goal += 1;
    earn(s, g.cash);
    addXp(s, Math.min(g.cash * 0.15, xpNeed(s.level) * 0.25));
    feed(s, `Zadanie: ${g.title}`, 'Wykonane', `+${fmtMoney(g.cash)}`, COLOR.green);
    fx(s, 'goal', { title: g.title, cash: g.cash });
    g = GOALS[s.goal];
  }
}

function checkAchievements(s) {
  for (const a of ACHIEVEMENTS) {
    if (s.ach[a.id]) continue;
    const [cur, max] = a.prog(s);
    if (cur < max) continue;
    s.ach[a.id] = dayOf(s.time);
    earn(s, a.cash);
    feed(s, `Odznaka: ${a.name}`, a.desc, `+${fmtMoney(a.cash)}`, COLOR.amber);
    fx(s, 'ach', { name: a.name, icon: a.icon, cash: a.cash });
  }
}

// ---------------------------------------------------------------------------
// Doba i tydzień
// ---------------------------------------------------------------------------

function weeklyReport(s) {
  const week = s.history.slice(-7);
  const income = week.reduce((a, d) => a + d.income, 0);
  const expense = week.reduce((a, d) => a + d.expense, 0);
  const orders = week.reduce((a, d) => a + d.orders, 0);
  const profit = income - expense;
  let grade = 'C';
  if (profit > 0 && s.rep >= 45) grade = 'B';
  if (profit > 0 && s.rep >= 65 && orders >= 30) grade = 'A';
  if (profit > 0 && s.rep >= 85 && orders >= 60) grade = 'S';
  const bonus = { S: 150, A: 90, B: 45, C: 0 }[grade] * s.level;
  if (bonus) earn(s, bonus);
  fx(s, 'report', { week: Math.floor(dayOf(s.time) / 7), income, expense, orders, profit, grade, bonus, rep: Math.round(s.rep) });
}

function newDay(s) {
  const costs = dailyCosts(s);
  if (costs.total > 0) {
    spend(s, costs.total);
    s.stats.wages += costs.wages;
    feed(s, 'Koszty stałe', `Pensje ${fmtMoney(costs.wages)}, flota ${fmtMoney(costs.upkeep)}`, `−${fmtMoney(costs.total)}`, COLOR.orange);
  }
  if (s.cash < 0) {
    const interest = Math.ceil(-s.cash * 0.03);
    spend(s, interest);
    // Przy dużym długu najdroższy pracownik odchodzi — nie ma z czego płacić.
    if (-s.cash > 1500 + s.level * 800) {
      const hired = STAFF.filter((st) => s.staff[st.id]).sort((a, b) => b.wage - a.wage);
      if (hired.length) {
        delete s.staff[hired[0].id];
        toast(s, `${hired[0].name} odchodzi — brak pieniędzy na pensje.`);
      }
    }
  }
  s.history.push({ day: dayOf(s.time) - 1, ...s.today });
  if (s.history.length > 28) s.history.shift();
  s.today = { income: 0, expense: 0, orders: 0 };

  s.weather = s.forecast.shift() || rollWeather();
  while (s.forecast.length < 3) s.forecast.push(rollWeather());
  s.market = rollMarket(s);
  const w = WEATHER_BY_ID[s.weather];
  if (w.note) toast(s, `${w.icon} ${w.name}: ${w.note}`);
  if ((dayOf(s.time) - 1) % 7 === 0) weeklyReport(s);
  fx(s, 'save');
}

// ---------------------------------------------------------------------------
// Automaty kadry
// ---------------------------------------------------------------------------

function runAutomation(s) {
  if (hasStaff(s, 'magazynier')) {
    for (const loan of [...s.loans]) if (loan.state === 'ramp') acceptReturn(s, loan.id, true);
  }
  if (hasStaff(s, 'serwisant')) {
    const ids = Object.keys(s.faults).sort((a, b) => ITEM_BY_ID[b].price - ITEM_BY_ID[a].price);
    for (const id of ids) {
      while (s.faults[id] && s.faults[id].repair > 0 && s.repairs.length < repairSlots(s)) {
        if (!startRepair(s, id).ok) break;
      }
    }
  }
  if (hasStaff(s, 'mechanik')) {
    for (const v of s.vehicles) {
      if (vehicleStatus(s, v) === 'idle' && v.cond < 55 && s.cash >= serviceCost(s, v) * 2) serviceVehicle(s, v.uid);
    }
  }
  if (hasStaff(s, 'dyspozytor') && s.auto.dyspozytor) {
    const sorted = [...s.orders].sort((a, b) => b.payout - a.payout);
    for (const o of sorted) {
      const uids = autoPickVehicles(s, o);
      if (uids.length && planTrip(s, o, uids).ok) dispatch(s, o.id, uids);
    }
  }
}

// ---------------------------------------------------------------------------
// Krok symulacji
// ---------------------------------------------------------------------------

function step(s, dt) {
  const prevDay = Math.floor(s.time / DAY);
  s.time += dt;
  if (Math.floor(s.time / DAY) > prevDay) newDay(s);

  // Dostawy z hurtowni
  for (let i = s.incoming.length - 1; i >= 0; i--) {
    const inc = s.incoming[i];
    if (inc.at > s.time) continue;
    s.incoming.splice(i, 1);
    addStock(s, inc.id, inc.qty);
    feed(s, `Dostawa: ${inc.qty}× ${ITEM_BY_ID[inc.id].name}`, 'Hurtownia', 'na stanie', COLOR.blue);
  }

  // Kursy
  for (let i = s.trips.length - 1; i >= 0; i--) {
    const t = s.trips[i];
    if (t.phase === 'out' && s.time >= t.arrive) deliver(s, t);
    if (t.phase === 'back' && s.time >= t.back) {
      for (const uid of t.vehs) {
        const v = s.vehicles.find((x) => x.uid === uid);
        if (v) v.trip = null;
      }
      s.trips.splice(i, 1);
    }
  }

  // Wypożyczenia: sprzęt w terenie niszczy się mocniej w złą pogodę, potem wraca na rampę.
  const dmgNow = weatherOf(s).dmg * getMod(s, 'dmg');
  for (const loan of s.loans) {
    if (loan.state !== 'field') continue;
    const span = Math.max(1, loan.until - loan.since);
    loan.dmgMult = (loan.dmgMult || 0) + (dmgNow * dt) / span;
    if (s.time >= loan.until) {
      loan.state = 'ramp';
      loan.dmgMult = Math.max(0.5, loan.dmgMult);
      fx(s, 'sound', { name: 'ramp' });
    }
  }

  // Warsztat
  const speed = repairSpeed(s);
  for (let i = s.repairs.length - 1; i >= 0; i--) {
    const r = s.repairs[i];
    r.left -= dt * speed;
    if (r.left > 0) continue;
    s.repairs.splice(i, 1);
    addStock(s, r.item, 1);
    s.stats.repairs += 1;
  }

  // Zlecenia
  for (let i = s.orders.length - 1; i >= 0; i--) {
    const o = s.orders[i];
    if (o.expires > s.time) continue;
    s.orders.splice(i, 1);
    if (o.kind === 'kontrakt' && o.accepted) failContract(s, o);
    else s.stats.expired += 1;
  }
  if (s.time >= s.nextOrderAt) {
    const spawned = spawnOrder(s);
    s.nextOrderAt = s.time + (spawned ? orderInterval(s) : 20);
  }

  // Wygasłe efekty
  if (s.mods.length) s.mods = s.mods.filter((m) => m.until > s.time);

  if (s.time >= s.nextAutoAt) {
    s.nextAutoAt = s.time + 10;
    runAutomation(s);
    checkGoals(s);
    checkAchievements(s);
  }

  if (!s.event && s.time >= s.nextEventAt) triggerEvent(s);
}

// Przesuwa grę o `minutes` minut gry. Długie skoki dzielone są na krótkie kroki.
export function tick(s, minutes) {
  let left = minutes;
  while (left > 0 && !s.event) {
    const dt = Math.min(5, left);
    step(s, dt);
    left -= dt;
  }
}

// Odświeża zadania i odznaki od razu po akcji gracza (bez czekania na krok automatu).
export function afterAction(s) {
  checkGoals(s);
  checkAchievements(s);
}
