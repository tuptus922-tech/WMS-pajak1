// Proste dźwięki z Web Audio — bez plików. Ustawienie wyciszenia siedzi w localStorage.

const MUTE_KEY = 'pajak-logistics-mute';
let ctx = null;
let muted = localStorage.getItem(MUTE_KEY) === '1';

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// notes: [częstotliwość, start (s), długość (s)]
function play(notes, type = 'triangle', volume = 0.08) {
  if (muted) return;
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime;
  for (const [freq, at, len] of notes) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t0 + at);
    gain.gain.linearRampToValueAtTime(volume, t0 + at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + len);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0 + at);
    osc.stop(t0 + at + len + 0.02);
  }
}

const SOUNDS = {
  click: () => play([[520, 0, 0.05]], 'square', 0.03),
  coin: () => play([[988, 0, 0.08], [1319, 0.07, 0.18]]),
  buy: () => play([[440, 0, 0.07], [660, 0.06, 0.12]]),
  go: () => play([[330, 0, 0.08], [392, 0.07, 0.08], [494, 0.14, 0.14]], 'sawtooth', 0.04),
  ok: () => play([[660, 0, 0.08], [880, 0.07, 0.12]]),
  bad: () => play([[300, 0, 0.12], [220, 0.1, 0.2]], 'sawtooth', 0.05),
  error: () => play([[180, 0, 0.16]], 'square', 0.04),
  ramp: () => play([[587, 0, 0.1]], 'sine', 0.06),
  alert: () => play([[784, 0, 0.09], [784, 0.14, 0.09]], 'square', 0.035),
  build: () => play([[262, 0, 0.1], [330, 0.09, 0.1], [392, 0.18, 0.1], [523, 0.27, 0.22]]),
  levelup: () => play([[523, 0, 0.12], [659, 0.11, 0.12], [784, 0.22, 0.12], [1047, 0.33, 0.35]]),
  goal: () => play([[659, 0, 0.1], [880, 0.1, 0.25]]),
};

export const sfx = {
  play(name) {
    const fn = SOUNDS[name];
    if (fn) fn();
  },
  get muted() {
    return muted;
  },
  setMuted(on) {
    muted = on;
    localStorage.setItem(MUTE_KEY, on ? '1' : '0');
  },
};
