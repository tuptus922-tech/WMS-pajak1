import FaultRow from '../../components/FaultRow/FaultRow';
import EmptyState from '../../components/EmptyState/EmptyState';
import './UsterkiPage.css';

export default function UsterkiPage({ faults, isAdmin, onFix }) {
  return (
    <div className="usterki-page">
      <div className="usterki-page__hint">
        Sprzęt w naprawie i zepsuty — do decyzji przed sezonem.
      </div>
      {faults.map((f) => (
        <FaultRow
          key={f.id}
          fault={f}
          isAdmin={isAdmin}
          onFix={() => onFix(f)}
        />
      ))}
      {faults.length === 0 && <EmptyState message="Brak usterek ✓" />}
    </div>
  );
}
