import { useState } from 'react';
import Chip from '../../components/Chip/Chip';
import ShopCard from '../../components/ShopCard/ShopCard';
import VehicleRow from '../../components/VehicleRow/VehicleRow';
import GoalCard from '../../components/GoalCard/GoalCard';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import { VEHICLES } from '../../../game/data/vehicles';
import { BUILDINGS, BUILDING_BY_ID, STAFF, PERKS, rankName } from '../../../game/data/base';
import { GOALS } from '../../../game/data/goals';
import { ACHIEVEMENTS } from '../../../game/data/achievements';
import {
  buyVehicle, sellVehicle, serviceVehicle, upgradeBuilding, hireStaff, fireStaff, buyPerk, setAuto,
  garageSlots, buildingLevel, buildingReqLevel, dailyCosts,
} from '../../../game/engine';
import { vehicleView, vehicleTypeLines, goalView } from '../../../game/view';
import { fmtMoney, fmtNum, dayOf } from '../../../game/format';
import './BazaPage.css';

const SECTIONS = [
  { id: 'flota', name: '🚚 Flota' },
  { id: 'budynki', name: '🏗️ Budynki' },
  { id: 'kadra', name: '🧑‍🤝‍🧑 Kadra' },
  { id: 'sprawnosci', name: '🎖️ Sprawności' },
  { id: 'zadania', name: '🎯 Zadania' },
  { id: 'odznaki', name: '🏅 Odznaki' },
  { id: 'raport', name: '📊 Raport' },
  { id: 'opcje', name: '⚙️ Opcje' },
];

function Flota({ s, act }) {
  const types = VEHICLES.filter((vt) => vt.lvl <= s.level + 2);
  return (
    <>
      <div className="baza-page__title">
        GARAŻ
        <span>
          {s.vehicles.length}/{garageSlots(s)} miejsc
        </span>
      </div>
      {s.vehicles.map((v) => (
        <VehicleRow
          key={v.uid}
          vehicle={vehicleView(s, v)}
          onService={() => act(serviceVehicle, v.uid)}
          onSell={() => act(sellVehicle, v.uid)}
        />
      ))}
      <div className="baza-page__title">SALON</div>
      {types.map((vt) => {
        let locked = null;
        if (vt.lvl > s.level) locked = `od poziomu ${vt.lvl}`;
        else if (vt.req) {
          const b = Object.keys(vt.req).find((id) => buildingLevel(s, id) < vt.req[id]);
          if (b) locked = `wymaga: ${BUILDING_BY_ID[b].name} poz. ${vt.req[b]}`;
        }
        return (
          <ShopCard
            key={vt.id}
            icon={vt.icon}
            title={vt.name}
            desc={vt.desc}
            lines={vehicleTypeLines(vt)}
            price={fmtMoney(vt.price)}
            buttonLabel="KUP"
            locked={locked}
            onAction={() => act(buyVehicle, vt.id)}
          />
        );
      })}
    </>
  );
}

function Budynki({ s, act }) {
  const list = BUILDINGS.filter((b) => b.lvl <= s.level + 2);
  return (
    <>
      <div className="baza-page__title">ROZBUDOWA BAZY</div>
      {list.map((b) => {
        const lvl = buildingLevel(s, b.id);
        const cur = lvl > 0 ? b.levels[lvl - 1] : null;
        const next = b.levels[lvl];
        const lines = [];
        if (cur) lines.push(`Teraz: ${cur.name} — ${b.effect(cur.value, lvl)}`);
        if (next) lines.push(`${cur ? 'Dalej' : 'Budowa'}: ${next.name} — ${b.effect(next.value, lvl + 1)}`);
        const need = next ? buildingReqLevel(b, lvl + 1) : 0;
        return (
          <ShopCard
            key={b.id}
            icon={b.icon}
            title={b.name}
            tag={lvl > 0 ? `poz. ${lvl}/${b.levels.length}` : null}
            desc={b.desc}
            lines={lines}
            price={next ? fmtMoney(next.cost) : null}
            buttonLabel={cur ? 'ROZBUDUJ' : 'ZBUDUJ'}
            locked={next && need > s.level ? `od poziomu ${need}` : null}
            done={next ? null : 'MAKS'}
            onAction={() => act(upgradeBuilding, b.id)}
          />
        );
      })}
    </>
  );
}

