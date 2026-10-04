import FaultRow from '../../components/FaultRow/FaultRow';
import EmptyState from '../../components/EmptyState/EmptyState';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import { ITEM_BY_ID } from '../../../game/data/items';
import { repairSlots, repairSpeed } from '../../../game/engine';
import { faultView } from '../../../game/view';
import { fmtDur } from '../../../game/format';
import './UsterkiPage.css';

export default function UsterkiPage({ s, onFix, onScrap, onFixAll }) {
  const slots = repairSlots(s);
  const speed = repairSpeed(s);
  const faults = Object.keys(s.faults)
    .map((id) => faultView(s, id))
    .sort((a, b) => b.repair - a.repair);
  const waiting = faults.reduce((sum, f) => sum + f.repair, 0);

  return (
    <div className="usterki-page">
      <div className="usterki-page__hint">
        Sprzęt w naprawie i zepsuty — do decyzji przed sezonem.
      </div>

      <div className="usterki-page__workshop">
        <div className="usterki-page__workshop-head">
          <span>WARSZTAT</span>
          <span>
            {s.repairs.length}/{slots} stanowisk
          </span>
        </div>
        {s.repairs.map((r) => (
          <div key={r.id} className="usterki-page__job">
            <span>
              {ITEM_BY_ID[r.item].icon} {ITEM_BY_ID[r.item].name}
            </span>
            <ProgressBar value={r.total - r.left} max={r.total} tone="amber" />
            <span>{fmtDur(r.left / speed)}</span>
          </div>
        ))}
        {s.repairs.length === 0 && <div className="usterki-page__idle">Stół pusty. Imadło czeka.</div>}
      </div>

      {waiting > 1 && s.repairs.length < slots && (
        <button className="usterki-page__all-btn" onClick={onFixAll}>
          ZAPEŁNIJ WOLNE STANOWISKA
        </button>
      )}

      {faults.map((f) => (
        <FaultRow
          key={f.id}
          fault={f}
          onFix={() => onFix(f.id)}
          onScrap={() => onScrap(f.id)}
        />
      ))}
      {faults.length === 0 && s.repairs.length === 0 && <EmptyState message="Brak usterek ✓" />}
    </div>
  );
}
