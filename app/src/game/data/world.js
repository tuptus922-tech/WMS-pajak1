// Mapa okolicy Bazy Pająk: miejsca dostaw i klienci.
// access: 'road' (droga), 'offroad' (bezdroża), 'water' (tylko wodą).
// x, y — pozycja na mapie schematycznej (viewBox 400×290), km — dystans z bazy.

export const BASE = { id: 'baza', name: 'Baza Pająk', icon: '🕷️', x: 92, y: 158 };

export const LOCATIONS = [
  { id: 'kuchnia', name: 'Kuchnia obozowa', short: 'Kuchnia', icon: '🍳', x: 122, y: 140, km: 0.3, access: 'road', lvl: 1 },
  { id: 'pod1', name: 'Podobóz „Leśne Duchy”', short: 'Leśne Duchy', icon: '⛺', x: 60, y: 124, km: 0.6, access: 'road', lvl: 1 },
  { id: 'pod2', name: 'Podobóz „Wilcze Echo”', short: 'Wilcze Echo', icon: '🐺', x: 54, y: 190, km: 0.9, access: 'road', lvl: 1 },
  { id: 'wopr', name: 'Przystań WOPR', short: 'WOPR', icon: '🛟', x: 150, y: 116, km: 1.2, access: 'road', lvl: 2 },
  { id: 'pod3', name: 'Podobóz „Szarotki”', short: 'Szarotki', icon: '🌼', x: 38, y: 84, km: 1.8, access: 'road', lvl: 3 },
  { id: 'zalesie', name: 'Wieś Zalesie', short: 'Zalesie', icon: '🏡', x: 150, y: 214, km: 6, access: 'road', lvl: 3 },
  { id: 'kolonia', name: 'Kolonia „Słoneczko”', short: 'Słoneczko', icon: '🌞', x: 214, y: 236, km: 9, access: 'road', lvl: 4 },
  { id: 'lesniczowka', name: 'Leśniczówka', short: 'Leśniczówka', icon: '🦌', x: 22, y: 240, km: 12, access: 'offroad', lvl: 5 },
  { id: 'sosnowka', name: 'Miasteczko Sosnówka', short: 'Sosnówka', icon: '🏘️', x: 286, y: 198, km: 18, access: 'road', lvl: 6 },
  { id: 'wyspa', name: 'Wyspa Kormoranów', short: 'Wyspa', icon: '🏝️', x: 216, y: 78, km: 3, access: 'water', lvl: 7, req: { przystan: 1 } },
  { id: 'szkwal', name: 'Szkoła żeglarska „Szkwał”', short: 'Szkwał', icon: '⛵', x: 304, y: 112, km: 14, access: 'road', lvl: 8 },
  { id: 'schronisko', name: 'Schronisko „Pod Pajęczyną”', short: 'Schronisko', icon: '🏔️', x: 358, y: 48, km: 26, access: 'offroad', lvl: 9 },
  { id: 'zlot', name: 'Pole zlotowe', short: 'Zlot', icon: '🏁', x: 104, y: 264, km: 22, access: 'road', lvl: 10 },
  { id: 'perkoz', name: 'Stanica wodna „Perkoz”', short: 'Perkoz', icon: '🦆', x: 252, y: 34, km: 9, access: 'water', lvl: 11, req: { przystan: 1 } },
  { id: 'poligon', name: 'Poligon WOT', short: 'Poligon', icon: '🎖️', x: 26, y: 30, km: 35, access: 'offroad', lvl: 11 },
  { id: 'festiwal', name: 'Festiwal „Pajęczyna”', short: 'Festiwal', icon: '🎸', x: 322, y: 258, km: 40, access: 'road', lvl: 12 },
  { id: 'port', name: 'Port jachtowy', short: 'Port', icon: '⚓', x: 374, y: 130, km: 45, access: 'road', lvl: 13 },
  { id: 'grodzisk', name: 'Grodzisk Wojewódzki', short: 'Grodzisk', icon: '🏙️', x: 378, y: 208, km: 70, access: 'road', lvl: 14 },
  { id: 'jamboree', name: 'Jamboree międzynarodowe', short: 'Jamboree', icon: '🌍', x: 384, y: 272, km: 95, access: 'road', lvl: 16 },
];

export const LOCATION_BY_ID = Object.fromEntries(LOCATIONS.map((l) => [l.id, l]));

