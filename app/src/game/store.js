// Spina silnik z przeglądarką: zegar gry, zapis w localStorage i powiadamianie Reacta.

import { useSyncExternalStore } from 'react';
import { newGame, migrate, tick, afterAction, MIN_PER_SEC } from './engine.js';

const SAVE_KEY = 'pajak-logistics-save';
const TICK_MS = 200;
const AUTOSAVE_MS = 15000;

function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data.time !== 'number') return null;
    return migrate(data);
  } catch {
    return null;
  }
}

let state = load() || newGame();
let version = 0;
let blocked = false; // pełnoekranowe okno (awans, raport) wstrzymuje zegar
let fxHandler = null;
const listeners = new Set();

function emit() {
  version += 1;
  for (const l of listeners) l();
}

function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, fx: [] }));
  } catch {
    // Brak miejsca albo tryb prywatny — gra działa dalej bez zapisu.
  }
}

function drainFx() {
  if (!state.fx.length) return;
  const queue = state.fx;
  state.fx = [];
  for (const item of queue) {
    if (item.type === 'save') save();
    else if (fxHandler) fxHandler(item);
  }
}

let last = performance.now();
const ticker = setInterval(() => {
  const now = performance.now();
  // Po uśpieniu karty nie nadrabiamy zaległości — gra po prostu stała.
  const dt = Math.min(1, (now - last) / 1000);
  last = now;
  if (state.paused || state.event || blocked) return;
  tick(state, dt * MIN_PER_SEC * state.speed);
  drainFx();
  emit();
}, TICK_MS);

const autosave = setInterval(save, AUTOSAVE_MS);
// Przy podmianie modułu w trybie dev stare zegary muszą zniknąć, inaczej gra przyspiesza.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearInterval(ticker);
    clearInterval(autosave);
  });
}
window.addEventListener('beforeunload', save);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) save();
});

export const store = {
  get state() {
    return state;
  },
  // Wykonuje akcję silnika: store.act(buyItem, 'koc', 5) → { ok, msg }
  act(fn, ...args) {
    const res = fn(state, ...args);
    afterAction(state);
    drainFx();
    emit();
    return res;
  },
  setSpeed(speed) {
    state.speed = speed;
    state.paused = false;
    emit();
  },
  togglePause() {
    state.paused = !state.paused;
    emit();
  },
  setBlocked(on) {
    blocked = on;
  },
  onFx(handler) {
    fxHandler = handler;
    return () => {
      if (fxHandler === handler) fxHandler = null;
    };
  },
  dismissIntro() {
    state.intro = false;
    save();
    emit();
  },
  save,
  reset() {
    state = newGame();
    save();
    emit();
  },
  exportSave() {
    return btoa(unescape(encodeURIComponent(JSON.stringify({ ...state, fx: [] }))));
  },
  importSave(text) {
    try {
      const data = JSON.parse(decodeURIComponent(escape(atob(text.trim()))));
      if (!data || typeof data.time !== 'number' || !data.stock) return false;
      state = migrate(data);
      save();
      emit();
      return true;
    } catch {
      return false;
    }
  },
};

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getVersion = () => version;

// Zwraca bieżący stan gry i przerysowuje komponent po każdym kroku symulacji.
export function useGame() {
  useSyncExternalStore(subscribe, getVersion);
  return state;
}
