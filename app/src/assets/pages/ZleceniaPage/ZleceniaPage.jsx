import OrderCard from '../../components/OrderCard/OrderCard';
import TripRow from '../../components/TripRow/TripRow';
import EmptyState from '../../components/EmptyState/EmptyState';
import { boardSize } from '../../../game/engine';
import { orderView, tripView } from '../../../game/view';
import './ZleceniaPage.css';

const KIND_ORDER = { vip: 0, kontrakt: 1, pilne: 2, normal: 3 };

export default function ZleceniaPage({ s, onSend, onDismiss, onAccept }) {
  const orders = [...s.orders].sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.expires - b.expires);
  return (
    <div className="zlecenia-page">
      <div className="zlecenia-page__title">
        TABLICA ZLECEŃ
        <span>
          {s.orders.length}/{boardSize(s)}
        </span>
      </div>
      <div className="zlecenia-page__hint">
        Sprawdź, czy masz towar, dobierz pojazd i stuknij WYDAJ. Czego nie udźwigniesz — odrzuć, zwolni miejsce na tablicy.
      </div>
      {orders.map((o) => (
        <OrderCard
          key={o.id}
          order={orderView(s, o)}
          onSend={() => onSend(o.id)}
          onDismiss={() => onDismiss(o.id)}
          onAccept={() => onAccept(o.id)}
        />
      ))}
      {orders.length === 0 && <EmptyState message="Tablica pusta — zaraz ktoś zadzwoni ☎️" />}

      {s.trips.length > 0 && <div className="zlecenia-page__title">KURSY W TRASIE</div>}
      {s.trips.map((t) => (
        <TripRow key={t.id} trip={tripView(s, t)} />
      ))}
    </div>
  );
}
