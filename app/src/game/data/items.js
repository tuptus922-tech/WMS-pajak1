// Katalog towarów. Sprzęt (kind: 'gear') się wypożycza i wraca z terenu,
// zapasy (kind: 'cons') są zużywane przez klienta.

export const CATEGORIES = [
  { id: 'biwak', name: 'Biwak', icon: '⛺' },
  { id: 'woda', name: 'Woda', icon: '🛶' },
  { id: 'kuchnia', name: 'Kuchnia', icon: '🍲' },
  { id: 'narzedzia', name: 'Narzędzia', icon: '🪓' },
  { id: 'medyczne', name: 'Medyczne', icon: '⛑️' },
  { id: 'elektro', name: 'Elektro', icon: '🔌' },
  { id: 'imprezy', name: 'Imprezy', icon: '🎪' },
  { id: 'zapasy', name: 'Zapasy', icon: '🥫' },
];

// g(id, nazwa, ikona, kategoria, poziom, cena, objętość, czynsz za dobę, szansa uszkodzenia)
function g(id, name, icon, cat, lvl, price, vol, rent, dmg) {
  return {
    id, name, icon, cat, lvl, price, vol, rent, dmg,
    kind: 'gear',
    fix: Math.max(2, Math.round(price * 0.18)),
    fixMin: Math.round(30 + Math.sqrt(price) * 6),
    maxQty: Math.max(1, Math.min(40, Math.round(9000 / price))),
  };
}

// c(id, nazwa, ikona, poziom, cena zakupu, cena dla klienta, objętość, wymaga chłodni)
function c(id, name, icon, lvl, price, sell, vol, cold = false) {
  return {
    id, name, icon, cat: 'zapasy', lvl, price, sell, vol, cold,
    kind: 'cons',
    maxQty: 60,
  };
}

