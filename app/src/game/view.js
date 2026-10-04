// Tłumaczy stan silnika na gotowe do wyświetlenia dane dla komponentów.

import { ITEM_BY_ID, CATEGORY_BY_ID } from './data/items.js';
import { BASE, LOCATIONS, LOCATION_BY_ID, CLIENTS, CLIENT_BY_ID, ACCESS_LABEL } from './data/world.js';
import { VEHICLE_BY_ID, TERRAIN_LABEL } from './data/vehicles.js';
import { DAY, fmtMoney, fmtDur, fmtHour, dayOf } from './format.js';
import {
  KINDS, isLocationOpen, isLocationClosed, canReach, isGrounded, vehicleStatus, vehicleSpeed,
  serviceCost, vehicleResale, unitPrice, repairCost, scrapValue, goalProgress,
} from './engine.js';

const daysLabel = (n) => (n === 1 ? '1 dzień' : `${n} dni`);

export function orderView(s, o) {
  const cl = CLIENT_BY_ID[o.client];
  const loc = LOCATION_BY_ID[cl.loc];
  const lines = o.lines.map((ln) => {
    const it = ITEM_BY_ID[ln.id];
    const have = s.stock[ln.id] || 0;
    return { id: ln.id, icon: it.icon, name: it.name, qty: ln.qty, have, ok: have >= ln.qty };
  });
  const left = o.expires - s.time;
  const waiting = o.kind === 'kontrakt' && !o.accepted;
  return {
    id: o.id,
    icon: cl.icon,
    client: cl.name,
    place: loc.name,
    km: loc.km,
    kind: o.kind,
    kindLabel: KINDS[o.kind].label + (o.accepted ? ' ✓' : ''),
    lines,
    info: `${o.days ? `wynajem na ${daysLabel(o.days)}` : 'dostawa zapasów'} · ${o.vol} j.m.`,
    left: fmtDur(left) + (waiting ? ' na decyzję' : ''),
    urgent: left < 120,
    payout: fmtMoney(o.payout),
    ready: lines.every((l) => l.ok),
    accepted: o.accepted,
    canAccept: waiting,
  };
}

function linesNames(lines) {
  const names = lines.slice(0, 2).map((ln) => ITEM_BY_ID[ln.id].name);
  if (lines.length > 2) names.push(`+${lines.length - 2}`);
  return names.join(', ');
}

export function loanView(s, loan) {
  const cl = CLIENT_BY_ID[loan.client];
  const qty = loan.lines.reduce((sum, ln) => sum + ln.qty, 0);
  const span = Math.max(1, loan.until - loan.since);
  return {
    id: loan.id,
    qty,
    item: linesNames(loan.lines),
    who: cl.name,
    date: `dnia ${dayOf(loan.since)}, ${fmtHour(loan.since)}`,
    ready: loan.state === 'ramp',
    progress: loan.state === 'ramp' ? null : (s.time - loan.since) / span,
    left: fmtDur(loan.until - s.time),
  };
}

export function tripView(s, t) {
  const loc = LOCATION_BY_ID[t.loc];
  const cl = CLIENT_BY_ID[t.order.client];
  const icons = t.vehs.map((uid) => {
    const v = s.vehicles.find((x) => x.uid === uid);
    return v ? VEHICLE_BY_ID[v.type].icon : '';
  });
  const returning = t.phase === 'back';
  const loading = !returning && s.time < t.arrive - t.backMin;
  const progress = returning ? (s.time - t.arrive) / Math.max(1, t.back - t.arrive) : (s.time - t.start) / Math.max(1, t.arrive - t.start);
  return {
    id: t.id,
    icon: icons.join(''),
    title: returning ? `Powrót z: ${loc.name}` : `${cl.name}`,
    meta: returning ? (t.broke ? 'awaria na trasie!' : 'pusty kurs do bazy') : loading ? 'załadunek na rampie' : `w drodze · +${fmtMoney(t.order.payout)}`,
    progress,
    returning,
    left: fmtDur((returning ? t.back : t.arrive) - s.time),
  };
}

export function mapView(s) {
  const orders = {};
  for (const o of s.orders) {
    const id = CLIENT_BY_ID[o.client].loc;
    orders[id] = (orders[id] || 0) + 1;
  }
  const loans = {};
  for (const l of s.loans) {
    const id = CLIENT_BY_ID[l.client].loc;
    loans[id] = (loans[id] || 0) + 1;
  }
  const locations = LOCATIONS.map((loc) => ({
    ...loc,
    open: isLocationOpen(s, loc),
    closed: isLocationOpen(s, loc) && isLocationClosed(s, loc),
    orders: orders[loc.id] || 0,
    loans: loans[loc.id] || 0,
  }));
  const trips = s.trips.map((t) => {
    const v = s.vehicles.find((x) => x.uid === t.vehs[0]);
    const returning = t.phase === 'back';
    let f;
    if (returning) f = 1 - (s.time - t.arrive) / Math.max(1, t.back - t.arrive);
    else f = (s.time - (t.arrive - t.backMin)) / Math.max(1, t.backMin);
    return { id: t.id, loc: t.loc, icon: v ? VEHICLE_BY_ID[v.type].icon : '📦', returning, f: Math.max(0, Math.min(1, f)) };
  });
  return { base: BASE, locations, trips };
}

