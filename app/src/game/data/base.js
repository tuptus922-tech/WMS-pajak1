// Rozwój bazy: budynki, kadra, sprawności i stopnie.

// levels[n] opisuje poziom n+1 budynku (albo n dla budynków startujących od zera — patrz `start`).
export const BUILDINGS = [
  { id: 'magazyn', name: 'Magazyn', icon: '📦', start: 1, lvl: 1,
    desc: 'Miejsce na cały sprzęt bazy (także wydany) i zapasy na stanie.',
    levels: [
      { name: 'Szopa', cost: 0, value: 120 },
      { name: 'Blaszak', cost: 600, value: 260 },
      { name: 'Magazyn murowany', cost: 2200, value: 500 },
      { name: 'Hala z regałami', cost: 7000, value: 900 },
      { name: 'Hala wysokiego składu', cost: 18000, value: 1600 },
      { name: 'Centrum dystrybucji', cost: 45000, value: 2800 },
      { name: 'Hub logistyczny', cost: 110000, value: 5000 },
      { name: 'Megahub „Pajęczyna”', cost: 250000, value: 9000 },
    ],
    effect: (v) => `${v} j.m. pojemności` },
  { id: 'warsztat', name: 'Warsztat', icon: '🛠️', start: 1, lvl: 1,
    desc: 'Stanowiska naprawy uszkodzonego sprzętu.',
    levels: [
      { name: 'Stół z imadłem', cost: 0, value: 1 },
      { name: 'Kącik majsterkowicza', cost: 600, value: 2 },
      { name: 'Warsztat', cost: 2600, value: 3 },
      { name: 'Serwis sprzętu', cost: 8500, value: 4 },
      { name: 'Zakład naprawczy', cost: 26000, value: 6 },
      { name: 'Fabryka drugiego życia', cost: 70000, value: 9 },
    ],
    effect: (v, lvl) => `${v} stanowisk, naprawy +${(lvl - 1) * 15}% szybciej` },
  { id: 'biuro', name: 'Biuro', icon: '🗂️', start: 1, lvl: 1,
    desc: 'Więcej zleceń na tablicy i lepsze stawki.',
    levels: [
      { name: 'Zeszyt kwatermistrza', cost: 0, value: 3 },
      { name: 'Biurko z telefonem', cost: 650, value: 4 },
      { name: 'Kancelaria', cost: 2800, value: 5 },
      { name: 'Dział zamówień', cost: 9000, value: 6 },
      { name: 'Biuro obsługi klienta', cost: 28000, value: 7 },
      { name: 'Centrum dyspozytorskie', cost: 80000, value: 8 },
    ],
    effect: (v, lvl) => `${v} zleceń na tablicy, stawki +${(lvl - 1) * 3}%` },
  { id: 'garaz', name: 'Garaż', icon: '🏚️', start: 1, lvl: 1,
    desc: 'Miejsca postojowe dla floty.',
    levels: [
      { name: 'Wiata', cost: 0, value: 2 },
      { name: 'Garaż blaszany', cost: 500, value: 4 },
      { name: 'Garaż dwustanowiskowy', cost: 2200, value: 6 },
      { name: 'Baza transportowa', cost: 7000, value: 9 },
      { name: 'Zajezdnia', cost: 22000, value: 12 },
      { name: 'Terminal floty', cost: 65000, value: 16 },
    ],
    effect: (v) => `${v} pojazdów` },
  { id: 'rampa', name: 'Rampa załadunkowa', icon: '🏗️', start: 0, lvl: 2,
    desc: 'Krótszy załadunek przed każdym kursem.',
    levels: [
      { name: 'Rampa z palet', cost: 400, value: 20 },
      { name: 'Rampa betonowa', cost: 1800, value: 12 },
      { name: 'Rampa z wózkiem widłowym', cost: 6000, value: 6 },
      { name: 'Dok automatyczny', cost: 20000, value: 2 },
    ],
    base: 30,
    effect: (v) => `załadunek ${v} min` },
  { id: 'chlodnia', name: 'Chłodnia', icon: '🧊', start: 0, lvl: 3,
    desc: 'Pozwala handlować towarem chłodzonym.',
    levels: [
      { name: 'Lodówka po babci', cost: 900, value: 0 },
      { name: 'Komora chłodnicza', cost: 5500, value: 10 },
      { name: 'Mroźnia', cost: 21000, value: 20 },
    ],
    effect: (v) => (v ? `towar chłodzony, zapasy +${v}% do stawki` : 'towar chłodzony w ofercie') },
  { id: 'stacja', name: 'Stacja paliw', icon: '⛽', start: 0, lvl: 4,
    desc: 'Własny dystrybutor — tańsze kilometry.',
    levels: [
      { name: 'Beczka z pompką', cost: 1500, value: 15 },
      { name: 'Dystrybutor', cost: 6000, value: 30 },
      { name: 'Stacja paliw', cost: 22000, value: 45 },
    ],
    effect: (v) => `paliwo −${v}%` },
  { id: 'monitoring', name: 'Ogrodzenie i monitoring', icon: '📹', start: 0, lvl: 4,
    desc: 'Chroni magazyn przed kradzieżami i dzikami.',
    levels: [
      { name: 'Płot i kłódka', cost: 1200, value: 1 },
      { name: 'Kamery i czujki', cost: 7000, value: 2 },
    ],
    effect: (v) => (v > 1 ? 'pełna ochrona + mniej zgubionego sprzętu' : 'koniec z kradzieżami') },
  { id: 'wieza', name: 'Wieża radiowa', icon: '📡', start: 0, lvl: 5,
    desc: 'Klienci łapią was z daleka — więcej zleceń, dłuższe terminy.',
    levels: [
      { name: 'Antena na sośnie', cost: 2000, value: 12 },
      { name: 'Maszt radiowy', cost: 9000, value: 25 },
      { name: 'Wieża z przemiennikiem', cost: 30000, value: 40 },
    ],
    effect: (v) => `zlecenia +${v}% częściej, terminy +${v}%` },
  { id: 'przystan', name: 'Przystań', icon: '⚓', start: 0, lvl: 7,
    desc: 'Otwiera szlaki wodne i pozwala kupować łodzie.',
    levels: [
      { name: 'Pomost', cost: 5000, value: 1 },
      { name: 'Keja towarowa', cost: 18000, value: 2 },
    ],
    effect: (v) => (v > 1 ? 'barki towarowe' : 'motorówki i dostawy wodą') },
  { id: 'ladowisko', name: 'Lądowisko', icon: '🚁', start: 0, lvl: 10,
    desc: 'Transport powietrzny — nad lasem, jeziorem i korkami.',
    levels: [
      { name: 'Pole startowe dronów', cost: 10000, value: 1 },
      { name: 'Lądowisko dla śmigłowców', cost: 60000, value: 2 },
    ],
    effect: (v) => (v > 1 ? 'śmigłowce' : 'drony cargo') },
];

