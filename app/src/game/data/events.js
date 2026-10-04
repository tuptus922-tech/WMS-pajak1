// Zdarzenia losowe. Każdy wybór dostaje `api` z silnika (engine.js → eventApi)
// i zwraca tekst wyniku pokazywany graczowi.
// api.scale(n) skaluje kwoty z poziomem gracza, api.zl(n) formatuje złotówki.

import { ITEM_BY_ID } from './items.js';

export const EVENTS = [
  {
    id: 'burza', icon: '⛈️', title: 'Burza nad jeziorem',
    text: 'Synoptycy z wieży ostrzegają: idzie nawałnica. Sprzęt w terenie stoi pod gołym niebem.',
    when: (s) => s.loans.length > 0,
    choices: [
      { label: 'Wyślij ekipę z plandekami', hint: (a) => `koszt ${a.zl(a.scale(40))}`,
        run: (a) => { a.cash(-a.scale(40)); a.rep(1); return 'Ekipa zdążyła przed pierwszym grzmotem. Sprzęt suchy, klienci wdzięczni.'; } },
      { label: 'Przeczekamy', hint: () => 'sprzęt w terenie oberwie',
        run: (a) => { a.mod('dmg', null, 1.6, 24, 'Po burzy: więcej uszkodzeń'); return 'Lało całą noc. Zwroty z najbliższej doby będą w gorszym stanie.'; } },
    ],
  },
  {
    id: 'sanepid', icon: '🧫', title: 'Wizytacja Sanepidu',
    text: 'Pani inspektor stoi przed magazynem z notesem i białą rękawiczką.',
    choices: [
      { label: 'Wielkie sprzątanie', hint: (a) => `koszt ${a.zl(a.scale(60))}`,
        run: (a) => { a.cash(-a.scale(60)); a.rep(2); return 'Magazyn lśni. Inspektorka wpisała pochwałę do protokołu.'; } },
      { label: 'Jakoś to będzie', hint: () => 'ryzyko mandatu',
        run: (a) => {
          if (a.rand() < 0.5) { a.cash(-a.scale(150)); a.rep(-3); return `Rękawiczka zrobiła się szara. Mandat ${a.zl(a.scale(150))} i plotki w okolicy.`; }
          return 'Inspektorka zajrzała tylko do kuchni. Upiekło się.';
        } },
    ],
  },
  {
    id: 'inwentaryzacja', icon: '📋', title: 'Inwentaryzacja',
    text: 'Stan w zeszycie nie zgadza się z półkami. Ktoś musi to policzyć.',
    choices: [
      { label: 'Liczymy do rana', hint: () => 'kadra będzie niewyspana',
        run: (a) => {
          const it = a.pickItem((x) => x.kind === 'gear');
          const n = a.randInt(2, 4);
          a.give(it.id, n);
          a.mod('demand', null, 0.7, 10, 'Niewyspana kadra: mniej zleceń');
          return `Za regałem znalazło się ${n}× ${it.name}! Za to jutro wszyscy ziewają.`;
        } },
      { label: 'Zrobimy to po sezonie', hint: () => 'nic się nie zmienia',
        run: (a) => { a.xp(5); return 'Zeszyt wraca do szuflady. Jak zawsze.'; } },
    ],
  },
  {
    id: 'kradziez', icon: '🦹', title: 'Nocni goście',
    text: 'O trzeciej nad ranem ktoś majstruje przy drzwiach magazynu.',
    when: (s) => !(s.buildings.monitoring > 0),
    choices: [
      { label: 'Gonić ich!', hint: (a) => (a.has('stroz') ? 'stróż już biegnie' : 'może się udać'),
        run: (a) => {
          if (a.has('stroz') || a.rand() < 0.5) { a.rep(1); a.xp(10); return 'Złodzieje uciekli z pustymi rękami, zostawiając latarkę. Bohater bazy!'; }
          const lost = a.loseStock(() => true, 0.1);
          return `Zanim ktokolwiek dobiegł, zniknęło ${lost} szt. towaru. Czas pomyśleć o ogrodzeniu.`;
        } },
      { label: 'Zadzwonić po policję', hint: () => 'bezpieczniej, ale wolniej',
        run: (a) => {
          const lost = a.loseStock(() => true, a.has('stroz') ? 0 : 0.05);
          return lost ? `Patrol przyjechał po godzinie. Straty: ${lost} szt.` : 'Stróż przytrzymał drzwi do przyjazdu patrolu. Nic nie zginęło.';
        } },
    ],
  },
  {
    id: 'dzik', icon: '🐗', title: 'Dzik w spiżarni',
    text: 'Wielki odyniec wszedł do magazynu zapasów i nie zamierza wychodzić.',
    when: (s) => !(s.buildings.monitoring > 0) && Object.keys(s.stock).some((id) => s.stock[id] > 0 && ITEM_BY_ID[id]?.kind === 'cons'),
    choices: [
      { label: 'Przepłoszyć garnkami', hint: () => 'narobi szkód',
        run: (a) => { const lost = a.loseStock((x) => x.kind === 'cons', 0.15); return `Uciekł, ale po drodze stratował ${lost} szt. zapasów.`; } },
      { label: 'Zostawić mu chleb', hint: () => 'harcerze go pokochają',
        run: (a) => { const lost = a.loseStock((x) => x.id === 'chleb' || x.id === 'drozdzowki', 1); a.rep(2); return `Zjadł ${lost} szt. pieczywa i poszedł. Podobozy mają nową maskotkę.`; } },
    ],
  },
  {
    id: 'sponsor', icon: '🎁', title: 'Darowizna sponsora',
    text: 'Lokalny przedsiębiorca chce wesprzeć bazę. Pyta, czego potrzebujecie.',
    choices: [
      { label: 'Sprzęt', hint: () => 'losowy sprzęt na magazyn',
        run: (a) => { const it = a.pickItem((x) => x.kind === 'gear' && x.price <= a.scale(140)); const n = Math.max(1, Math.min(8, Math.round(a.scale(120) / it.price))); a.give(it.id, n); return `Przyjechała paczka: ${n}× ${it.name}.`; } },
      { label: 'Gotówka', hint: (a) => `+${a.zl(a.scale(110))}`,
        run: (a) => { a.cash(a.scale(110)); return 'Przelew doszedł jeszcze tego samego dnia.'; } },
    ],
  },
  {
    id: 'wyprzedaz', icon: '🏷️', title: 'Wyprzedaż w hurtowni',
    text: 'Hurtownia czyści magazyn przed dostawą. Jedna kategoria tanieje o jedną trzecią.',
    choices: [
      { label: 'Jedziemy na zakupy', hint: () => 'promocja trwa dobę',
        run: (a) => { const cat = a.pickCat(); a.mod('price', cat.id, 0.67, 24, `Wyprzedaż: ${cat.name} −33%`); return `Przez najbliższą dobę ${cat.name.toLowerCase()} w hurtowni kosztuje o 33% mniej.`; } },
    ],
  },
  {
    id: 'zjazd', icon: '🚌', title: 'Zjazd drużyn',
    text: 'Trzy autokary harcerzy wysypują się na parking. Wszyscy czegoś potrzebują.',
    choices: [
      { label: 'Obsłużymy wszystkich', hint: () => 'dużo więcej zleceń przez dobę',
        run: (a) => { a.mod('demand', null, 1.9, 24, 'Zjazd drużyn: zlecenia sypią się jak z rękawa'); return 'Tablica zleceń pęka w szwach. Do roboty!'; } },
      { label: 'Tylko za dobrą stawkę', hint: () => 'stawki +20% przez dobę',
        run: (a) => { a.mod('payout', null, 1.2, 24, 'Zjazd drużyn: stawki +20%'); return 'Mniej zamieszania, lepsze faktury.'; } },
    ],
  },
  {
    id: 'upal', icon: '🥵', title: 'Fala upałów',
    text: 'Termometr na ścianie magazynu pokazuje 36°C. Podobozy proszą o wodę.',
    choices: [
      { label: 'Rozstaw kurtyny wodne', hint: (a) => `koszt ${a.zl(a.scale(50))}, renoma w górę`,
        run: (a) => { a.cash(-a.scale(50)); a.rep(3); return 'Dzieciaki szaleją pod wodą, a komendantka dzwoni z podziękowaniami.'; } },
      { label: 'Woda po cenach z plaży', hint: (a) => `+${a.zl(a.scale(90))}, renoma w dół`,
        run: (a) => { a.cash(a.scale(90)); a.rep(-2); return 'Kasa się zgadza, ale w kolejce słychać szemranie.'; } },
    ],
  },
  {
    id: 'komendant', icon: '⚜️', title: 'Wizyta Komendanta',
    text: 'Komendant Chorągwi chce zobaczyć „ten słynny magazyn”.',
    choices: [
      { label: 'Oprowadź go', hint: () => 'oceni stan sprzętu',
        run: (a) => {
          if (a.faultCount() > 12) { a.rep(-2); return 'Sterta zepsutego sprzętu w kącie zrobiła fatalne wrażenie.'; }
          a.rep(3); a.cash(a.scale(120)); return `Porządek jak w zegarku. Komendant zostawił premię ${a.zl(a.scale(120))}.`;
        } },
      { label: 'Udaj, że nikogo nie ma', hint: () => 'bez ryzyka',
        run: () => 'Posiedział chwilę na ławce i pojechał. Uff.' },
    ],
  },
  {
    id: 'zastep', icon: '🔦', title: 'Zagubiony zastęp',
    text: 'Zastęp „Puszczyków” nie wrócił z gry terenowej. Potrzebne latarki i ludzie.',
    choices: [
      { label: 'Wszystko za darmo, ruszamy!', hint: () => 'renoma mocno w górę',
        run: (a) => { a.rep(4); a.xp(a.scale(15)); return 'Znaleźli się po godzinie, 300 metrów od bazy. Cała okolica mówi o waszej pomocy.'; } },
      { label: 'Wynajem według cennika', hint: (a) => `+${a.zl(a.scale(60))}`,
        run: (a) => { a.cash(a.scale(60)); a.rep(-2); return 'Faktura wystawiona. Oboźny patrzył na was dziwnie.'; } },
    ],
  },
  {
    id: 'kleszcze', icon: '🕷️', title: 'Plaga kleszczy',
    text: 'W tym roku kleszczy jest zatrzęsienie. Wszyscy pytają o apteczki.',
    lvl: 3,
    choices: [
      { label: 'Akcja informacyjna', hint: (a) => `koszt ${a.zl(a.scale(30))}`,
        run: (a) => { a.cash(-a.scale(30)); a.rep(2); a.mod('demand', 'medyczne', 2.2, 24, 'Plaga kleszczy: popyt na sprzęt medyczny'); return 'Plakaty wiszą na każdej sośnie. Zamówienia na sprzęt medyczny rosną.'; } },
      { label: 'Po prostu sprzedawaj', hint: () => 'popyt na sprzęt medyczny',
        run: (a) => { a.mod('demand', 'medyczne', 2.2, 24, 'Plaga kleszczy: popyt na sprzęt medyczny'); return 'Przez dobę sprzęt medyczny schodzi na pniu.'; } },
    ],
  },
  {
    id: 'dotacja', icon: '🏛️', title: 'Dotacja z gminy',
    text: 'Wójt znalazł w budżecie pieniądze „na działalność młodzieżową”.',
    choices: [
      { label: 'Na sprzęt', hint: (a) => `+${a.zl(a.scale(180))}`,
        run: (a) => { a.cash(a.scale(180)); return 'Przelew zaksięgowany. Wójt prosi tylko o zdjęcie do gazetki.'; } },
      { label: 'Na szkolenia kadry', hint: (a) => `+${a.scale(70)} PD`,
        run: (a) => { a.xp(a.scale(70)); return 'Kadra wróciła z kursu z nowymi pomysłami.'; } },
    ],
  },
  {
    id: 'awaria', icon: '🔧', title: 'Stuki spod maski',
    text: 'Jeden z pojazdów zaczął wydawać niepokojące dźwięki.',
    when: (s) => s.vehicles.length > 0,
    choices: [
      { label: 'Szybka naprawa', hint: (a) => `koszt ${a.zl(a.scale(35))}`,
        run: (a) => { a.cash(-a.scale(35)); const v = a.vehDamage(10); return `${v} dostał nowe łożysko. Prawie jak nowy.`; } },
      { label: 'Podgłośnij radio', hint: () => 'pojazd mocno się zużyje',
        run: (a) => { const v = a.vehDamage(35); return `${v} jeździ dalej, ale stan wyraźnie się pogorszył.`; } },
    ],
  },
  {
    id: 'paliwodrogie', icon: '⛽', title: 'Paliwo drożeje',
    text: 'Na stacji w Sosnówce zmieniają cyferki na pylonie. W górę.',
    lvl: 3,
    choices: [
      { label: 'Zatankuj na zapas', hint: (a) => `koszt ${a.zl(a.scale(70))}`,
        run: (a) => { a.cash(-a.scale(70)); return 'Kanistry pełne. Podwyżka was nie dotyczy.'; } },
      { label: 'Trudno', hint: () => 'paliwo +40% przez dwie doby',
        run: (a) => { a.mod('fuel', null, 1.4, 48, 'Drogie paliwo +40%'); return 'Każdy kilometr będzie teraz bolał.'; } },
    ],
  },
  {
    id: 'paliwotanie', icon: '🛢️', title: 'Promocja na stacji',
    text: 'Stacja w Zalesiu świętuje dziesięciolecie. Paliwo po kosztach.',
    lvl: 3,
    choices: [
      { label: 'Świetnie!', hint: () => 'paliwo −40% przez dobę',
        run: (a) => { a.mod('fuel', null, 0.6, 24, 'Tanie paliwo −40%'); return 'Dobry dzień na dalekie kursy.'; } },
    ],
  },
  {
    id: 'szopa', icon: '🏚️', title: 'Znalezisko w starej szopie',
    text: 'Pod stertą desek leży przedwojenny namiot z orzełkiem i komplet mosiężnych menażek.',
    choices: [
      { label: 'Sprzedaj kolekcjonerowi', hint: (a) => `+${a.zl(a.scale(170))}`,
        run: (a) => { a.cash(a.scale(170)); return 'Kolekcjoner zapłacił bez targowania.'; } },
      { label: 'Oddaj do izby pamięci', hint: () => 'renoma w górę',
        run: (a) => { a.rep(4); return 'Na gablocie wisi tabliczka z nazwą waszej bazy.'; } },
    ],
  },
  {
    id: 'zlotaraczka', icon: '🧑‍🔧', title: 'Harcerz złota rączka',
    text: 'Druh Zbyszek ma wolne popołudnie i nudzi się bez śrubokręta.',
    when: (s) => Object.values(s.faults).some((f) => f.repair > 0),
    choices: [
      { label: 'Niech naprawia', hint: () => 'do 6 napraw za darmo',
        run: (a) => { const n = a.freeRepairs(6); return `Zbyszek naprawił ${n} szt. sprzętu i nawet nie chciał herbaty.`; } },
      { label: 'Niech uczy innych', hint: () => 'warsztat 2× szybszy przez dwie doby',
        run: (a) => { a.mod('repairSpeed', null, 2, 48, 'Szkolenie Zbyszka: naprawy 2× szybciej'); return 'W warsztacie aż furczy.'; } },
    ],
  },
  {
    id: 'podtopienie', icon: '🌊', title: 'Podtopiona droga',
    text: 'Po nocnej ulewie jedna z dróg jest nieprzejezdna.',
    lvl: 3,
    choices: [
      { label: 'Czekamy, aż opadnie', hint: () => 'jedno miejsce zamknięte na pół doby',
        run: (a) => { const loc = a.closeLocation(12); return loc ? `Dojazd do: ${loc} — zamknięty na 12 godzin.` : 'Na szczęście woda zeszła, zanim ktokolwiek wyjechał.'; } },
    ],
  },
  {
    id: 'kontrola', icon: '🚓', title: 'Kontrola drogowa',
    text: 'Patrol zatrzymuje wasz pojazd tuż za bramą bazy.',
    lvl: 4,
    when: (s) => s.vehicles.some((v) => v.type !== 'taczka' && v.type !== 'wozek'),
    choices: [
      { label: 'Okaż dokumenty', hint: () => 'liczy się stan floty',
        run: (a) => {
          if (a.worstVehicle() < 40) { a.cash(-a.scale(100)); return `Łyse opony i cieknący olej. Mandat ${a.zl(a.scale(100))}.`; }
          a.rep(1); return 'Wszystko w porządku. „Szerokiej drogi, druhu.”';
        } },
      { label: 'Poczęstuj drożdżówką', hint: () => 'jeśli macie drożdżówki…',
        run: (a) => {
          if (a.take('drozdzowki', 1)) { a.rep(1); return 'Drożdżówka zrobiła swoje. Patrol życzy miłego dnia.'; }
          a.cash(-a.scale(60)); return `Nie macie drożdżówek. Jest za to mandat ${a.zl(a.scale(60))} „za całokształt”.`;
        } },
    ],
  },
  {
    id: 'influencer', icon: '🤳', title: 'Influencer na biwaku',
    text: '„Hej, robię relację z survivalu, macie jakiś sprzęt za oznaczenie?”',
    lvl: 4,
    choices: [
      { label: 'Sprzęt za reklamę', hint: () => 'ryzyko, ale i zasięgi',
        run: (a) => {
          if (a.rand() < 0.7) { a.rep(5); return 'Filmik ma 200 tysięcy wyświetleń. Telefon się urywa.'; }
          const n = a.breakStock(3); a.rep(1); return `Sprzęt wrócił po „teście wytrzymałości”. ${n} szt. do naprawy.`;
        } },
      { label: 'Normalny cennik', hint: (a) => `+${a.zl(a.scale(90))}`,
        run: (a) => { a.cash(a.scale(90)); return 'Zapłacił i nawet ładnie podziękował.'; } },
    ],
  },
  {
    id: 'myszy', icon: '🐭', title: 'Myszy w śpiworach',
    text: 'W stercie koców coś szeleści. Dużo czegoś.',
    when: (s) => (s.stock.koc || 0) + (s.stock.spiwor || 0) + (s.stock.karimata || 0) > 6,
    choices: [
      { label: 'Zatrudnić kota', hint: (a) => `koszt ${a.zl(a.scale(45))}`,
        run: (a) => { a.cash(-a.scale(45)); a.rep(1); return 'Mruczek objął stanowisko. Myszy wyniosły się do kuchni.'; } },
      { label: 'Rozstawić łapki', hint: () => 'część tekstyliów do naprawy',
        run: (a) => { const n = a.breakStock(0, (x) => ['koc', 'spiwor', 'karimata', 'lateks'].includes(x.id), 0.12); return `Zanim łapki zadziałały, myszy pogryzły ${n} szt. Trafiły do warsztatu.`; } },
    ],
  },
  {
    id: 'telewizja', icon: '📺', title: 'Telewizja regionalna',
    text: 'Ekipa kręci materiał o „logistyce harcerskiego lata”.',
    lvl: 5,
    choices: [
      { label: 'Udziel wywiadu', hint: () => 'renoma w górę',
        run: (a) => { a.rep(4); return 'Wyszło świetnie. Nawet taczka załapała się w kadr.'; } },
      { label: 'Lokowanie hurtowni', hint: (a) => `+${a.zl(a.scale(150))}`,
        run: (a) => { a.cash(a.scale(150)); a.rep(1); return 'Baner hurtowni w tle, przelew na koncie.'; } },
    ],
  },
  {
    id: 'strajk', icon: '🪧', title: 'Strajk w hurtowni',
    text: 'Magazynierzy hurtowni rozpalili koksownik przed bramą.',
    lvl: 4,
    choices: [
      { label: 'Przeczekać', hint: () => 'dostawy 3× wolniej, ceny +20% przez dobę',
        run: (a) => { a.mod('delivery', null, 3, 24, 'Strajk: wolne dostawy'); a.mod('price', null, 1.2, 24, 'Strajk: ceny +20%'); return 'Dostawy będą się wlokły. Dobrze mieć zapas.'; } },
      { label: 'Zawieźć im herbatę', hint: (a) => `koszt ${a.zl(a.scale(25))}, może pomoże`,
        run: (a) => { a.cash(-a.scale(25)); a.rep(1); a.mod('delivery', null, 1.5, 24, 'Strajk: nieco wolniejsze dostawy'); return 'Strajkujący po cichu wypuszczają wasze zamówienia bokiem.'; } },
    ],
  },
  {
    id: 'perseidy', icon: '🌠', title: 'Noc spadających gwiazd',
    text: 'Perseidy! Wszystkie podobozy chcą spać pod gołym niebem.',
    choices: [
      { label: 'Karimaty na rampę!', hint: () => 'popyt na sprzęt biwakowy',
        run: (a) => { a.mod('demand', 'biwak', 2, 24, 'Perseidy: popyt na biwak'); return 'Zamówienia na koce i karimaty lecą jedno za drugim.'; } },
    ],
  },
  {
    id: 'pizza', icon: '🍕', title: 'Kadra burczy w brzuchach',
    text: 'Od rana nikt nic nie jadł, a kursów jest jeszcze sporo.',
    lvl: 2,
    choices: [
      { label: 'Pizza dla wszystkich', hint: (a) => `koszt ${a.zl(a.scale(40))}, flota przyspiesza`,
        run: (a) => { a.cash(-a.scale(40)); a.mod('speed', null, 1.2, 24, 'Najedzona kadra: kursy 20% szybciej'); return 'Najedzeni kierowcy latają jak na skrzydłach.'; } },
      { label: 'Są suchary', hint: () => 'nic się nie zmienia',
        run: () => 'Suchary z 2009 roku. Nikt nie narzekał głośno.' },
    ],
  },
  {
    id: 'polisa', icon: '📑', title: 'Agent ubezpieczeniowy',
    text: '„Dzień dobry, czy sprzęt w terenie jest ubezpieczony?”',
    lvl: 3,
    choices: [
      { label: 'Wykup polisę na tydzień', hint: (a) => `koszt ${a.zl(a.scale(90))}`,
        run: (a) => { a.cash(-a.scale(90)); a.mod('insurance', null, 1, 24 * 7, 'Polisa: zwrot za zniszczony sprzęt'); return 'Przez tydzień za każdą zniszczoną sztukę dostaniecie pełny zwrot.'; } },
      { label: 'Dziękuję, mamy taśmę', hint: () => 'bez zmian',
        run: () => 'Agent zostawił wizytówkę i odjechał skodą.' },
    ],
  },
  {
    id: 'mecz', icon: '⚽', title: 'Mecz baza kontra wieś',
    text: 'Zalesie wyzywa bazę na mecz. Stawką jest honor i skrzynka oranżady.',
    lvl: 3,
    choices: [
      { label: 'Gramy!', hint: () => 'honor albo guz',
        run: (a) => {
          if (a.rand() < 0.5) { a.rep(3); a.give('woda', 6); return 'Wygrana 4:3 po golu oboźnego! Oranżada (no, woda) trafia na magazyn.'; }
          a.rep(1); return 'Porażka 1:5, ale trzecia połowa przy ognisku była najlepsza.';
        } },
      { label: 'Sędziujemy', hint: (a) => `+${a.zl(a.scale(30))}`,
        run: (a) => { a.cash(a.scale(30)); return 'Sołtys zapłacił za gwizdek i dwie kartki.'; } },
    ],
  },
];

export const EVENT_BY_ID = Object.fromEntries(EVENTS.map((e) => [e.id, e]));