// Opis miejsca zaznaczonego na mapie.
export function locationInfo(s, id) {
  if (id === 'baza') {
    return { icon: BASE.icon, name: BASE.name, lines: ['Tu stoi magazyn, warsztat i cała flota.'], open: true };
  }
  const loc = LOCATION_BY_ID[id];
  if (!loc) return null;
  const open = isLocationOpen(s, loc);
  const clients = CLIENTS.filter((c) => c.loc === id);
  const lines = [`${loc.km} km od bazy · dojazd: ${ACCESS_LABEL[loc.access]}`];
  if (!open) {
    lines.push(s.level < loc.lvl ? `Odblokuje się na poziomie ${loc.lvl}.` : 'Wymaga przystani w bazie.');
  } else {
    lines.push('Klienci: ' + clients.map((c) => (c.lvl <= s.level ? c.name : `??? (poz. ${c.lvl})`)).join(', '));
    const reach = s.vehicles.some((v) => canReach(VEHICLE_BY_ID[v.type], loc));
    if (!reach) lines.push('⚠️ Żaden z twoich pojazdów tu nie dojedzie.');
    if (isLocationClosed(s, loc)) lines.push('⛔ Dojazd chwilowo zamknięty.');
  }
  return { icon: loc.icon, name: loc.name, lines, open };
}

export function itemView(s, it, out, bad, locked = null) {
  const avail = s.stock[it.id] || 0;
  const o = it.kind === 'gear' ? out[it.id] || 0 : 0;
  const b = bad[it.id] || 0;
  const incoming = s.incoming.filter((x) => x.id === it.id).reduce((sum, x) => sum + x.qty, 0);
  const deal = s.market.deal && s.market.deal.id === it.id ? Math.round(s.market.deal.off * 100) : null;
  return {
    id: it.id,
    icon: it.icon,
    name: it.name,
    category: CATEGORY_BY_ID[it.cat].name,
    total: avail + o + b,
    avail,
    out: o,
    bad: b,
    hasOut: o > 0,
    hasBad: b > 0,
    incoming,
    price: fmtMoney(unitPrice(s, it)),
    deal: locked ? null : deal,
    locked,
  };
}

export function faultView(s, id) {
  const it = ITEM_BY_ID[id];
  const f = s.faults[id];
  return {
    id,
    icon: it.icon,
    name: it.name,
    repair: f.repair,
    broken: f.broken,
    hasRepair: f.repair > 0,
    hasBroken: f.broken > 0,
    cost: fmtMoney(repairCost(s, it)),
    scrap: `+${fmtMoney(scrapValue(s, it) * f.broken)}`,
  };
}

const STATUS_LABEL = { idle: 'gotowy', trip: 'w trasie', service: 'w serwisie', broken: 'wymaga serwisu' };

export function vehicleView(s, v) {
  const vt = VEHICLE_BY_ID[v.type];
  const status = vehicleStatus(s, v);
  const range = vt.range >= 999 ? 'bez limitu' : `do ${vt.range} km`;
  return {
    uid: v.uid,
    icon: vt.icon,
    name: vt.name,
    status,
    statusLabel: status === 'service' ? `w serwisie (${fmtDur(v.serviceUntil - s.time)})` : STATUS_LABEL[status],
    meta: `ład. ${vt.cap} · ${vt.speed} km/h · ${range} · ${Math.round(v.km)} km przebiegu`,
    cond: v.cond,
    canService: (status === 'idle' || status === 'broken') && v.cond < 99.5,
    serviceCost: fmtMoney(serviceCost(s, v)),
    canSell: status !== 'trip' && s.vehicles.length > 1,
    resale: fmtMoney(vehicleResale(v)),
  };
}

export function vehicleTypeLines(vt) {
  const range = vt.range >= 999 ? 'bez limitu' : `do ${vt.range} km`;
  return [
    `ładowność ${vt.cap} j.m. · ${vt.speed} km/h · zasięg ${range}`,
    `${vt.terrain.map((t) => TERRAIN_LABEL[t]).join(' + ')} · paliwo ${vt.cost ? `${vt.cost.toFixed(2).replace('.', ',')} zł/km` : 'brak'}${vt.upkeep ? ` · utrzymanie ${vt.upkeep} zł/dzień` : ''}`,
  ];
}

// Pojazdy w oknie wysyłki — z powodem, dla którego danego nie da się wybrać.
export function dispatchVehicles(s, order, selected) {
  const loc = LOCATION_BY_ID[CLIENT_BY_ID[order.client].loc];
  return s.vehicles.map((v) => {
    const vt = VEHICLE_BY_ID[v.type];
    const status = vehicleStatus(s, v);
    let note = `ład. ${vt.cap} · ${Math.round(vehicleSpeed(s, vt, loc))} km/h`;
    let disabled = false;
    if (status !== 'idle') {
      note = STATUS_LABEL[status];
      disabled = true;
    } else if (loc.km > vt.range) {
      note = `za daleko (zasięg ${vt.range} km)`;
      disabled = true;
    } else if (!canReach(vt, loc)) {
      note = `nie dojedzie (${ACCESS_LABEL[loc.access]})`;
      disabled = true;
    } else if (isGrounded(s, vt)) {
      note = 'uziemiony przez pogodę';
      disabled = true;
    }
    return { uid: v.uid, icon: vt.icon, name: vt.name, note, disabled, selected: selected.includes(v.uid) };
  });
}

export function goalView(s) {
  const p = goalProgress(s);
  if (!p) return null;
  const big = p.max >= 1000;
  return {
    index: p.index + 1,
    count: p.count,
    title: p.goal.title,
    desc: p.goal.desc,
    cur: p.cur,
    max: p.max,
    curLabel: big ? fmtMoney(p.cur).replace(' zł', '') : p.cur,
    maxLabel: big ? fmtMoney(p.max).replace(' zł', '') : p.max,
    reward: fmtMoney(p.goal.cash),
  };
}

export function modView(s) {
  return s.mods.filter((m) => m.until > s.time).map((m, i) => ({ key: i, label: m.label, left: fmtDur(m.until - s.time) }));
}

export { DAY };