export const ITEMS = [
  // --- Biwak ---
  g('koc', 'Koc', '🧣', 'biwak', 1, 25, 1, 4, 0.05),
  g('karimata', 'Karimata', '🧘', 'biwak', 1, 35, 1, 5, 0.07),
  g('spiwor', 'Śpiwór', '🛌', 'biwak', 1, 60, 1, 9, 0.06),
  g('latarka', 'Latarka czołowa', '🔦', 'biwak', 1, 40, 1, 7, 0.08),
  g('lateks', 'Materac „lateks”', '🛏️', 'biwak', 2, 80, 2, 11, 0.07),
  g('namiot2', 'Namiot 2-osobowy', '⛺', 'biwak', 2, 220, 3, 30, 0.09),
  g('plandeka', 'Plandeka', '🟫', 'biwak', 3, 55, 1, 8, 0.09),
  g('lampa', 'Lampa naftowa', '🏮', 'biwak', 3, 70, 1, 10, 0.1),
  g('kanadyjka', 'Łóżko „kanadyjka”', '🪑', 'biwak', 4, 150, 3, 19, 0.08),
  g('hamak', 'Hamak', '🌴', 'biwak', 5, 90, 1, 13, 0.07),
  g('namiot10', 'Namiot NS „dziesiątka”', '🏕️', 'biwak', 6, 900, 10, 110, 0.1),
  g('jurta', 'Jurta zlotowa', '🛖', 'biwak', 13, 6500, 34, 700, 0.07),

  // --- Woda ---
  g('kapok', 'Kapok', '🦺', 'woda', 2, 90, 2, 13, 0.06),
  g('rzutka', 'Rzutka ratownicza', '🪢', 'woda', 2, 60, 1, 9, 0.05),
  g('kolo', 'Koło ratunkowe', '🛟', 'woda', 3, 120, 2, 16, 0.04),
  g('wioslo', 'Komplet wioseł', '🏑', 'woda', 4, 140, 2, 18, 0.09),
  g('kajak', 'Kajak', '🛶', 'woda', 5, 1100, 12, 135, 0.08),
  g('sup', 'Deska SUP', '🏄', 'woda', 8, 1300, 8, 155, 0.08),
  g('ponton', 'Ponton ratowniczy', '🚣', 'woda', 9, 2400, 14, 270, 0.09),
  g('omega', 'Żaglówka „Omega”', '⛵', 'woda', 13, 9000, 40, 900, 0.07),

  // --- Kuchnia ---
  g('menazka', 'Menażka', '🥘', 'kuchnia', 1, 20, 1, 3, 0.04),
  g('kociol', 'Kocioł 30 l', '🍲', 'kuchnia', 3, 260, 4, 33, 0.05),
  g('termos', 'Termos 20 l', '🫖', 'kuchnia', 3, 180, 3, 24, 0.06),
  g('taboret', 'Taboret gazowy', '🍳', 'kuchnia', 4, 160, 2, 21, 0.07),
  g('gasnica', 'Gaśnica', '🧯', 'kuchnia', 4, 110, 2, 14, 0.03),
  g('lodowka', 'Lodówka turystyczna', '🧊', 'kuchnia', 6, 300, 4, 38, 0.07),
  g('grill', 'Grill bębnowy', '♨️', 'kuchnia', 7, 600, 8, 72, 0.06),
  g('kuchniapolowa', 'Kuchnia polowa KP-340', '🚒', 'kuchnia', 8, 4200, 30, 440, 0.06),

  // --- Narzędzia ---
  g('saperka', 'Saperka', '⛏️', 'narzedzia', 1, 45, 1, 7, 0.08),
  g('siekiera', 'Siekiera', '🪓', 'narzedzia', 2, 70, 1, 10, 0.09),
  g('mlot', 'Młot i śledzie', '🔨', 'narzedzia', 2, 40, 1, 6, 0.06),
  g('lina', 'Lina 30 m', '🧵', 'narzedzia', 2, 65, 1, 9, 0.07),
  g('pila', 'Piła ramowa', '🪚', 'narzedzia', 3, 85, 1, 12, 0.1),
  g('drabina', 'Drabina', '🪜', 'narzedzia', 5, 240, 5, 29, 0.05),
  g('skrzynka', 'Skrzynka narzędziowa', '🧰', 'narzedzia', 5, 320, 2, 40, 0.08),
  g('pilarka', 'Pilarka spalinowa', '⚙️', 'narzedzia', 7, 950, 3, 120, 0.14),
  g('wciagarka', 'Wciągarka terenowa', '🪝', 'narzedzia', 11, 2800, 6, 310, 0.1),

  // --- Medyczne ---
  g('apteczka', 'Apteczka', '💊', 'medyczne', 3, 120, 1, 18, 0.05),
  g('nosze', 'Nosze', '🩼', 'medyczne', 6, 400, 5, 50, 0.05),
  g('aed', 'Defibrylator AED', '💓', 'medyczne', 10, 5200, 2, 560, 0.03),
  g('punktmed', 'Namiot punktu medycznego', '⛑️', 'medyczne', 11, 3200, 16, 350, 0.06),

  // --- Elektro ---
  g('radio', 'Krótkofalówka', '📻', 'elektro', 4, 180, 1, 26, 0.09),
  g('megafon', 'Megafon', '📢', 'elektro', 4, 150, 1, 20, 0.08),
  g('reflektor', 'Reflektor LED', '💡', 'elektro', 6, 420, 2, 55, 0.09),
  g('agregat', 'Agregat prądotwórczy', '🔌', 'elektro', 7, 1800, 8, 215, 0.1),
  g('naglosnienie', 'Nagłośnienie', '🔊', 'elektro', 9, 3500, 12, 390, 0.09),
  g('powerstation', 'Stacja zasilania', '🔋', 'elektro', 10, 2200, 3, 260, 0.07),
  g('kino', 'Kino plenerowe', '📽️', 'elektro', 12, 4800, 10, 540, 0.08),

  // --- Imprezy ---
  g('lawki', 'Zestaw stół + ławki', '🪵', 'imprezy', 5, 260, 6, 31, 0.06),
  g('maszt', 'Maszt flagowy', '🚩', 'imprezy', 6, 380, 5, 46, 0.04),
  g('toitoi', 'Toaleta przenośna', '🚽', 'imprezy', 9, 1500, 14, 165, 0.05),
  g('pawilon', 'Pawilon ekspresowy', '🎪', 'imprezy', 8, 800, 6, 95, 0.09),
  g('scena', 'Scena modułowa', '🎭', 'imprezy', 14, 12000, 60, 1250, 0.06),
  g('hala', 'Hala namiotowa', '🏟️', 'imprezy', 16, 18000, 80, 1800, 0.07),
  g('telebim', 'Telebim LED', '📺', 'imprezy', 18, 30000, 30, 3200, 0.08),

  // --- Zapasy ---
  c('woda', 'Zgrzewka wody', '💧', 1, 8, 14, 1),
  c('chleb', 'Chleb (skrzynka)', '🍞', 1, 12, 20, 1),
  c('drewno', 'Drewno opałowe', '🌲', 1, 15, 26, 2),
  c('drozdzowki', 'Drożdżówki', '🥐', 2, 16, 28, 1),
  c('konserwy', 'Konserwy (karton)', '🥫', 2, 30, 49, 1),
  c('baterie', 'Baterie (paczka)', '🪫', 3, 22, 38, 1),
  c('kielbasa', 'Kiełbasa ogniskowa', '🌭', 3, 40, 68, 1, true),
  c('warzywa', 'Warzywa (skrzynka)', '🥕', 4, 20, 34, 2),
  c('gaz', 'Butla gazowa 11 kg', '🛢️', 4, 60, 96, 2),
  c('chemia', 'Środki czystości', '🧴', 4, 26, 43, 1),
  c('wegiel', 'Węgiel drzewny', '⚫', 5, 18, 31, 1),
  c('nabial', 'Nabiał (skrzynka)', '🥛', 5, 24, 42, 1, true),
  c('opatrunki', 'Opatrunki', '🩹', 5, 34, 58, 1),
  c('lod', 'Lód w kostkach', '❄️', 6, 10, 23, 1, true),
  c('kanister', 'Kanister paliwa', '⛽', 7, 70, 108, 2),
  c('lody', 'Lody (karton)', '🍦', 8, 35, 66, 1, true),
  c('race', 'Race świetlne', '🎆', 9, 90, 152, 1),
  c('catering', 'Catering VIP', '🍱', 12, 180, 310, 2, true),
];

export const ITEM_BY_ID = Object.fromEntries(ITEMS.map((it) => [it.id, it]));
export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((ct) => [ct.id, ct]));
