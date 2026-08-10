# Aplikacja WMS dla HOSW Pająk
## PROJEKT APLIKACJI
### 1 Zdefiniuj cel i grupę docelową
> **CELE** : 
> - możliwość łatwego zarządzania stanem magazynowym aby móc na bierząco aktualizować stan magazynowy i zniwelować częste inwentaryzacje mając świadomość aktualnego stanu
> - posiadanie informacji o stanie magazynowym w czasie rzeczywistym aby wiedzieć na bierząco ile go jest 
> - posiadanie informacje o stanie sprzetu na magazynie aby wiedzieć czy trzeba dokupić rzeczy , mieć kontrole nad tym kto go mógł zepsuć oraz posiadać statystyki jak szybko sprzęt się psuję (wymaga fizyczengo oznaczania przedmiotów co kąplikuje i wydłuża wydawanie sprzętu)
> - Możliwość szybkiego przypisania wydanego sprzętu do konkretnej osoby/drużyny, aby zminimalizować gubienie wyposażenia
> - Umożliwienie obsługi magazynu z poziomu smartfona, co przyspieszy wydawanie sprzętu zachowując aktualny stan magazynowy
> - Automatyzacja procesu inwentaryzacji i generowania raportów po sezonie/obozie
>
> **GRUPA DOCELOWA** : 
> - kadra bazy pająk
> - kwaterka i pracownicy
> - kwatermistrz
>
> **ROLE W SYSTEMIE** : 
> - administrator - np. kwatermistrz bazy (może wszystko, ma dostęp do admin panelu)
> - pracownik - np. kwaterka (może widzieć i edytować stan magazynowy)
> - przeglądający - ktoś xD (może tylko przeglądać)
### 2 Określ zakres funkcji (MVP)
> **BAZA SPRZĘTU**
> To serce aplikacji. Musi pozwalać na szybkie wprowadzenie tego, co baza w ogóle posiada
> - **Dodawanie/Edycja przedmiotów pojedyńczych** : Nazwa, kategoria, ilość
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
> - **Kwatermistrz (admin)** : Może dodawać nowy sprzęt, modyfikować bazę, zarządzać urzytkownikami
> - **Pracownik kwaterki (User)** : Może tylko przeglądać stan, wydawać sprzęt, przyjmować zwroty i zgłaszać uszkodzenia
### 3 Zaprojektuj architekturę informacji i User Flow
>
>
### 4 Stwórz makiety (Wireframes)
>
>
### 5 Design UI/UX i Prototypowanie
>
>
### 6 Przetestuj z użytkownikami