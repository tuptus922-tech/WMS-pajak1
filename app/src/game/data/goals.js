// Zadania — łańcuch celów prowadzący gracza od taczki do Jamboree.
// prog(s) zwraca [aktualnie, cel]; zadanie jest zaliczone, gdy aktualnie >= cel.

const stat = (key, n) => (s) => [s.stats[key] || 0, n];
const level = (n) => (s) => [s.level, n];
const bld = (id, n) => (s) => [s.buildings[id] || 0, n];
const loc = (id) => (s) => [s.stats.locs[id] ? 1 : 0, 1];
const owns = (type) => (s) => [s.vehicles.some((v) => v.type === type) ? 1 : 0, 1];
const staffCount = (n) => (s) => [Object.values(s.staff).filter(Boolean).length, n];
const perkCount = (n) => (s) => [Object.values(s.perks).filter(Boolean).length, n];
const clients = (n) => (s) => [Object.keys(s.stats.clients).length, n];

export const GOALS = [
  { id: 'start', title: 'Pierwsze wydanie', desc: 'Wejdź w Zlecenia i wyślij taczką dowolne zamówienie.', prog: stat('orders', 1), cash: 80 },
  { id: 'zakupy', title: 'Zatowaruj się', desc: 'Kup w Magazynie co najmniej 5 sztuk dowolnego towaru.', prog: stat('bought', 5), cash: 60 },
  { id: 'kursy5', title: 'Rozgrzewka', desc: 'Zrealizuj 5 zleceń.', prog: stat('orders', 5), cash: 120 },
  { id: 'zwrot', title: 'Rampa zwrotów', desc: 'Gdy wypożyczony sprzęt wróci, przyjmij go w zakładce Teren.', prog: stat('returns', 1), cash: 60 },
  { id: 'lvl2', title: 'Młodzik', desc: 'Zdobądź 2. poziom.', prog: level(2), cash: 100 },
  { id: 'rower', title: 'Za bramę', desc: 'Kup rower cargo — pierwszy pojazd, który wyjedzie poza bazę.', prog: owns('rower'), cash: 150 },
  { id: 'tysiac', title: 'Pierwszy tysiąc', desc: 'Zarób łącznie 1 000 zł na zleceniach.', prog: stat('earned', 1000), cash: 150 },
  { id: 'naprawa', title: 'Druga młodość', desc: 'Napraw uszkodzony sprzęt w zakładce Usterki.', prog: stat('repairs', 1), cash: 80 },
  { id: 'sprawnosc', title: 'Pierwsza sprawność', desc: 'Wydaj punkt sprawności w zakładce Baza.', prog: perkCount(1), cash: 120 },
  { id: 'magazyn2', title: 'Blaszak', desc: 'Rozbuduj magazyn do 2. poziomu.', prog: bld('magazyn', 2), cash: 200 },
  { id: 'kadra1', title: 'Pomocna dłoń', desc: 'Zatrudnij pierwszą osobę do kadry.', prog: staffCount(1), cash: 200 },
  { id: 'pilne', title: 'Na sygnale', desc: 'Zrealizuj pilne zlecenie przed terminem.', prog: stat('pilne', 1), cash: 200 },
  { id: 'rampa', title: 'Szybki załadunek', desc: 'Zbuduj rampę załadunkową.', prog: bld('rampa', 1), cash: 200 },
  { id: 'zalesie', title: 'Wieś wzywa', desc: 'Dostarcz zlecenie do Zalesia (od 3. poziomu).', prog: loc('zalesie'), cash: 250 },
  { id: 'kursy25', title: 'Wprawa', desc: 'Zrealizuj 25 zleceń.', prog: stat('orders', 25), cash: 300 },
  { id: 'chlodnia', title: 'Na zimno', desc: 'Zbuduj chłodnię, żeby handlować kiełbasą i nabiałem.', prog: bld('chlodnia', 1), cash: 300 },
  { id: 'zuk', title: 'Legenda szos', desc: 'Kup Żuka A-07.', prog: owns('zuk'), cash: 500 },
  { id: 'klienci6', title: 'Stali klienci', desc: 'Obsłuż 6 różnych klientów.', prog: clients(6), cash: 400 },
  { id: 'kontrakt', title: 'Słowo harcerza', desc: 'Przyjmij i zrealizuj kontrakt (od 5. poziomu).', prog: stat('kontrakty', 1), cash: 600 },
  { id: 'las', title: 'W las', desc: 'Kup pojazd terenowy i dowieź zlecenie do Leśniczówki.', prog: loc('lesniczowka'), cash: 600 },
  { id: 'kadra3', title: 'Ekipa', desc: 'Miej jednocześnie 3 osoby w kadrze.', prog: staffCount(3), cash: 600 },
  { id: 'magazyn3', title: 'Na murowane', desc: 'Rozbuduj magazyn do 3. poziomu.', prog: bld('magazyn', 3), cash: 700 },
  { id: 'sosnowka', title: 'Do miasta', desc: 'Dostarcz zlecenie do Sosnówki (od 6. poziomu).', prog: loc('sosnowka'), cash: 800 },
  { id: 'vip', title: 'Czerwony dywan', desc: 'Zrealizuj zlecenie VIP.', prog: stat('vip', 1), cash: 800 },
  { id: 'dziesiec', title: 'Dziesięć tysięcy', desc: 'Zarób łącznie 10 000 zł.', prog: stat('earned', 10000), cash: 800 },
  { id: 'przystan', title: 'Pomost', desc: 'Zbuduj przystań (od 7. poziomu).', prog: bld('przystan', 1), cash: 1200 },
  { id: 'wyspa', title: 'Rejs na Wyspę', desc: 'Kup motorówkę i dowieź zlecenie na Wyspę Kormoranów.', prog: loc('wyspa'), cash: 1500 },
  { id: 'flota5', title: 'Baza transportowa', desc: 'Miej 5 pojazdów we flocie.', prog: (s) => [s.vehicles.length, 5], cash: 1500 },
  { id: 'kursy100', title: 'Setka', desc: 'Zrealizuj 100 zleceń.', prog: stat('orders', 100), cash: 1500 },
  { id: 'renoma75', title: 'Dobra marka', desc: 'Osiągnij 75 punktów renomy.', prog: (s) => [Math.floor(s.rep), 75], cash: 2000 },
  { id: 'schronisko', title: 'Pod Pajęczyną', desc: 'Dowieź zlecenie do schroniska w górach (od 9. poziomu).', prog: loc('schronisko'), cash: 2500 },
  { id: 'lvl10', title: 'Kwatermistrz', desc: 'Zdobądź 10. poziom.', prog: level(10), cash: 3000 },
  { id: 'dron', title: 'Nad koronami drzew', desc: 'Zbuduj lądowisko i kup drona cargo.', prog: owns('dron'), cash: 3000 },
  { id: 'dyspozytor', title: 'Samo się wozi', desc: 'Zatrudnij dyspozytora.', prog: (s) => [s.staff.dyspozytor ? 1 : 0, 1], cash: 3000 },
  { id: 'zlot', title: 'Zlot Chorągwi', desc: 'Dowieź zlecenie na pole zlotowe.', prog: loc('zlot'), cash: 4000 },
  { id: 'stotysiecy', title: 'Sto tysięcy', desc: 'Zarób łącznie 100 000 zł.', prog: stat('earned', 100000), cash: 5000 },
  { id: 'magazyn5', title: 'Wysoki skład', desc: 'Rozbuduj magazyn do 5. poziomu.', prog: bld('magazyn', 5), cash: 6000 },
  { id: 'poligon', title: 'Baczność!', desc: 'Dowieź zlecenie na Poligon WOT.', prog: loc('poligon'), cash: 6000 },
  { id: 'festiwal', title: 'Backstage', desc: 'Dowieź zlecenie na Festiwal „Pajęczyna”.', prog: loc('festiwal'), cash: 8000 },
  { id: 'kontrakty10', title: 'Solidna firma', desc: 'Zrealizuj 10 kontraktów.', prog: stat('kontrakty', 10), cash: 8000 },
  { id: 'lvl15', title: 'Harcmistrz', desc: 'Zdobądź 15. poziom.', prog: level(15), cash: 12000 },
  { id: 'tir', title: 'Osiemnaście kół', desc: 'Kup ciągnik z naczepą.', prog: owns('tir'), cash: 15000 },
  { id: 'jamboree', title: 'Jamboree', desc: 'Dowieź zlecenie na Jamboree międzynarodowe.', prog: loc('jamboree'), cash: 20000 },
  { id: 'milion', title: 'Milioner z taczką', desc: 'Zarób łącznie 1 000 000 zł.', prog: stat('earned', 1000000), cash: 50000 },
  { id: 'lvl20', title: 'Legenda Pająka', desc: 'Zdobądź 20. poziom.', prog: level(20), cash: 100000 },
];