export const BUILDING_BY_ID = Object.fromEntries(BUILDINGS.map((b) => [b.id, b]));

export const STAFF = [
  { id: 'magazynier', name: 'Magazynier', icon: '🧑‍🏭', lvl: 2, fee: 150, wage: 35,
    desc: 'Sam przyjmuje zwroty z rampy na magazyn.' },
  { id: 'serwisant', name: 'Serwisant', icon: '🧑‍🔧', lvl: 3, fee: 300, wage: 55,
    desc: 'Sam zaczyna naprawy, a warsztat pracuje 25% szybciej.' },
  { id: 'zaopatrzeniowiec', name: 'Zaopatrzeniowiec', icon: '🧑‍💼', lvl: 4, fee: 400, wage: 55,
    desc: 'Hurtownia −8%, dostawy przyjeżdżają dwa razy szybciej.' },
  { id: 'stroz', name: 'Stróż nocny', icon: '💂', lvl: 4, fee: 250, wage: 40,
    desc: 'Pilnuje bazy — nocne zdarzenia kończą się lepiej.' },
  { id: 'ksiegowa', name: 'Księgowa', icon: '👩‍💻', lvl: 5, fee: 600, wage: 80,
    desc: 'Każda faktura +8%.' },
  { id: 'mechanik', name: 'Mechanik', icon: '👨‍🔧', lvl: 6, fee: 700, wage: 90,
    desc: 'Sam serwisuje pojazdy za pół ceny, flota zużywa się wolniej.' },
  { id: 'handlowiec', name: 'Handlowiec', icon: '🤵', lvl: 7, fee: 900, wage: 110,
    desc: 'Więcej zleceń VIP i kontraktów, renoma rośnie o połowę szybciej.' },
  { id: 'dyspozytor', name: 'Dyspozytor', icon: '🧑‍✈️', lvl: 8, fee: 1500, wage: 150,
    desc: 'Sam wysyła zlecenia, gdy jest towar i wolny pojazd.' },
  { id: 'bhp', name: 'Instruktor BHP', icon: '👷', lvl: 9, fee: 1200, wage: 100,
    desc: 'Szkoli klientów — 20% mniej uszkodzeń.' },
  { id: 'szeftransportu', name: 'Szef transportu', icon: '🧔', lvl: 10, fee: 2500, wage: 170,
    desc: 'Flota jeździ 15% szybciej i pali 10% mniej.' },
];

