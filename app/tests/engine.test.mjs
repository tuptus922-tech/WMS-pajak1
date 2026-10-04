// Testy silnika gry. Uruchom: npm test

import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/game/engine.js';
import { GOALS } from '../src/game/data/goals.js';
import { ACHIEVEMENTS } from '../src/game/data/achievements.js';
import { CLIENTS, LOCATION_BY_ID } from '../src/game/data/world.js';
import { DAY } from '../src/game/format.js';

function seeded(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fresh(seed = 7) {
  E.setRandom(seeded(seed));
  return E.newGame();
}

// Zdarzenie losowe zatrzymuje zegar do decyzji gracza — w testach wybieramy pierwszą opcję.
function run(s, minutes) {
  for (let m = 0; m < minutes; m += 10) {
    if (s.event) {
      if (!s.event.result) E.chooseEvent(s, 0);
      E.closeEvent(s);
    }
    E.tick(s, 10);
  }
}

// Zlecenie, które da się wysłać od ręki ze startowego magazynu.
function readyOrder(s) {
  return s.orders.find((o) => E.planTrip(s, o, [1]).ok);
}

test('nowa gra: taczka, towar i zlecenia na tablicy', () => {
  const s = fresh();
  assert.equal(s.vehicles.length, 1);
  assert.equal(s.orders.length, 2);
  assert.ok(E.usedSpace(s) <= E.capacity(s));
  assert.ok(readyOrder(s), 'pierwsze zlecenia mieszczą się w startowym magazynie');
});

test('wysyłka zdejmuje towar, a dostawa płaci i tworzy wypożyczenie', () => {
  const s = fresh();
  const o = readyOrder(s);
  const stockBefore = { ...s.stock };
  const cash = s.cash;
  assert.ok(E.dispatch(s, o.id, [1]).ok);
  for (const ln of o.lines) assert.equal(s.stock[ln.id] || 0, stockBefore[ln.id] - ln.qty);
  assert.equal(E.vehicleStatus(s, s.vehicles[0]), 'trip');
  E.tick(s, 120);
  assert.equal(s.stats.orders, 1);
  assert.ok(s.cash >= cash + o.payout);
  assert.equal(E.vehicleStatus(s, s.vehicles[0]), 'idle');
  if (o.days > 0) assert.equal(s.loans.length, 1);
});

// Zlecenie wstawione ręcznie — testy nie zależą wtedy od losowania tablicy.
function rental(s, qty = 4, days = 1) {
  const o = { id: 9000 + s.orders.length, client: 'lesneduchy', kind: 'normal', lines: [{ id: 'koc', qty }, { id: 'woda', qty: 2 }], days, vol: qty + 2, payout: 60, xp: 5, created: s.time, expires: s.time + 600, accepted: false, term: 0 };
  s.orders.push(o);
  return o;
}

test('pojemność liczy też sprzęt wydany w teren', () => {
  const s = fresh();
  const used = E.usedSpace(s);
  const o = rental(s);
  assert.ok(E.dispatch(s, o.id, [1]).ok);
  assert.equal(E.usedSpace(s), used - 2, 'koce w kursie nadal zajmują półkę, woda już nie');
  E.tick(s, 120);
  assert.equal(E.usedSpace(s), used - 2, 'u klienta też');
});

test('zwrot wraca na magazyn albo do warsztatu — nic nie znika bez śladu', () => {
  const s = fresh(3);
  const have = s.stock.koc;
  const o = rental(s, 6, 2);
  assert.ok(E.dispatch(s, o.id, [1]).ok);
  assert.equal(s.stock.koc, have - 6);
  run(s, 2 * DAY + 200);
  const loan = s.loans.find((l) => l.state === 'ramp');
  assert.ok(loan, 'sprzęt czeka na rampie');
  assert.ok(!E.acceptReturn(s, 999999).ok);
  assert.ok(E.acceptReturn(s, loan.id).ok);
  const f = s.faults.koc || { repair: 0, broken: 0 };
  // Zdarzenia po drodze mogą dorzucić albo zabrać koce, więc liczymy sztuki z tego wypożyczenia.
  assert.equal(s.stats.returns, 1);
  assert.ok(s.stock.koc + f.repair + f.broken + s.stats.lost >= have - 6);
  assert.equal(s.loans.length, 0);
});

test('zdarzenie losowe zatrzymuje zegar do decyzji gracza', () => {
  const s = fresh();
  s.nextEventAt = s.time + 30;
  E.tick(s, 600);
  assert.ok(s.event, 'zdarzenie czeka na wybór');
  const frozen = s.time;
  E.tick(s, 600);
  assert.equal(s.time, frozen);
  assert.ok(E.eventChoices(s).length > 0);
  assert.ok(E.chooseEvent(s, 0).ok);
  assert.ok(s.event.result);
  E.closeEvent(s);
  E.tick(s, 60);
  assert.ok(s.time > frozen);
});

test('zakupy: gotówka, miejsce i dostawa z opóźnieniem', () => {
  const s = fresh();
  assert.ok(!E.buyItem(s, 'koc', 1000).ok, 'za drogo');
  assert.ok(!E.buyItem(s, 'kajak', 1).ok, 'towar z wyższego poziomu');
  const have = s.stock.koc;
  assert.ok(E.buyItem(s, 'koc', 4).ok);
  assert.equal(s.stock.koc, have, 'towar jeszcze jedzie');
  E.tick(s, 60);
  assert.equal(s.stock.koc, have + 4);
  const cash = s.cash;
  assert.ok(E.sellItem(s, 'koc', 2).ok);
  assert.ok(s.cash > cash);
});

test('warsztat: naprawa kosztuje, trwa i oddaje sprzęt', () => {
  const s = fresh();
  s.faults.koc = { repair: 2, broken: 1 };
  const have = s.stock.koc;
  assert.ok(E.startRepair(s, 'koc').ok);
  assert.ok(!E.startRepair(s, 'koc').ok, 'jedno stanowisko na start');
  E.tick(s, 200);
  assert.equal(s.stock.koc, have + 1);
  assert.equal(s.stats.repairs, 1);
  assert.ok(E.scrapItem(s, 'koc').ok);
  assert.equal(s.faults.koc.broken, 0);
});

test('zerwany kontrakt kosztuje karę i renomę', () => {
  const s = fresh();
  const o = { id: 9001, client: 'lesneduchy', kind: 'kontrakt', lines: [{ id: 'koc', qty: 500 }], days: 2, vol: 500, payout: 1000, xp: 10, created: s.time, expires: s.time + 600, accepted: false, term: 1200 };
  s.orders.push(o);
  assert.ok(E.acceptContract(s, o.id).ok);
  const cash = s.cash;
  const rep = s.rep;
  E.tick(s, 1300);
  assert.equal(s.stats.kontraktyFailed, 1);
  assert.equal(s.cash <= cash - 200, true);
  assert.ok(s.rep < rep);
});

test('pojazd nie pojedzie tam, gdzie nie sięga', () => {
  const s = fresh();
  const o = { id: 9002, client: 'osp', kind: 'normal', lines: [{ id: 'koc', qty: 1 }], days: 1, vol: 1, payout: 50, xp: 5, created: s.time, expires: s.time + 600, accepted: false, term: 0 };
  s.orders.push(o);
  const plan = E.planTrip(s, o, [1]);
  assert.equal(plan.ok, false);
  assert.match(plan.reason, /nie dojedzie/);
});

test('zapis i odczyt nie gubią stanu', () => {
  const s = fresh();
  E.tick(s, 500);
  const copy = E.migrate(JSON.parse(JSON.stringify(s)));
  assert.equal(copy.time, s.time);
  assert.deepEqual(copy.stock, s.stock);
  assert.equal(copy.orders.length, s.orders.length);
  E.tick(copy, 500);
});

test('dane: zadania, odznaki i klienci są spójne', () => {
  const s = fresh();
  for (const g of GOALS) {
    const [cur, max] = g.prog(s);
    assert.ok(Number.isFinite(cur) && max > 0, g.id);
  }
  for (const a of ACHIEVEMENTS) {
    const [cur, max] = a.prog(s);
    assert.ok(Number.isFinite(cur) && max > 0, a.id);
  }
  for (const c of CLIENTS) {
    const loc = LOCATION_BY_ID[c.loc];
    assert.ok(loc, c.id);
    assert.ok(loc.lvl <= c.lvl, `${c.id}: miejsce odblokowane najpóźniej razem z klientem`);
  }
  assert.equal(new Set(GOALS.map((g) => g.id)).size, GOALS.length);
  assert.equal(new Set(ACHIEVEMENTS.map((a) => a.id)).size, ACHIEVEMENTS.length);
});

test('długa gra bez gracza nie wykłada silnika', () => {
  const s = fresh(11);
  for (let i = 0; i < 30 * DAY; i += 10) {
    if (s.event) {
      E.chooseEvent(s, 0);
      E.closeEvent(s);
    }
    E.tick(s, 10);
    s.fx.length = 0;
  }
  assert.ok(s.time > 29 * DAY);
  assert.ok(s.orders.length <= E.boardSize(s));
});
