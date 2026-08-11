import './ActivityList.css';

export default function ActivityList({ items }) {
  return (
    <div>
      <div className="activity-list__title">OSTATNIE OPERACJE</div>
      <div className="activity-list">
        {items.map((a, i) => (
          <div className="activity-list__row" key={i}>
            <div>
              <div className="activity-list__text">{a.text}</div>
              <div className="activity-list__meta">{a.meta}</div>
            </div>
            <div className="activity-list__tag" style={{ color: a.color }}>
              {a.tag}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
