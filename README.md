# Plan lekcji

Czytelny plan lekcji i zastępstwa dla uczniów szkół, które korzystają z **EduPage**.
Strona sama pobiera dane z EduPage szkoły i pokazuje je w prostym widoku:

- bieżącą lekcję (nauczyciel, sala, ile zostało do końca), przerwy i okienka,
- plan dnia i tygodnia, z wyróżnionym dzisiejszym dniem,
- zastępstwa: nowego nauczyciela, zmianę sali, odwołane lekcje,
- powiadomienia o zmianach w planie (telefon i komputer),
- działa na telefonie, także jako ikona na ekranie iPhone'a, i bez internetu (ostatnio pobrane dane).

To projekt nieoficjalny. Nie prowadzi go żadna szkoła ani firma aSc (twórca EduPage).
Oficjalny plan jest zawsze na stronie EduPage szkoły.

---

## Zanim zaczniesz: adres EduPage szkoły

Potrzebujesz tylko adresu EduPage swojej szkoły. Ma postać **`nazwa.edupage.org`**.

1. Otwórz stronę EduPage szkoły w przeglądarce (link zwykle jest na stronie szkoły,
   albo w aplikacji EduPage: profil szkoły).
2. Spójrz na pasek adresu, np. `https://mojaszkola.edupage.org/...`.
   Potrzebna część to **`mojaszkola`** (albo cały adres, strona sama go przytnie).
3. Sprawdź, czy plan jest publiczny: otwórz `https://mojaszkola.edupage.org/timetable/`
   **bez logowania**. Jeśli widzisz plan lekcji, strona będzie działać.

---

## Uruchomienie

| Sposób | Gdzie działa | Co potrzeba |
|---|---|---|
| **A. Cloudflare (zalecane)** | wszędzie, przez internet, również w szkole | darmowe konto Cloudflare, ok. 10 minut |
| **B. Własny komputer / serwer** | w domowej sieci Wi-Fi | Node.js 18 lub nowszy |

### A. Cloudflare Workers (za darmo)

Strona będzie dostępna pod adresem w rodzaju `https://plan-lekcji.twojanazwa.workers.dev`.
Darmowy plan wystarcza z dużym zapasem. Nie trzeba karty płatniczej.

1. Załóż konto na https://dash.cloudflare.com/sign-up.
2. W menu po lewej wybierz **Workers & Pages** (bywa w grupie **Compute**) →
   **Create** → **Create Worker** (szablon „Hello World”).
3. Wpisz nazwę, np. `plan-lekcji`, i kliknij **Deploy**.
4. Kliknij **Edit code**. Po lewej jest plik `worker.js`: zaznacz cały tekst i usuń.
5. Otwórz w tym repozytorium plik **`cloudflare/worker.js`**, kliknij przycisk
   **Copy raw file** (prawy górny róg pliku) i wklej tekst w edytorze Cloudflare.
6. Kliknij **Deploy**.
7. **Ustaw szkołę.** Wróć do swojego Workera → **Settings** → w części
   **Variables and Secrets** kliknij **Add**:
   - Type: **Text**
   - Variable name: **`EDUPAGE`**
   - Value: adres szkoły, np. **`mojaszkola`**

   i kliknij **Deploy**.
8. Otwórz adres Workera (widać go na stronie Workera, kończy się na `workers.dev`).
   Pojawi się pytanie „Do której klasy chodzisz?” z nazwą Twojej szkoły.

Jeśli w kroku 8 zamiast tego widzisz „Ustaw szkołę”, zmienna `EDUPAGE` nie jest ustawiona
albo ma literówkę. Wpisz adres szkoły w polu na tej stronie, a pokaże, co dokładnie wpisać
w Cloudflare, i sprawdzi, czy taka szkoła istnieje.

**Sprawdzenie:** w planie wejdź w **Ustawienia → Sprawdź połączenie**. Powinny być same ✓.

