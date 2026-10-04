// Flota. cap — ładowność (j.m.), speed — km/h, cost — zł za km (paliwo),
// range — maks. dystans w jedną stronę, terrain — gdzie pojazd dojedzie,
// wear — % zużycia na km, upkeep — koszt dzienny (OC, postój).

export const VEHICLES = [
  { id: 'taczka', name: 'Taczka', icon: '🛒', lvl: 1, price: 60, cap: 8, speed: 5, cost: 0, range: 2, terrain: ['road'], wear: 0.6, upkeep: 0,
    desc: 'Klasyk kwaterki. Daleko nie zajedzie.' },
  { id: 'wozek', name: 'Wózek platformowy', icon: '🛷', lvl: 1, price: 180, cap: 14, speed: 5, cost: 0, range: 2, terrain: ['road'], wear: 0.5, upkeep: 0,
    desc: 'Więcej skrzynek na jeden kurs po bazie.' },
  { id: 'rower', name: 'Rower cargo', icon: '🚲', lvl: 2, price: 480, cap: 12, speed: 16, cost: 0, range: 12, terrain: ['road'], wear: 0.25, upkeep: 0,
    desc: 'Pierwszy pojazd, który wyjedzie poza bramę.' },
  { id: 'skuter', name: 'Skuter z przyczepką', icon: '🛵', lvl: 3, price: 1500, cap: 20, speed: 38, cost: 0.25, range: 30, terrain: ['road'], wear: 0.12, upkeep: 4,
    desc: 'Szybki goniec na pilne zlecenia.' },
  { id: 'zuk', name: 'Żuk A-07', icon: '🛻', lvl: 4, price: 3900, cap: 45, speed: 50, cost: 0.9, range: 999, terrain: ['road'], wear: 0.1, upkeep: 14,
    desc: 'Pali jak smok, ale wiezie pół magazynu.' },
  { id: 'quad', name: 'Quad z przyczepką', icon: '🏍️', lvl: 5, price: 5200, cap: 18, speed: 45, cost: 0.5, range: 60, terrain: ['road', 'offroad'], wear: 0.1, upkeep: 10,
    desc: 'Pierwszy pojazd terenowy — dojedzie do leśniczówki.' },
  { id: 'lublin', name: 'Lublin 3', icon: '🚐', lvl: 6, price: 9800, cap: 85, speed: 62, cost: 1.2, range: 999, terrain: ['road'], wear: 0.07, upkeep: 28,
    desc: 'Dostawczak z prawdziwego zdarzenia.' },
  { id: 'motorowka', name: 'Motorówka', icon: '🚤', lvl: 7, price: 7500, cap: 38, speed: 40, cost: 1.4, range: 999, terrain: ['water'], wear: 0.1, upkeep: 20, req: { przystan: 1 },
    desc: 'Jedyna droga na Wyspę Kormoranów.' },
  { id: 'uaz', name: 'UAZ 469', icon: '🚙', lvl: 7, price: 11500, cap: 40, speed: 55, cost: 1.3, range: 999, terrain: ['road', 'offroad'], wear: 0.08, upkeep: 24,
    desc: 'Terenówka, która wjedzie wszędzie i wszystko zniesie.' },
  { id: 'transit', name: 'Bus dostawczy', icon: '🚌', lvl: 8, price: 17500, cap: 110, speed: 88, cost: 1.0, range: 999, terrain: ['road'], wear: 0.05, upkeep: 40,
    desc: 'Szybki i oszczędny. Król tras do miasta.' },
  { id: 'star', name: 'Star 266', icon: '🚚', lvl: 9, price: 24000, cap: 160, speed: 48, cost: 2.2, range: 999, terrain: ['road', 'offroad'], wear: 0.06, upkeep: 55,
    desc: 'Wojskowa legenda 6×6. Ciężki sprzęt w każdy teren.' },
  { id: 'dron', name: 'Dron cargo', icon: '🛸', lvl: 10, price: 13000, cap: 6, speed: 130, cost: 0.3, range: 50, terrain: ['air'], wear: 0.08, upkeep: 12, req: { ladowisko: 1 },
    desc: 'Mały ładunek, ale w kilka minut i w każde miejsce.' },
  { id: 'barka', name: 'Barka towarowa', icon: '⛴️', lvl: 11, price: 28000, cap: 240, speed: 20, cost: 1.8, range: 999, terrain: ['water'], wear: 0.05, upkeep: 50, req: { przystan: 2 },
    desc: 'Powolna, ale zabierze całą stanicę naraz.' },
  { id: 'jelcz', name: 'Jelcz z HDS', icon: '🚛', lvl: 12, price: 52000, cap: 320, speed: 58, cost: 2.8, range: 999, terrain: ['road'], wear: 0.05, upkeep: 90,
    desc: 'Żuraw na pace — sceny i hale to dla niego drobiazg.' },
  { id: 'tir', name: 'Ciągnik z naczepą', icon: '🚜', lvl: 15, price: 98000, cap: 640, speed: 78, cost: 3.2, range: 999, terrain: ['road'], wear: 0.04, upkeep: 150,
    desc: 'Cały festiwal na jednej naczepie.' },
  { id: 'smiglowiec', name: 'Śmigłowiec Mi-2', icon: '🚁', lvl: 17, price: 185000, cap: 95, speed: 190, cost: 9, range: 999, terrain: ['air'], wear: 0.05, upkeep: 320, req: { ladowisko: 2 },
    desc: 'Ekspres ponad wszystkim. Pali fortunę.' },
];

export const VEHICLE_BY_ID = Object.fromEntries(VEHICLES.map((v) => [v.id, v]));

export const TERRAIN_LABEL = { road: 'droga', offroad: 'teren', water: 'woda', air: 'powietrze' };