function Kadra({ s, act }) {
  const list = STAFF.filter((st) => st.lvl <= s.level + 2);
  const costs = dailyCosts(s);
  return (
    <>
      <div className="baza-page__title">
        KADRA
        <span>pensje {fmtMoney(costs.wages)}/dzień</span>
      </div>
      {list.map((st) => {
        const hired = !!s.staff[st.id];
        const extras = [];
        if (hired && st.id === 'dyspozytor') {
          extras.push({
            label: s.auto.dyspozytor ? 'AUTOMAT: WŁ.' : 'AUTOMAT: WYŁ.',
            onClick: () => act(setAuto, 'dyspozytor', !s.auto.dyspozytor),
          });
        }
        if (hired) extras.push({ label: 'ZWOLNIJ', onClick: () => act(fireStaff, st.id) });
        return (
          <ShopCard
            key={st.id}
            icon={st.icon}
            title={st.name}
            desc={st.desc}
            lines={[`pensja ${fmtMoney(st.wage)}/dzień`]}
            price={fmtMoney(st.fee)}
            buttonLabel="ZATRUDNIJ"
            locked={st.lvl > s.level ? `od poziomu ${st.lvl}` : null}
            done={hired ? 'W KADRZE' : null}
            extras={extras}
            onAction={() => act(hireStaff, st.id)}
          />
        );
      })}
    </>
  );
}

function Sprawnosci({ s, act }) {
  return (
    <>
      <div className="baza-page__title">
        SPRAWNOŚCI
        <span>punkty: {s.perkPoints}</span>
      </div>
      <div className="baza-page__hint">Za każdy awans dostajesz punkt. Sprawności działają na stałe.</div>
      {PERKS.map((p) => (
        <ShopCard
          key={p.id}
          icon={p.icon}
          title={p.name}
          desc={p.desc}
          price={p.cost === 1 ? '1 punkt' : `${p.cost} punkty`}
          buttonLabel="ZDOBĄDŹ"
          done={s.perks[p.id] ? 'ZDOBYTA' : null}
          onAction={() => act(buyPerk, p.id)}
        />
      ))}
    </>
  );
}

function Zadania({ s }) {
  return (
    <>
      <div className="baza-page__title">
        ZADANIA
        <span>
          {s.goal}/{GOALS.length}
        </span>
      </div>
      <GoalCard goal={goalView(s)} />
      {GOALS.map((g, i) => {
        if (i === s.goal) return null;
        const done = i < s.goal;
        const hidden = i > s.goal + 2;
        return (
          <div key={g.id} className={'baza-page__goal' + (done ? ' baza-page__goal--done' : '')}>
            <span>{done ? '✓' : i + 1}</span>
            <span className="baza-page__goal-title">{hidden ? '???' : g.title}</span>
            <span>{hidden ? '' : fmtMoney(g.cash)}</span>
          </div>
        );
      })}
    </>
  );
}