// cats — wagi kategorii w zamówieniach, size — skala zamówień, pay — mnożnik stawek,
// rough — jak bardzo klient niszczy sprzęt, w — częstość zleceń.
export const CLIENTS = [
  { id: 'lesneduchy', name: 'Podobóz „Leśne Duchy”', icon: '⛺', loc: 'pod1', lvl: 1, size: 0.8, pay: 1.0, rough: 1.0, w: 10,
    cats: { biwak: 5, narzedzia: 3, zapasy: 3, kuchnia: 1 } },
  { id: 'wilczeecho', name: 'Podobóz „Wilcze Echo”', icon: '🐺', loc: 'pod2', lvl: 1, size: 0.9, pay: 1.0, rough: 1.25, w: 9,
    cats: { biwak: 5, narzedzia: 4, zapasy: 1 } },
  { id: 'kuchnia', name: 'Kuchnia obozowa', icon: '🍳', loc: 'kuchnia', lvl: 1, size: 0.8, pay: 1.05, rough: 0.8, w: 9,
    cats: { zapasy: 6, kuchnia: 4 } },
  { id: 'wopr', name: 'Ratownicy WOPR', icon: '🛟', loc: 'wopr', lvl: 2, size: 0.9, pay: 1.1, rough: 0.9, w: 8,
    cats: { woda: 7, medyczne: 2, zapasy: 1 } },
  { id: 'szarotki', name: 'Podobóz „Szarotki”', icon: '🌼', loc: 'pod3', lvl: 3, size: 1.0, pay: 1.05, rough: 0.7, w: 8,
    cats: { biwak: 4, kuchnia: 3, zapasy: 2, medyczne: 1 } },
  { id: 'osp', name: 'OSP Zalesie', icon: '🚒', loc: 'zalesie', lvl: 3, size: 1.0, pay: 1.15, rough: 1.1, w: 6,
    cats: { narzedzia: 5, medyczne: 3, kuchnia: 1, elektro: 2 } },
  { id: 'soltys', name: 'Sklepik „U Sołtysa”', icon: '🏡', loc: 'zalesie', lvl: 3, size: 1.1, pay: 1.0, rough: 1.0, w: 6,
    cats: { zapasy: 9, imprezy: 1 } },
  { id: 'wdh12', name: '12 Wędrownicza Drużyna Harcerska', icon: '🥾', loc: 'pod3', lvl: 4, size: 1.0, pay: 1.1, rough: 1.3, w: 5,
    cats: { biwak: 5, narzedzia: 3, elektro: 2, woda: 1 } },
  { id: 'sloneczko', name: 'Kolonia „Słoneczko”', icon: '🌞', loc: 'kolonia', lvl: 4, size: 1.3, pay: 1.15, rough: 1.4, w: 7,
    cats: { biwak: 4, woda: 3, zapasy: 3, kuchnia: 1 } },
  { id: 'nadlesnictwo', name: 'Nadleśnictwo', icon: '🦌', loc: 'lesniczowka', lvl: 5, size: 1.2, pay: 1.3, rough: 1.1, w: 5,
    cats: { narzedzia: 6, elektro: 3, zapasy: 1 } },
  { id: 'hufiec', name: 'Komenda Hufca', icon: '⚜️', loc: 'sosnowka', lvl: 6, size: 1.6, pay: 1.2, rough: 0.8, w: 6,
    cats: { imprezy: 4, biwak: 3, elektro: 3, kuchnia: 1 } },
  { id: 'szkola', name: 'Szkoła Podstawowa nr 2', icon: '🏫', loc: 'sosnowka', lvl: 6, size: 1.4, pay: 1.1, rough: 1.5, w: 5,
    cats: { biwak: 4, imprezy: 3, zapasy: 2, medyczne: 1 } },
  { id: 'rybacy', name: 'Rybacy z Wyspy', icon: '🎣', loc: 'wyspa', lvl: 7, size: 1.3, pay: 1.4, rough: 1.0, w: 6,
    cats: { zapasy: 5, woda: 3, narzedzia: 2 } },
  { id: 'szkwal', name: 'Szkoła żeglarska „Szkwał”', icon: '⛵', loc: 'szkwal', lvl: 8, size: 1.6, pay: 1.25, rough: 1.1, w: 6,
    cats: { woda: 8, medyczne: 1, elektro: 1 } },
  { id: 'schronisko', name: 'Schronisko „Pod Pajęczyną”', icon: '🏔️', loc: 'schronisko', lvl: 9, size: 1.5, pay: 1.4, rough: 0.9, w: 5,
    cats: { zapasy: 5, kuchnia: 3, medyczne: 2, elektro: 1 } },
  { id: 'zlot', name: 'Zlot Chorągwi', icon: '🏁', loc: 'zlot', lvl: 10, size: 1.9, pay: 1.2, rough: 1.2, w: 6,
    cats: { biwak: 5, imprezy: 3, kuchnia: 3, elektro: 2, zapasy: 2 } },
  { id: 'perkoz', name: 'Stanica „Perkoz”', icon: '🦆', loc: 'perkoz', lvl: 11, size: 1.6, pay: 1.4, rough: 1.0, w: 5,
    cats: { woda: 6, zapasy: 3, biwak: 2 } },
  { id: 'wot', name: 'Brygada WOT', icon: '🎖️', loc: 'poligon', lvl: 11, size: 1.9, pay: 1.35, rough: 1.6, w: 5,
    cats: { biwak: 4, elektro: 3, medyczne: 3, narzedzia: 2 } },
  { id: 'festiwal', name: 'Festiwal „Pajęczyna”', icon: '🎸', loc: 'festiwal', lvl: 12, size: 2.1, pay: 1.3, rough: 1.5, w: 5,
    cats: { imprezy: 6, elektro: 5, zapasy: 2 } },
  { id: 'regaty', name: 'Komitet regat', icon: '⚓', loc: 'port', lvl: 13, size: 2.0, pay: 1.35, rough: 1.0, w: 5,
    cats: { woda: 6, imprezy: 3, medyczne: 1, zapasy: 1 } },
  { id: 'film', name: 'Ekipa filmowa', icon: '🎬', loc: 'grodzisk', lvl: 14, size: 2.0, pay: 1.5, rough: 1.3, w: 4,
    cats: { elektro: 6, imprezy: 3, biwak: 1, zapasy: 1 } },
  { id: 'targi', name: 'Targi Outdoor', icon: '🏙️', loc: 'grodzisk', lvl: 14, size: 2.2, pay: 1.35, rough: 0.9, w: 4,
    cats: { imprezy: 4, biwak: 3, woda: 2, kuchnia: 2, elektro: 2 } },
  { id: 'jamboree', name: 'Sztab Jamboree', icon: '🌍', loc: 'jamboree', lvl: 16, size: 2.6, pay: 1.45, rough: 1.2, w: 5,
    cats: { biwak: 5, imprezy: 5, kuchnia: 3, elektro: 3, medyczne: 2, zapasy: 2 } },
];

