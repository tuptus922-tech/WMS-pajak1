import './MapView.css';

const ROUTE_CLASS = { road: 'map-view__route--road', offroad: 'map-view__route--offroad', water: 'map-view__route--water' };

// Każda trasa to łuk z bazy do celu; punkt kontrolny odsunięty w bok, żeby drogi się nie zlewały.
function control(base, loc, index) {
  const mx = (base.x + loc.x) / 2;
  const my = (base.y + loc.y) / 2;
  const dx = loc.x - base.x;
  const dy = loc.y - base.y;
  const bend = (index % 2 ? 1 : -1) * 0.14;
  return { x: mx - dy * bend, y: my + dx * bend };
}

function pointAt(base, c, loc, f) {
  const u = 1 - f;
  return {
    x: u * u * base.x + 2 * u * f * c.x + f * f * loc.x,
    y: u * u * base.y + 2 * u * f * c.y + f * f * loc.y,
  };
}

export default function MapView({ base, locations, trips, selected, onSelect }) {
  const routes = {};
  locations.forEach((loc, i) => {
    routes[loc.id] = control(base, loc, i);
  });

  return (
    <svg className="map-view" viewBox="0 0 400 290" role="img" aria-label="Mapa okolicy Bazy Pająk">
      <rect width="400" height="290" className="map-view__land" />

      {/* las */}
      <g className="map-view__forest">
        <ellipse cx="42" cy="110" rx="46" ry="52" />
        <ellipse cx="30" cy="215" rx="42" ry="48" />
        <ellipse cx="30" cy="30" rx="40" ry="30" />
        <ellipse cx="100" cy="60" rx="34" ry="24" />
      </g>
      {/* jezioro i wyspa */}
      <path
        className="map-view__lake"
        d="M150,104 C138,60 190,18 250,20 C304,22 334,60 320,100 C310,130 252,134 216,122 C190,113 160,126 150,104 Z"
      />
      <ellipse className="map-view__island" cx="216" cy="78" rx="15" ry="11" />
      {/* góry */}
      <g className="map-view__mountains">
        <path d="M318,70 L342,24 L366,70 Z" />
        <path d="M346,70 L372,14 L398,70 Z" />
        <path d="M336,34 L342,24 L348,34 Z" className="map-view__snow" />
        <path d="M365,28 L372,14 L379,28 Z" className="map-view__snow" />
      </g>
      {/* pola przy mieście */}
      <g className="map-view__fields">
        <rect x="250" y="172" width="70" height="46" rx="6" />
        <rect x="340" y="184" width="56" height="48" rx="6" />
        <rect x="290" y="240" width="62" height="36" rx="6" />
      </g>

      {locations.map((loc) => {
        const c = routes[loc.id];
        return (
          <path
            key={loc.id}
            d={`M${base.x},${base.y} Q${c.x},${c.y} ${loc.x},${loc.y}`}
            className={
              'map-view__route ' +
              ROUTE_CLASS[loc.access] +
              (loc.open ? '' : ' map-view__route--locked') +
              (loc.closed ? ' map-view__route--closed' : '')
            }
          />
        );
      })}

      {locations.map((loc) => (
        <g
          key={loc.id}
          className={
            'map-view__node' +
            (loc.open ? '' : ' map-view__node--locked') +
            (selected === loc.id ? ' map-view__node--selected' : '')
          }
          transform={`translate(${loc.x},${loc.y})`}
          onClick={() => onSelect(loc.id)}
        >
          <circle r="10" />
          <text className="map-view__emoji" y="3.5">
            {loc.open ? loc.icon : '🔒'}
          </text>
          <text className="map-view__label" y="19">
            {loc.open ? loc.short : `poz. ${loc.lvl}`}
          </text>
          {loc.orders > 0 && (
            <g transform="translate(9,-9)">
              <circle r="5.5" className="map-view__badge" />
              <text className="map-view__badge-text" y="2.2">
                {loc.orders}
              </text>
            </g>
          )}
          {loc.loans > 0 && <circle cx="-9" cy="-9" r="3.5" className="map-view__loan-dot" />}
          {loc.closed && (
            <text className="map-view__emoji" x="-11" y="12">
              ⛔
            </text>
          )}
        </g>
      ))}

      <g
        className={'map-view__node map-view__node--base' + (selected === 'baza' ? ' map-view__node--selected' : '')}
        transform={`translate(${base.x},${base.y})`}
        onClick={() => onSelect('baza')}
      >
        <circle r="13" />
        <text className="map-view__emoji map-view__emoji--base" y="5">
          {base.icon}
        </text>
        <text className="map-view__label map-view__label--base" y="24">
          BAZA
        </text>
      </g>

      {trips.map((t) => {
        const loc = locations.find((l) => l.id === t.loc);
        if (!loc) return null;
        const p = pointAt(base, routes[loc.id], loc, t.f);
        return (
          <g key={t.id} className="map-view__vehicle" style={{ transform: `translate(${p.x}px, ${p.y}px)` }}>
            <circle r="7.5" className={t.returning ? 'map-view__vehicle-bg--back' : 'map-view__vehicle-bg'} />
            <text className="map-view__emoji" y="3.4">
              {t.icon}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
