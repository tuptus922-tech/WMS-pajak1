# Aplikacja WMS dla HOSW Pająk
> Technologia : React + Vite z Supa Base
## PROJEKT APLIKACJI
### 1 Zdefiniuj cel i grupę docelową
> **CELE** : 
> - możliwość łatwego zarządzania stanem magazynowym aby móc na bieżąco aktualizować stan magazynowy i zniwelować częste inwentaryzacje mając świadomość aktualnego stanu
> - posiadanie informacji o stanie magazynowym w czasie rzeczywistym aby wiedzieć na bieżąco ile go jest 
> - posiadanie informacje o stanie sprzetu na magazynie aby wiedzieć czy trzeba dokupić rzeczy , mieć kontrole nad tym kto go mógł zepsuć oraz posiadać statystyki jak szybko sprzęt się psuję (wymaga fizyczengo oznaczania przedmiotów co komplikuje i wydłuża wydawanie sprzętu)
> - Możliwość szybkiego przypisania wydanego sprzętu do konkretnej osoby/drużyny, aby zminimalizować gubienie wyposażenia
> - Umożliwienie obsługi magazynu z poziomu smartfona, co przyspieszy wydawanie sprzętu zachowując aktualny stan magazynowy
> - Automatyzacja procesu inwentaryzacji i generowania raportów po sezonie/obozie
>
> **GRUPA DOCELOWA** : 
> - kadra bazy pająk
> - kwaterka i pracownicy
> - kwatermistrz
### 2 Określ zakres funkcji (MVP)
> **BAZA SPRZĘTU**
> To serce aplikacji. Musi pozwalać na szybkie wprowadzenie tego, co baza w ogóle posiada
> - **Dodawanie/Edycja przedmiotów pojedynczych** : Nazwa, kategoria, ilość
> - **Oznaczanie stanu** : Sprawny, W naprawie, zepsuty **/** (łatwiejsza opcja) zaznaczanie ile jest sprzetu w danych stanie (nie wymaga fizycznego oznaczania sprzetu i przepisywania tego do systemurzy kazdej operacji)
> - **Wyświetlanie stanu magazynowego**
> 
> **MODUŁ OPERACYJNY**
> Zastępuje papierowy "zeszyt kwatermistrza" i realizuje cel informacji w czasie rzeczywistym
> - **Szybkie wydawanie** : Wybór przedmiotu z listy ➔ podanie ilości ➔ wpisanie/wybór komu wydano (np. Podobóz 1, ratownik WOPR, drużyna X)
> - **Szybkie przyjmowanie** : Zaznaczenie powrotu sprzętu na magazyn (takie samo flow jak wydawanie)
> - **Opcja zmiany stanu przy zwrocie** : (w zależności od opcji zarządzania stanem) przy zwrocie zaznacza że jest uszkodzony wpisuje ID przedmiotu i zaznacza stan **/** przy zwrocie zaznacza że np. jeden lateks jest uszkodzony
>
> **Dashboard Czasu Rzeczywistego (Przegląd)**
> Widok, który po otwarciu od razu daje odpowiedź na pytanie "na czym stoimy"
> - **Lista dostępnego sprzętu** : Pokazuje tylko to, co leży fizycznie w magazynie i ma status Sprawny
> - **Lista sprzętu w terenie** : Tabela pokazująca: Co, u kogo i od kiedy
> - **Prosta wyszukiwarka** : Możliwość wpisania słowa "lateks" i szybkiego przefiltrowania wyników
>
> **Prosty podział uprawnień**
> podstawowy podział ról
> - **Kwatermistrz (admin)** : Może dodawać nowy sprzęt, modyfikować bazę, zarządzać użytkownikami
> - **Pracownik kwaterki (User)** : Może tylko przeglądać stan, wydawać sprzęt, przyjmować zwroty i zgłaszać uszkodzenia
### 3 Zaprojektuj architekturę informacji i User Flow
> **1. Architektura Informacji (Mapa aplikacji)**
> - ****Pulpit (Dashboard)** : Ekran startowy. Pokazuje szybkie statystyki ("Na stanie: 150", "W terenie: 45", "Zepsute: 12") oraz dwa główne przyciski akcji: Wydaj i Przyjmij
> - **Magazyn (Baza sprzętu)** : Pełna lista posiadanego asortymentu z paskiem wyszukiwania. Możliwość filtrowania po kategoriach (np. Pływające, Narzędzia) i stanie (Sprawny)
> - **W terenie (Wypożyczenia)** : Tabela pokazująca, jaki sprzęt opuścił magazyn, kto go ma i kiedy go pobrał
> - **Usterki (Serwis)** : Dedykowana zakładka dla sprzętu o statusie W naprawie lub Zniszczony. To pozwala kwatermistrzowi szybko ocenić, co trzeba dokupić lub naprawić przed kolejnym obozem
> **Ustawienia (tylko Kwatermistrz)** : Zarządzanie pracownikami (dodawanie kont dla kwaterki) i bazą przedmiotów (dodawanie nowych typów sprzętu)
### 4 Stwórz makiety (Wireframes)
### +
### 5 Design UI/UX i Prototypowanie
[link](https://wms-pajak.vercel.app)
### 6 Przetestuj z użytkownikami
## DALSZA CZĘŚĆ README