**Na iPhonie:** otwórz adres w **Safari** → **Udostępnij** (kwadrat ze strzałką) →
**Do ekranu początkowego** → **Dodaj**. Plan otwiera się wtedy jak aplikacja.

**Aktualizacja** do nowej wersji: powtórz kroki 4–6 z nowym plikiem `cloudflare/worker.js`.
Zmienna `EDUPAGE` zostaje. Jeśli po aktualizacji strona znów pyta o szkołę,
sprawdź ją w **Settings → Variables and Secrets**.

#### Powiadomienia o zmianach (opcjonalnie)

Strona może wysyłać powiadomienia, gdy w EduPage pojawi się zastępstwo, odwołana lekcja
albo zmiana sali w klasie ucznia. Każdy włącza je sam (karta pod „Teraz” albo Ustawienia).
Na iPhonie działają tylko po dodaniu planu do ekranu początkowego (iOS 16.4 lub nowszy).

Żeby je uruchomić, w panelu Cloudflare zrób jednorazowo:

1. **Baza na subskrypcje:** **Storage & Databases** → **KV** → **Create**.
   Nazwa np. `plan-lekcji-push` → **Add**.
2. **Podłącz bazę do Workera:** Worker → **Settings** → **Bindings** → **Add** →
   **KV namespace**. Variable name: dokładnie **`PUSH`**, wybierz utworzoną bazę → **Deploy**.
3. **Sprawdzanie co minutę:** Worker → **Settings** → **Triggers** → **Add** →
   **Cron Triggers** → wpisz `* * * * *` → **Add**.

Potem w planie: **Ustawienia → Powiadomienia o zmianach → Włącz** i **Wyślij próbne**.

Co 5 minut (6:00–22:00) Worker sprawdza zastępstwa na dziś (do 16:00) i na najbliższy dzień
nauki, a nowe zmiany wysyła jako krótką wiadomość, np.
„Jutro (07.10): zmiana w planie 2B — 3. lekcja: Matematyka, sala 12 → 24”.
Zapisywany jest tylko anonimowy adres powiadomień urządzenia, klasa i wybrana grupa.

#### Gdy korzysta dużo osób

- Worker zapamiętuje odpowiedzi EduPage i oddaje je wszystkim: plan na 30 minut,
  dzisiejsze zastępstwa na 3 minuty. EduPage dostaje kilka zapytań na pół godziny,
  niezależnie od liczby uczniów.
- Gdy EduPage nie odpowiada, strona pokazuje ostatnią dobrą kopię i informuje o tym.
- Darmowy limit Cloudflare to 100 000 zapytań dziennie, co wystarcza na ok. 1500–2000
  osób dziennie. Zużycie widać w Workerze w zakładce **Metrics**.

### B. Własny komputer albo serwer domowy

1. Zainstaluj **Node.js** (wersja LTS) ze strony https://nodejs.org.
2. Pobierz projekt: na GitHubie zielony przycisk **Code** → **Download ZIP**, rozpakuj.
3. Otwórz terminal w rozpakowanym folderze i uruchom:
   ```
   node server.js
   ```
4. Otwórz w przeglądarce **http://localhost:8080**. Strona zapyta o adres EduPage szkoły.
   Wpisz go i kliknij **Zapisz i sprawdź**. Adres zapisuje się w pliku `data/config.json`.
5. Z telefonu w tej samej sieci Wi-Fi: `http://ADRES-IP-KOMPUTERA:8080`
   (adres IP sprawdzisz poleceniem `ipconfig` w Windows albo `ip a` w Linuksie).

Szkołę zmienisz w **Ustawienia → Zmień szkołę** (działa tylko na komputerze, na którym
uruchomiony jest serwer) albo usuwając plik `data/config.json`.

Sprawdzenie połączenia bez przeglądarki:
```
node scripts/check.js mojaszkola.edupage.org
```

