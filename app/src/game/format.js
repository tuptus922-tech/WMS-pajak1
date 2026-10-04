export const DAY = 1440;

export function fmtMoney(n) {
  const v = Math.round(n);
  const sign = v < 0 ? '−' : '';
  return `${sign}${Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} zł`;
}

export function fmtNum(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function dayOf(time) {
  return Math.floor(time / DAY) + 1;
}

export function fmtHour(time) {
  const m = Math.floor(time % DAY);
  const hh = String(Math.floor(m / 60)).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function fmtClock(time) {
  return `Dzień ${dayOf(time)}, ${fmtHour(time)}`;
}

export function fmtDur(min) {
  const m = Math.max(0, Math.round(min));
  if (m >= DAY) {
    const d = Math.floor(m / DAY);
    const h = Math.round((m % DAY) / 60);
    return h ? `${d} d ${h} h` : `${d} d`;
  }
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r ? `${h} h ${r} min` : `${h} h`;
  }
  return `${m} min`;
}

export function isNight(time) {
  const h = (time % DAY) / 60;
  return h < 6 || h >= 22;
}
