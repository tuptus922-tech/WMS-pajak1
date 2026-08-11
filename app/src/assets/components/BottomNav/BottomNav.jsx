import './BottomNav.css';

export default function BottomNav({ items, activeKey, onNavigate }) {
  return (
    <div className="bottom-nav">
      {items.map((n) => {
        const active = n.key === activeKey;
        return (
          <button
            key={n.key}
            className="bottom-nav__item"
            onClick={() => onNavigate(n.key)}
          >
            <span className="bottom-nav__icon">{n.icon}</span>
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
