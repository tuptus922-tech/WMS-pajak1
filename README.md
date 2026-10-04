# Pająk Logistics 🕷️

Gra logistyczna zrobiona z aplikacji WMS dla HOSW Pająk. Zamiast prowadzić zeszyt kwatermistrza — grasz kwatermistrzem: zaczynasz z szopą, taczką i 600 zł, a kończysz z hubem logistycznym, flotą ciężarówek, barką i śmigłowcem.

> Technologia: React + Vite. Bez backendu — gra zapisuje się w przeglądarce (localStorage).

## Jak uruchomić

```bash
cd app
npm install
npm run dev
```

Potem otwórz adres, który wypisze Vite (domyślnie http://localhost:5173).

| Polecenie | Co robi |
|---|---|
| `npm run dev` | serwer deweloperski |
| `npm run build` | wersja produkcyjna w `app/dist` |
| `npm test` | testy silnika gry |
| `npm run sim -- 80 1` | bot gra 80 dni (ziarno 1) i wypisuje przebieg — do strojenia balansu |
| `npm run lint` | oxlint |

## Jak się gra

Pętla jest ta sama, co w prawdziwym magazynie bazy — **wydaj → teren → przyjmij → napraw**:

1. **Zlecenia** — klienci (podobozy, WOPR, kuchnia, OSP, festiwal…) proszą o sprzęt i zapasy. Sprawdzasz stan, dobierasz pojazd i wysyłasz kurs. Zapłata przychodzi przy dostawie.
2. **Magazyn** — dokupujesz towar w hurtowni. Ceny zmieniają się codziennie, jest okazja dnia. Każda sztuka sprzętu zajmuje miejsce na półce, także ta wydana w teren.
3. **Teren** — mapa okolicy z jeżdżącymi pojazdami. Wypożyczony sprzęt po kilku dniach wraca na rampę i trzeba go przyjąć.
4. **Usterki** — część sprzętu wraca uszkodzona. Naprawiasz w warsztacie albo oddajesz na złom.
5. **Baza** — flota, budynki, kadra, sprawności, zadania, odznaki, raport i opcje.

Sterowanie: spacja = pauza, klawisze 1 / 2 / 3 = tempo 1× / 2× / 4×.

## Co jest w grze

- **73 towary** w 8 kategoriach: od koca i menażki po scenę modułową, halę namiotową i telebim
- **19 miejsc** na mapie i **23 klientów** — drogą, bezdrożami i wodą
- **16 pojazdów**: taczka, rower cargo, Żuk, Star 266, motorówka, barka, dron, TIR, śmigłowiec…
- **11 budynków** do rozbudowy (magazyn, warsztat, biuro, garaż, rampa, chłodnia, stacja paliw, przystań, lądowisko…)
- **10 osób kadry**, w tym automaty: magazynier, serwisant, mechanik i dyspozytor
- **22 sprawności** kupowane za punkty z awansów
- **28 zdarzeń losowych** z wyborami (burza, Sanepid, dzik w spiżarni, kontrola drogowa…)
- **45 zadań** prowadzących od pierwszego wydania do Jamboree i **40 odznak**
- zlecenia zwykłe, pilne, VIP i kontrakty z karą umowną
- pogoda, wahania cen, zużycie pojazdów, renoma, raport tygodnia z oceną Komendy
- 20 stopni: od Biszkopta do Legendy Pająka

## Jak to jest zbudowane

```
app/src/
  game/
    engine.js        symulacja — czysty JS bez Reacta, działa też w Node
    store.js         zegar gry, zapis, hook useGame()
    view.js          tłumaczy stan gry na dane dla komponentów
    sfx.js           dźwięki z Web Audio
    data/            cała zawartość: towary, mapa, flota, budynki, zdarzenia, zadania, odznaki
  assets/components/ komponenty (część z szablonu WMS: ItemCard, LoanRow, FaultRow, StatsRow…)
  assets/pages/      Pulpit, Zlecenia, Magazyn, Teren, Usterki, Baza
app/tests/           testy silnika i bot do symulacji
```

Nowa zawartość to zwykle jeden wpis w `game/data/` — np. nowy towar w `items.js` albo zdarzenie w `events.js`. Liczby balansu (ceny, stawki, szanse) siedzą w danych, wzory w `engine.js`.

## Skąd to się wzięło

Projekt jest forkiem [WMS-pajak](https://github.com/LegitBiscu150/WMS-pajak) — aplikacji do zarządzania magazynem sprzętu bazy harcerskiej. Gra zachowuje jej wygląd, komponenty i nazewnictwo (Pulpit, Magazyn, Teren, Usterki, WYDAJ / PRZYJMIJ), ale logowanie i baza Supabase zostały usunięte.
