import { useState } from 'react';
import LoanRow from '../../components/LoanRow/LoanRow';
import TripRow from '../../components/TripRow/TripRow';
import MapView from '../../components/MapView/MapView';
import EmptyState from '../../components/EmptyState/EmptyState';
import { loanView, tripView, mapView, locationInfo } from '../../../game/view';
import './TerenPage.css';

export default function TerenPage({ s, onReceive, onReceiveAll, hideMap }) {
  const [selected, setSelected] = useState(null);
  const map = mapView(s);
  const info = selected && locationInfo(s, selected);
  const loans = s.loans.map((l) => loanView(s, l));
  const ramp = loans.filter((l) => l.ready);
  const field = loans.filter((l) => !l.ready).sort((a, b) => b.progress - a.progress);

  return (
    <div className="teren-page">
      {!hideMap && (
        <>
          <MapView {...map} selected={selected} onSelect={setSelected} />
          {info ? (
            <div className="teren-page__info">
              <div className="teren-page__info-name">
                {info.open ? info.icon : '🔒'} {info.name}
              </div>
              {info.lines.map((ln, i) => (
                <div key={i}>{ln}</div>
              ))}
            </div>
          ) : (
            <div className="teren-page__hint">Stuknij miejsce na mapie, żeby zobaczyć, kto tam czeka na sprzęt.</div>
          )}
        </>
      )}

      <div className="teren-page__title">
        RAMPA ZWROTÓW
        {ramp.length > 1 && (
          <button className="teren-page__all-btn" onClick={onReceiveAll}>
            PRZYJMIJ WSZYSTKO
          </button>
        )}
      </div>
      {ramp.map((l) => (
        <LoanRow key={l.id} loan={l} onReceive={() => onReceive(l.id)} />
      ))}
      {ramp.length === 0 && <div className="teren-page__hint">Rampa pusta. Gdy klient odda sprzęt, pojawi się tutaj.</div>}

      <div className="teren-page__title">W TERENIE</div>
      {field.map((l) => (
        <LoanRow key={l.id} loan={l} />
      ))}
      {field.length === 0 && ramp.length === 0 && (
        <EmptyState message="Cały sprzęt jest na magazynie ✓" />
      )}

      {s.trips.length > 0 && <div className="teren-page__title">KURSY</div>}
      {s.trips.map((t) => (
        <TripRow key={t.id} trip={tripView(s, t)} />
      ))}
    </div>
  );
}
