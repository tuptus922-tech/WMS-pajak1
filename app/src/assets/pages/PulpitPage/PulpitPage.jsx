import StatsRow from '../../components/StatsRow/StatsRow';
import ActionButtons from '../../components/ActionButtons/ActionButtons';
import ActivityList from '../../components/ActivityList/ActivityList';
import GoalCard from '../../components/GoalCard/GoalCard';
import { ITEM_BY_ID } from '../../../game/data/items';
import { WEATHER_BY_ID } from '../../../game/data/world';
import { totals, dailyCosts, weatherOf, fuelMult, repairSlots, hasPerk, vehicleStatus } from '../../../game/engine';
import { goalView, modView } from '../../../game/view';
import { fmtMoney } from '../../../game/format';
import './PulpitPage.css';

function alertsOf(s) {
  const list = [];
  const ready = s.orders.filter((o) => o.lines.every((ln) => (s.stock[ln.id] || 0) >= ln.qty)).length;
  if (ready) list.push({ key: 'zlecenia', icon: '📋', text: `Zlecenia gotowe do wydania: ${ready}`, tab: 'zlecenia' });
  const ramp = s.loans.filter((l) => l.state === 'ramp').length;
  if (ramp) list.push({ key: 'rampa', icon: '↙️', text: `Zwroty czekają na rampie: ${ramp}`, tab: 'teren' });
  const toFix = Object.values(s.faults).reduce((sum, f) => sum + f.repair, 0);
  if (toFix && s.repairs.length < repairSlots(s)) list.push({ key: 'usterki', icon: '🛠️', text: `Sprzęt czeka na naprawę: ${toFix}`, tab: 'usterki' });
  if (s.perkPoints > 0) list.push({ key: 'perk', icon: '🎖️', text: `Punkty sprawności do wydania: ${s.perkPoints}`, tab: 'baza', section: 'sprawnosci' });
  const worn = s.vehicles.filter((v) => vehicleStatus(s, v) !== 'trip' && v.cond < 30).length;
  if (worn) list.push({ key: 'flota', icon: '🔧', text: `Pojazdy proszą o serwis: ${worn}`, tab: 'baza', section: 'flota' });
  if (s.cash < 0) list.push({ key: 'dlug', icon: '🧾', text: 'Jesteś na minusie — odsetki 3% dziennie.', tab: 'baza', section: 'raport' });
  return list;
}

export default function PulpitPage({ s, onOpenIssue, onGoTeren, onNavigate }) {
  const t = totals(s);
  const costs = dailyCosts(s);
  const w = weatherOf(s);
  const deal = s.market.deal && ITEM_BY_ID[s.market.deal.id];
  const effects = modView(s);
  const alerts = alertsOf(s);
  const fuel = Math.round(fuelMult(s) * 100);

  return (
    <div className="pulpit-page">
      <GoalCard goal={goalView(s)} />
      <StatsRow available={t.available} out={t.out} broken={t.broken} />
      <ActionButtons onIssue={onOpenIssue} onGoTeren={onGoTeren} />

      {alerts.length > 0 && (
        <div className="pulpit-page__alerts">
          {alerts.map((a) => (
            <button key={a.key} className="pulpit-page__alert" onClick={() => onNavigate(a.tab, a.section)}>
              <span>{a.icon}</span>
              <span className="pulpit-page__alert-text">{a.text}</span>
              <span>›</span>
            </button>
          ))}
        </div>
      )}

      <div className="pulpit-page__day">
        <div className="pulpit-page__weather">
          <span className="pulpit-page__weather-icon">{w.icon}</span>
          <div>
            <div className="pulpit-page__weather-name">{w.name}</div>
            <div className="pulpit-page__weather-note">{w.note || 'Dobre warunki na trasach.'}</div>
          </div>
          {hasPerk(s, 'meteorolog') && (
            <div className="pulpit-page__forecast" title="Prognoza na kolejne dni">
              {s.forecast.map((id, i) => (
                <span key={i}>{WEATHER_BY_ID[id].icon}</span>
              ))}
            </div>
          )}
        </div>
        <div className="pulpit-page__facts">
          <div>
            <b className="pulpit-page__plus">+{fmtMoney(s.today.income)}</b>
            <span>dziś wpływy</span>
          </div>
          <div>
            <b className="pulpit-page__minus">−{fmtMoney(s.today.expense)}</b>
            <span>dziś wydatki</span>
          </div>
          <div>
            <b>{fmtMoney(costs.total)}</b>
            <span>koszty o północy</span>
          </div>
          <div>
            <b>{fuel}%</b>
            <span>cena paliwa</span>
          </div>
        </div>
        {deal && (
          <div className="pulpit-page__deal">
            🏷️ Okazja dnia w hurtowni: <b>{deal.icon} {deal.name}</b> −{Math.round(s.market.deal.off * 100)}%
          </div>
        )}
        {effects.map((e) => (
          <div key={e.key} className="pulpit-page__effect">
            ✨ {e.label} <span>jeszcze {e.left}</span>
          </div>
        ))}
      </div>

      <ActivityList items={s.feed.slice(0, 12)} />
    </div>
  );
}
