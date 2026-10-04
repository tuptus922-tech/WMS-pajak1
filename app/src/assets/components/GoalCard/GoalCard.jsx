import ProgressBar from '../ProgressBar/ProgressBar';
import './GoalCard.css';

export default function GoalCard({ goal }) {
  if (!goal) {
    return (
      <div className="goal-card goal-card--done">
        <div className="goal-card__title">🏆 Wszystkie zadania wykonane!</div>
        <div className="goal-card__desc">Baza Pająk jest legendą logistyki. Graj dalej dla odznak i rekordów.</div>
      </div>
    );
  }
  return (
    <div className="goal-card">
      <div className="goal-card__head">
        <span className="goal-card__kicker">
          ZADANIE {goal.index}/{goal.count}
        </span>
        <span className="goal-card__reward">nagroda {goal.reward}</span>
      </div>
      <div className="goal-card__title">🎯 {goal.title}</div>
      <div className="goal-card__desc">{goal.desc}</div>
      <ProgressBar value={goal.cur} max={goal.max} tone="amber" label={`${goal.curLabel} / ${goal.maxLabel}`} />
    </div>
  );
}