function Odznaki({ s }) {
  const got = ACHIEVEMENTS.filter((a) => s.ach[a.id]).length;
  return (
    <>
      <div className="baza-page__title">
        ODZNAKI
        <span>
          {got}/{ACHIEVEMENTS.length}
        </span>
      </div>
      <div className="baza-page__badges">
        {ACHIEVEMENTS.map((a) => {
          const [cur, max] = a.prog(s);
          const done = !!s.ach[a.id];
          return (
            <div key={a.id} className={'baza-page__badge' + (done ? ' baza-page__badge--done' : '')}>
              <div className="baza-page__badge-icon">{a.icon}</div>
              <div className="baza-page__badge-name">{a.name}</div>
              <div className="baza-page__badge-desc">{a.desc}</div>
              {done ? (
                <div className="baza-page__badge-day">dzień {s.ach[a.id]}</div>
              ) : (
                <ProgressBar value={cur} max={max} tone="amber" />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Raport({ s }) {
  const st = s.stats;
  const week = s.history.slice(-7);
  const peak = Math.max(1, ...week.map((d) => Math.max(d.income, d.expense)));
  const costs = dailyCosts(s);
  const rows = [
    ['Stopień', rankName(s.level)],
    ['Dni na bazie', dayOf(s.time)],
    ['Zrealizowane zlecenia', fmtNum(st.orders)],
    ['Pilne / VIP / kontrakty', `${st.pilne} / ${st.vip} / ${st.kontrakty}`],
    ['Zerwane kontrakty', st.kontraktyFailed],
    ['Zlecenia, które przepadły', st.expired],
    ['Zarobek na zleceniach', fmtMoney(st.earned)],
    ['Wydatki łącznie', fmtMoney(st.spent)],
    ['Paliwo', fmtMoney(st.fuel)],
    ['Pensje', fmtMoney(st.wages)],
    ['Kilometry w trasie', `${fmtNum(st.km)} km`],
    ['Wydane sztuki', fmtNum(st.delivered)],
    ['Naprawy', fmtNum(st.repairs)],
    ['Uszkodzone / zgubione', `${st.damaged} / ${st.lost}`],
    ['Rekordowe zlecenie', fmtMoney(st.maxPayout)],
    ['Rekord w kasie', fmtMoney(st.maxCash)],
    ['Koszty stałe', `${fmtMoney(costs.total)}/dzień`],
  ];
  return (
    <>
      <div className="baza-page__title">OSTATNIE 7 DNI</div>
      {week.length === 0 ? (
        <div className="baza-page__hint">Pierwszy raport pojawi się po północy.</div>
      ) : (
        <div className="baza-page__chart">
          {week.map((d) => (
            <div key={d.day} className="baza-page__chart-day">
              <div className="baza-page__chart-bars">
                <div className="baza-page__chart-bar baza-page__chart-bar--in" style={{ height: `${(d.income / peak) * 100}%` }} title={`wpływy ${fmtMoney(d.income)}`} />
                <div className="baza-page__chart-bar baza-page__chart-bar--out" style={{ height: `${(d.expense / peak) * 100}%` }} title={`wydatki ${fmtMoney(d.expense)}`} />
              </div>
              <span>d{d.day}</span>
            </div>
          ))}
        </div>
      )}
      <div className="baza-page__legend">
        <span className="baza-page__legend-in">■ wpływy</span>
        <span className="baza-page__legend-out">■ wydatki</span>
      </div>
      <div className="baza-page__title">KSIĘGA BAZY</div>
      <div className="baza-page__table">
        {rows.map(([label, value]) => (
          <div key={label} className="baza-page__table-row">
            <span>{label}</span>
            <b>{value}</b>
          </div>
        ))}
      </div>
    </>
  );
}

function Opcje({ muted, onToggleMute, onExport, onImport, onReset }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [code, setCode] = useState('');
  return (
    <>
      <div className="baza-page__title">OPCJE</div>
      <button className="baza-page__option" onClick={onToggleMute}>
        {muted ? '🔇 Dźwięk wyłączony' : '🔊 Dźwięk włączony'}
      </button>
      <button className="baza-page__option" onClick={onExport}>
        📤 Skopiuj zapis gry do schowka
      </button>
      <textarea
        className="baza-page__code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Wklej tu kod zapisu, żeby go wczytać…"
        rows={3}
      />
      <button className="baza-page__option" disabled={!code.trim()} onClick={() => onImport(code)}>
        📥 Wczytaj zapis z kodu
      </button>
      {confirmReset ? (
        <button
          className="baza-page__option baza-page__option--danger"
          onClick={() => {
            setConfirmReset(false);
            onReset();
          }}
        >
          ⚠️ Na pewno? Cały postęp przepadnie — stuknij jeszcze raz
        </button>
      ) : (
        <button className="baza-page__option" onClick={() => setConfirmReset(true)}>
          🗑️ Zacznij od nowa
        </button>
      )}
      <div className="baza-page__hint">
        Gra zapisuje się sama w tej przeglądarce. Zegar stoi, gdy karta jest zamknięta.
      </div>
    </>
  );
}

export default function BazaPage({ s, act, section, onSection, options }) {
  return (
    <div className="baza-page">
      <div className="baza-page__chips">
        {SECTIONS.map((sec) => (
          <Chip key={sec.id} label={sec.name} active={sec.id === section} onClick={() => onSection(sec.id)} />
        ))}
      </div>
      {section === 'flota' && <Flota s={s} act={act} />}
      {section === 'budynki' && <Budynki s={s} act={act} />}
      {section === 'kadra' && <Kadra s={s} act={act} />}
      {section === 'sprawnosci' && <Sprawnosci s={s} act={act} />}
      {section === 'zadania' && <Zadania s={s} />}
      {section === 'odznaki' && <Odznaki s={s} />}
      {section === 'raport' && <Raport s={s} />}
      {section === 'opcje' && <Opcje {...options} />}
    </div>
  );
}
