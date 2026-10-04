import './BottomNav.css';

export default function BottomNav({ items, activeKey, onNavigate }) {
  return (
    <div className="bottom-nav">
      {items.map((n) => {
        const active = n.key === activeKey;
        return (
          <button
            key={n.key}
            className={'bottom-nav__item' + (active ? ' bottom-nav__item--active' : '')}
            onClick={() => onNavigate(n.key)}
          >
            <span className="bottom-nav__icon">
              {n.icon}
              {n.badge > 0 && <span className="bottom-nav__badge">{n.badge}</span>}
            </span>
            <span
              className={
                'bottom-nav__label' +
                (active ? ' bottom-nav__label--active' : '')
              }
            >
              {n.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