Uwaga dla Windows: jeśli `npm` w PowerShellu zgłasza „running scripts is disabled”,
używaj poleceń `node …` jak wyżej (albo `npm.cmd` zamiast `npm`).

**Docker:**
```
EDUPAGE=mojaszkola docker compose up -d --build
```
Bez zmiennej `EDUPAGE` strona przy pierwszym wejściu zapyta o szkołę.
Dane i ustawienia zapisują się w folderze `data/`.

**Usługa systemd** (np. kontener LXC z Debianem):
```ini
[Unit]
Description=Plan lekcji
After=network-online.target

[Service]
WorkingDirectory=/opt/plan-lekcji
ExecStart=/usr/bin/node server.js
Restart=always
Environment=PORT=8080 TZ=Europe/Warsaw EDUPAGE=mojaszkola

[Install]
WantedBy=multi-user.target
```
Zapisz jako `/etc/systemd/system/plan-lekcji.service` i uruchom `systemctl enable --now plan-lekcji`.

| Zmienna | Domyślnie | Znaczenie |
|---|---|---|
| `EDUPAGE` | brak (pyta na stronie) | adres EduPage szkoły |
| `PORT` | `8080` | port strony |
| `DATA_DIR` | `./data` | ustawienia i kopia danych |
| `TIMETABLE_TTL_MIN` | `30` | co ile minut odświeżać plan |
| `SUBST_TTL_MIN` | `5` | co ile minut odświeżać zastępstwa |

Powiadomienia działają tylko w wersji A (Cloudflare).

---

## Gdy coś nie działa

| Objaw | Co zrobić |
|---|---|
| Strona pokazuje „Ustaw szkołę” | Nie ustawiono adresu szkoły. W wersji A dodaj zmienną `EDUPAGE` (krok 7), w wersji B wpisz adres na stronie. |
| „Pod tym adresem nie ma strony EduPage” | Literówka w adresie. Porównaj z paskiem adresu na stronie EduPage szkoły. |
| Brak klas albo błąd planu | Szkoła nie udostępnia planu publicznie. Sprawdź `https://nazwa.edupage.org/timetable/` bez logowania. |
| Nigdy nie ma zastępstw | Szkoła nie publikuje zastępstw w module Zastępstwa EduPage (niektóre wrzucają je jako artykuł albo PDF). Takich strona nie odczyta. |
| Nie ma mojej klasy | Szkoła mogła zmienić plan. Wybierz klasę ponownie (przycisk z nazwą klasy u góry). |
| Powiadomienia nie przychodzą | iPhone: plan musi być dodany do ekranu początkowego, iOS 16.4+. Sprawdź bazę `PUSH` i Cron Trigger w Cloudflare, potem **Wyślij próbne**. |

---

## Co robi strona

- Pierwsze wejście: „Do której klasy chodzisz?”. Wybór zostaje zapamiętany na urządzeniu.
- Ramka **Teraz**: bieżąca lekcja z paskiem czasu, przerwa, okienko,
  „Lekcje zaczynają się o…”, „Na dzisiaj koniec lekcji”.
- Plan dnia z przerwami; bieżąca lekcja na zielono. Zastępstwa: stary nauczyciel lub sala
  przekreślone → nowe. Odwołana lekcja zostaje, przekreślona, z napisem **ODWOŁANA**.
- Przycisk **?** przy lekcji: szczegóły i oryginalny wpis z EduPage.
- Widok **Tydzień**: dzisiejsza kolumna normalnie, pozostałe przygaszone.
- Grupy (np. 1/2, religia/etyka): wybierz swoją, żeby widzieć tylko swoje lekcje.

Inna godzina do testów: dopisz do adresu strony `?teraz=2026-10-06T10:30`.

## Skąd są dane

| Co | Adres w EduPage |
|---|---|
| Nazwa szkoły, sesja | `/timetable/` |
| Plan lekcji (wszystkie klasy) | `/timetable/server/regulartt.js` |
| Zastępstwa na dany dzień | `/substitution/server/viewer.js` (zapasowo strona `/substitution/?date=…`) |
| Pełne nazwy przedmiotów w zastępstwach | `/rpr/server/maindbi.js` |

