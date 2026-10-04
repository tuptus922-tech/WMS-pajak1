import { useState } from 'react';
import MapView from '../MapView/MapView';
import TripRow from '../TripRow/TripRow';
import { mapView, locationInfo, tripView } from '../../../game/view';
import './SidePanel.css';

// Prawa kolumna na szerokim ekranie: mapa na żywo i kursy w trasie.
export default function SidePanel({ s }) {
  const [selected, setSelected] = useState(null);
  const map = mapView(s);
  const info = selected && locationInfo(s, selected);
  return (
    <aside className="side-panel">
      <div className="side-panel__title">CENTRUM DYSPOZYTORSKIE</div>
      <MapView {...map} selected={selected} onSelect={setSelected} />
      <div className="side-panel__info">
        {info ? (
          <>
            <div className="side-panel__info-name">
              {info.open ? info.icon : '🔒'} {info.name}
            </div>
            {info.lines.map((ln, i) => (
              <div key={i}>{ln}</div>
            ))}
          </>
        ) : (
          'Kliknij miejsce na mapie, żeby zobaczyć szczegóły. Pomarańczowa liczba to czekające zlecenia, niebieska kropka — wypożyczony sprzęt.'
        )}
      </div>
      <div className="side-panel__title">KURSY W TRASIE ({s.trips.length})</div>
      <div className="side-panel__trips">
        {s.trips.map((t) => (
          <TripRow key={t.id} trip={tripView(s, t)} />
        ))}
        {s.trips.length === 0 && <div className="side-panel__empty">Cała flota stoi w garażu.</div>}
      </div>
    </aside>
  );
}