export const STAFF_BY_ID = Object.fromEntries(STAFF.map((st) => [st.id, st]));

// Sprawności kupuje się za punkty z awansów (1 punkt za poziom).
export const PERKS = [
  { id: 'sobieradek', name: 'Sobieradek', icon: '🧵', cost: 1, desc: 'Naprawy tańsze o 20%.' },
  { id: 'goniec', name: 'Goniec', icon: '🏃', cost: 1, desc: 'Załadunek o połowę krótszy, małe pojazdy 20% szybsze.' },
  { id: 'obozownik', name: 'Obozownik', icon: '⛺', cost: 1, desc: 'Sprzęt biwakowy +15% do stawki.' },
  { id: 'kuchcik', name: 'Kuchcik', icon: '🍲', cost: 1, desc: 'Zapasy i kuchnia +12% do stawki.' },
  { id: 'pionier', name: 'Pionier', icon: '🪓', cost: 1, desc: 'Narzędzia +20% do stawki.' },
  { id: 'negocjator', name: 'Negocjator', icon: '🤝', cost: 1, desc: 'Hurtownia tańsza o 6%.' },
  { id: 'zlotaraczka', name: 'Złota rączka', icon: '🔧', cost: 1, desc: 'Trzy razy mniej sprzętu trafia na złom.' },
  { id: 'lacznosciowiec', name: 'Łącznościowiec', icon: '📻', cost: 1, desc: 'Jedno zlecenie więcej na tablicy.' },
  { id: 'ratownik', name: 'Ratownik', icon: '⛑️', cost: 1, desc: 'Sprzęt medyczny i wodny +20% do stawki.' },
  { id: 'gospodarz', name: 'Gospodarz', icon: '🧹', cost: 1, desc: 'Sprzęt wraca rzadziej uszkodzony (−15%).' },
  { id: 'mechanik', name: 'Mechanik pojazdowy', icon: '🔩', cost: 1, desc: 'Pojazdy zużywają się 30% wolniej.' },
  { id: 'przewodnik', name: 'Przewodnik', icon: '🧭', cost: 1, desc: 'Lepsze trasy — paliwo −15%.' },
  { id: 'tropiciel', name: 'Tropiciel', icon: '🐾', cost: 1, desc: 'Kursy w teren 25% szybsze.' },
  { id: 'sternik', name: 'Sternik', icon: '⚓', cost: 1, desc: 'Łodzie pływają 30% szybciej.' },
  { id: 'meteorolog', name: 'Meteorolog', icon: '🌦️', cost: 1, desc: 'Prognoza na 3 dni, zła pogoda szkodzi o połowę mniej.' },
  { id: 'elektryk', name: 'Elektryk', icon: '💡', cost: 1, desc: 'Elektronika +20% do stawki.' },
  { id: 'handlarz', name: 'Handlarz', icon: '💰', cost: 1, desc: 'Sprzedajesz używany sprzęt za 60% ceny, złom wart dwa razy więcej.' },
  { id: 'dobryduch', name: 'Dobry duch obozu', icon: '✨', cost: 1, desc: 'Renoma rośnie 30% szybciej.' },
  { id: 'skarbnik', name: 'Skarbnik', icon: '🧮', cost: 2, desc: 'Wszystkie stawki +6%.' },
  { id: 'kwatermistrz', name: 'Kwatermistrz', icon: '📦', cost: 2, desc: 'Magazyn mieści 12% więcej.' },
  { id: 'organizator', name: 'Organizator', icon: '🎪', cost: 2, desc: 'Sprzęt imprezowy +20% do stawki.' },
  { id: 'logistyk', name: 'Mistrz logistyki', icon: '🕸️', cost: 3, desc: 'Zlecenia pojawiają się 20% częściej, kontrakty płacą +15%.' },
];

export const PERK_BY_ID = Object.fromEntries(PERKS.map((p) => [p.id, p]));

export const RANKS = [
  'Biszkopt', 'Młodzik', 'Wywiadowca', 'Odkrywca', 'Ćwik',
  'Harcerz Orli', 'Harcerz Rzeczypospolitej', 'Zastępowy magazynu', 'Przyboczny kwatermistrza', 'Kwatermistrz',
  'Przewodnik', 'Starszy kwatermistrz', 'Podharcmistrz', 'Szef logistyki', 'Harcmistrz',
  'Komendant bazy', 'Dyrektor transportu', 'Baron palet', 'Magnat logistyki', 'Legenda Pająka',
];

export function rankName(level) {
  if (level <= RANKS.length) return RANKS[level - 1];
  return `Legenda Pająka ★${level - RANKS.length}`;
}
