import ProgressBar from '../ProgressBar/ProgressBar';
import { fmtMoney, fmtNum } from '../../../game/format';
import './Hud.css';

const SPEEDS = [1, 2, 4];

export default function Hud({ cash, rep, used, cap, level, xp, xpMax, speed, paused, pops, onSpeed, onPause }) {
  return (
    <div className="hud">
      <div className="hud__row">
        <div className={'hud__stat hud__stat--cash' + (cash < 0 ? ' hud__stat--debt' : '')} title="Gotówka">
          <span>💰</span>
          <span className="hud__value">{fmtMoney(cash)}</span>
          {pops.map((p) => (
            <span key={p.id} className="hud__pop">
              +{fmtNum(p.amount)}
            </span>
          ))}
        </div>
        <div className="hud__stat" title="Renoma bazy">
          <span>⭐</span>
          <span className="hud__value">{Math.round(rep)}</span>
        </div>
        <div className={'hud__stat' + (used >= cap ? ' hud__stat--debt' : '')} title="Zajęte miejsce w magazynie">
          <span>📦</span>
          <span className="hud__value">
            {used}/{cap}
          </span>
        </div>
        <div className="hud__speed">
          <button
            className={'hud__speed-btn' + (paused ? ' hud__speed-btn--active' : '')}
            onClick={onPause}
            title="Pauza"
          >
            ⏸
          </button>
          {SPEEDS.map((sp) => (
            <button
              key={sp}
              className={'hud__speed-btn' + (!paused && speed === sp ? ' hud__speed-btn--active' : '')}
              onClick={() => onSpeed(sp)}
            >
              {sp}×
            </button>
          ))}
        </div>
      </div>
      <div className="hud__xp">
        <span className="hud__xp-label">Poz. {level}</span>
        <ProgressBar value={xp} max={xpMax} tone="amber" />
        <span className="hud__xp-label">
          {fmtNum(xp)}/{fmtNum(xpMax)} PD
        </span>
      </div>
    </div>
  );
}
