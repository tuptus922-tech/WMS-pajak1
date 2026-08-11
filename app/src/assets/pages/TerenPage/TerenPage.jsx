import LoanRow from '../../components/LoanRow/LoanRow';
import EmptyState from '../../components/EmptyState/EmptyState';
import './TerenPage.css';

export default function TerenPage({ loans, onReceive }) {
  return (
    <div className="teren-page">
      <div className="teren-page__hint">
        Sprzęt poza magazynem — stuknij PRZYJMIJ przy zwrocie.
      </div>
      {loans.map((l) => (
        <LoanRow key={l.id} loan={l} onReceive={() => onReceive(l)} />
      ))}
      {loans.length === 0 && (
        <EmptyState message="Cały sprzęt jest na magazynie ✓" />
      )}
    </div>
  );
}
