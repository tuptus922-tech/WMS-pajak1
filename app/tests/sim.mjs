// Bezgłowa symulacja z botem — sprawdza, czy silnik się nie wykłada i jak idzie progres.
// Uruchom: node tests/sim.mjs [dni] [ziarno]

import * as E from '../src/game/engine.js';
import { ITEMS, ITEM_BY_ID } from '../src/game/data/items.js';
import { VEHICLES, VEHICLE_BY_ID } from '../src/game/data/vehicles.js';
import { BUILDINGS, STAFF, PERKS } from '../src/game/data/base.js';
import { GOALS } from '../src/game/data/goals.js';
import { DAY, dayOf } from '../src/game/format.js';

const days = Number(process.argv[2] || 60);
const seed = Number(process.argv[3] || 1);

function mulberry32(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
E.setRandom(mulberry32(seed));

const s = E.newGame();
const levelDay = { 1: 1 };
const log = [];
let dismissed = 0;

function bot() {
  if (s.event) {
    if (!s.event.result) E.chooseEvent(s, 0);
    E.closeEvent(s);
  }
  E.acceptAllReturns(s);
  for (const id of Object.keys(s.faults)) {
    if (s.faults[id]?.broken) E.scrapItem(s, id);
    while (s.faults[id]?.repair > 0 && E.startRepair(s, id).ok);
  }
  for (const p of PERKS) if (!s.perks[p.id] && s.perkPoints >= p.cost) E.buyPerk(s, p.id);

  // Zlecenia: wyślij, co się da; brakujący towar dokup, jeśli się opłaca; resztę odrzuć.
  const pending = (id) => s.incoming.filter((x) => x.id === id).reduce((a, x) => a + x.qty, 0);
  for (const o of [...s.orders].sort((a, b) => b.payout - a.payout)) {
    const uids = E.autoPickVehicles(s, o);
    const plan = E.planTrip(s, o, uids);
    if (plan.ok) {
      E.dispatch(s, o.id, uids);
      continue;
    }
    if (plan.missing.length) {
      let cost = 0;
      let waiting = true;
      for (const m of plan.missing) {
        const need = m.need - pending(m.id);
        if (need > 0) {
          waiting = false;
          cost += E.unitPrice(s, ITEM_BY_ID[m.id]) * need;
        }
      }
      if (waiting) continue;
      const gear = o.lines.some((ln) => ITEM_BY_ID[ln.id].kind === 'gear');
      const worth = cost <= o.payout * (gear ? 5 : 0.9);
      if (worth && cost <= s.cash * 0.8) {
        let bought = true;
        for (const m of plan.missing) {
          const need = m.need - pending(m.id);
          if (need > 0 && !E.buyItem(s, m.id, need).ok) bought = false;
        }
        if (bought && o.kind === 'kontrakt' && !o.accepted) E.acceptContract(s, o.id);
        if (bought) continue;
      }
      if (!o.accepted && s.time - o.created > 90) {
        E.dismissOrder(s, o.id);
        dismissed += 1;
      }
    } else if (!uids.length && !o.accepted && s.time - o.created > 240) {
      E.dismissOrder(s, o.id);
      dismissed += 1;
    }
  }

  // Rozwój. Gdy magazyn pęka w szwach, bot odkłada na rozbudowę.
  const mag = BUILDINGS[0];
  const magLvl = E.buildingLevel(s, 'magazyn');
  const saving =
    E.usedSpace(s) > E.capacity(s) * 0.85 && magLvl < mag.levels.length && E.buildingReqLevel(mag, magLvl + 1) <= s.level;
  if (saving) {
    E.upgradeBuilding(s, 'magazyn');
    for (const v of s.vehicles) if (v.cond < 50) E.serviceVehicle(s, v.uid);
    E.afterAction(s);
    return;
  }
  for (const st of STAFF) if (!s.staff[st.id] && st.lvl <= s.level && s.cash > st.fee * 3 + st.wage * 10) E.hireStaff(s, st.id);
  const owned = (id) => s.vehicles.filter((x) => x.type === id).length;
  const wanted = [...VEHICLES].reverse().find((v) => v.lvl <= s.level && s.cash > v.price * 1.3 && owned(v.id) < (v.price > 3000 ? 2 : 1));
  if (wanted) {
    if (s.vehicles.length >= E.garageSlots(s)) E.upgradeBuilding(s, 'garaz');
    if (s.vehicles.length >= E.garageSlots(s)) {
      const idle = s.vehicles.filter((v) => !v.trip).sort((a, b) => VEHICLE_BY_ID[a.type].price - VEHICLE_BY_ID[b.type].price)[0];
      if (idle && VEHICLE_BY_ID[idle.type].price < wanted.price / 2) E.sellVehicle(s, idle.uid);
    }
    E.buyVehicle(s, wanted.id);
  }
  for (const b of BUILDINGS) {
    const lvl = E.buildingLevel(s, b.id);
    if (lvl >= b.levels.length) continue;
    const cost = b.levels[lvl].cost;
    const urgent = b.id === 'magazyn' && E.freeSpace(s) < E.capacity(s) * 0.25;
    if (s.cash > cost * (urgent ? 1.1 : 2.2)) E.upgradeBuilding(s, b.id);
  }
  for (const v of s.vehicles) if (v.cond < 50) E.serviceVehicle(s, v.uid);
  E.afterAction(s);
}

let lastLevel = 1;
for (let m = 0; m < days * DAY; m += 10) {
  E.tick(s, 10);
  bot();
  s.fx.length = 0;
  if (s.level !== lastLevel) {
    for (let l = lastLevel + 1; l <= s.level; l++) levelDay[l] = dayOf(s.time);
    lastLevel = s.level;
  }
  if (m % (5 * DAY) === 0 && m > 0) {
    const t = E.totals(s);
    const h = s.history.slice(-5);
    const inc = Math.round(h.reduce((a, d) => a + d.income, 0) / h.length);
    const exp = Math.round(h.reduce((a, d) => a + d.expense, 0) / h.length);
    const ord = (h.reduce((a, d) => a + d.orders, 0) / h.length).toFixed(1);
    log.push(
      `d${String(dayOf(s.time)).padStart(3)} L${String(s.level).padStart(2)} cash ${String(Math.round(s.cash)).padStart(7)} rep ${s.rep.toFixed(0).padStart(3)}` +
        ` inc/d ${String(inc).padStart(6)} exp/d ${String(exp).padStart(6)} ord/d ${ord.padStart(5)} veh ${s.vehicles.length} stock ${t.available}/${t.out}/${t.broken}` +
        ` cap ${E.usedSpace(s)}/${E.capacity(s)} goal ${s.goal}/${GOALS.length} ach ${Object.keys(s.ach).length}`,
    );
  }
}

console.log(log.join('\n'));
console.log('poziomy (dzień):', Object.entries(levelDay).map(([l, d]) => `${l}:${d}`).join(' '));
console.log('stats:', JSON.stringify({ ...s.stats, clients: Object.keys(s.stats.clients).length, locs: Object.keys(s.stats.locs).length }));
console.log('odrzucone przez bota:', dismissed);
console.log('flota:', s.vehicles.map((v) => VEHICLE_BY_ID[v.type].name).join(', '));
console.log('budynki:', JSON.stringify(s.buildings), 'kadra:', Object.keys(s.staff).join(','));
console.log('towary w ofercie:', ITEMS.filter((it) => E.isItemAvailable(s, it)).length, '/', ITEMS.length);