To te same dane, z których korzysta strona EduPage, więc zmiany jej wyglądu nic nie psują.
Jeśli kiedyś główna droga przestanie działać, wersja B może użyć przeglądarki w tle
(`npm install playwright && npx playwright install chromium`).

---

## Repozytorium na GitHubie (dla właściciela)

Do wrzucania zmian służy program **GitHub Desktop** (https://desktop.github.com).
Sam pomija pliki prywatne wypisane w `.gitignore`:

| Nie trafia do repozytorium | Co to jest |
|---|---|
| `NOTES.md` | prywatne notatki robocze |
| `data/` | ustawienia (adres szkoły) i kopia danych z EduPage |
| `dist/` | podgląd strony zbudowany do testów |
| `node_modules/` | pobrane biblioteki |

### Pierwsze wrzucenie
1. Zainstaluj GitHub Desktop i zaloguj się na swoje konto GitHub.
2. Rozpakuj projekt do nowego, pustego folderu, np. `Dokumenty\GitHub\plan-lekcji`.
3. **File → Add local repository** → wybierz ten folder → kliknij link **create a repository**.
   Nazwy nie zmieniaj (musi być taka jak folder), **Git ignore** i **License** zostaw na **None**,
   nie zaznaczaj „Initialize this repository with a README” → **Create repository**.
4. Zakładka **History** → kliknij **Initial commit** i przejrzyj listę plików.
   Nie może tam być `NOTES.md` ani folderów `data` i `dist`.
5. **Publish repository** → odznacz „Keep this code private” → **Publish repository**.

### Kolejne zmiany
1. Podmień pliki w folderze repozytorium.
2. W GitHub Desktop sprawdź listę zmienionych plików (zakładka **Changes**). Jeśli widzisz
   coś, czego nie chcesz publikować, kliknij to prawym przyciskiem → **Ignore file**.
3. Wpisz krótki opis zmiany → **Commit to main** → **Push origin**.

Jeśli prywatny plik trafi jednak na GitHuba, usunięcie go w kolejnej zmianie nie wystarczy,
bo zostaje w historii. Trzeba wtedy wyczyścić historię repozytorium albo usunąć repozytorium
i wrzucić projekt od nowa.

## Dla programisty

```
npm test                          # wszystkie testy, bez internetu
node scripts/build-worker.js      # po zmianach w public/ lub lib/: buduje public/plan-lib.js i cloudflare/worker.js
node scripts/seed-from-fixtures.js && node server.js --offline   # strona z przykładowymi danymi
```

```
server.js                 wersja B: strona, API i ekran ustawiania szkoły
cloudflare/worker-src.js  wersja A: pośrednik do EduPage (worker.js jest z niego budowany)
cloudflare/push-src.js    powiadomienia (Web Push)
lib/api.js                logika API, wspólna dla obu wersji
lib/edupage.js            rozmowa z EduPage, adres i nazwa szkoły
lib/proxyClient.js        to samo przez Workera
lib/timetable.js          dane planu z EduPage → nasz format
lib/substitutions.js      raport zastępstw → zmiany dla każdej klasy
lib/svgTimetable.js       zapasowo: odczyt narysowanego planu (SVG)
public/                   strona (plan-lib.js jest budowany z lib/)
test/                     testy i atrapa serwera EduPage
```

Dane w `test/fixtures` mają format odpowiedzi EduPage, ale opisują wymyśloną szkołę
(„Szkoła Przykładowa nr 1”): nazwy klas, imiona i nazwiska nauczycieli są zmyślone.

## Autor i licencja

Autor: **Kacper Studio** ([@xmoviesmovies103-hash](https://github.com/xmoviesmovies103-hash)).

MIT, zobacz plik `LICENSE`.