export const CLIENT_BY_ID = Object.fromEntries(CLIENTS.map((cl) => [cl.id, cl]));

export const ACCESS_LABEL = { road: 'droga', offroad: 'bezdroża', water: 'woda' };

// Pogoda: speed — mnożnik prędkości, dmg — mnożnik uszkodzeń, demand — popyt na kategorie,
// closed — zamknięte dojazdy, grounded — uziemione typy pojazdów.
export const WEATHER = [
  { id: 'slonce', name: 'Słonecznie', icon: '☀️', w: 34, speed: 1, dmg: 1 },
  { id: 'chmury', name: 'Pochmurno', icon: '⛅', w: 22, speed: 1, dmg: 1 },
  { id: 'deszcz', name: 'Deszcz', icon: '🌧️', w: 16, speed: 0.85, dmg: 1.2, demand: { biwak: 1.4 },
    note: 'Wolniejsze trasy, sprzęt bardziej się niszczy.' },
  { id: 'upal', name: 'Upał', icon: '🥵', w: 12, speed: 1, dmg: 1, demand: { zapasy: 1.7, woda: 1.4 },
    note: 'Wszyscy chcą wody, lodu i kajaków.' },
  { id: 'wiatr', name: 'Wichura', icon: '💨', w: 7, speed: 0.95, dmg: 1.3, grounded: ['air'],
    note: 'Drony i śmigłowce zostają na ziemi.' },
  { id: 'mgla', name: 'Mgła', icon: '🌫️', w: 5, speed: 0.8, dmg: 1, grounded: ['air'], demand: { elektro: 1.4 },
    note: 'Wolniej na drogach, nic nie lata.' },
  { id: 'burza', name: 'Burza', icon: '⛈️', w: 4, speed: 0.7, dmg: 1.5, closed: ['water'], grounded: ['air'], demand: { medyczne: 1.5 },
    note: 'Jezioro zamknięte, sprzęt w terenie obrywa.' },
];

export const WEATHER_BY_ID = Object.fromEntries(WEATHER.map((w) => [w.id, w]));
