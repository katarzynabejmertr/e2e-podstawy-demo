# Zasady pisania testów w tym repo

Repo szkoleniowe: aplikacja Namssor (`app/`, port 4100) i testy Playwright w TypeScript (`tests/`).
Testy czytają i oceniają testerzy, którzy dopiero uczą się kodu. Pisz prosto i czytelnie.

## Kod testu
- Importuj wyłącznie `import { test, expect } from '@playwright/test';`.
- Bez Page Object, własnych fixtures i funkcji pomocniczych, chyba że użytkownik o nie poprosi.
- Wyjątek: do logowania w UI używaj `zaloguj(page)`, a w testach API `zalogujPrzezApi(request)` z `tests/pomocnicze/logowanie.ts`. Nie wpisuj loginu ani hasła w teście. Inne konto: `await zaloguj(page, 'admin', 'admin123');`.
- Lokatory w tej kolejności: `getByRole`, `getByLabel`, `getByText`, dopiero potem `getByTestId`.
  Nie używaj selektorów CSS i XPath, `id` ani klas.
- Wiersz tabeli znajdź po treści: `page.getByRole('row').filter({ hasText: 'ZAM-1003' })`.
- Asercje web-first, które same czekają: `await expect(lokator).toBeVisible()`, `toHaveText`, `toHaveURL`.
- Nigdy `page.waitForTimeout()` ani stałych pauz. Nie sprawdzaj stanu przez `isVisible()` w `if`.
- Jeden test sprawdza jedno zachowanie. Nazwa testu po polsku opisuje oczekiwany wynik.
- Komentarze po polsku, krótkie: co robi krok i dlaczego, gdy to nieoczywiste.
- Testy API przez fixture `request`; sprawdzaj status i treść odpowiedzi.

## Review i dane testowe
- Test, który zmienia dane, sprząta po sobie w `afterEach` albo tworzy własne dane, więc przechodzi przy drugim uruchomieniu i nie zależy od innych testów.
- Sprawdzaj efekt biznesowy (status zamówienia, zapisane dane, treść komunikatu), a nie kolor, klasę CSS ani układ strony.
- Oczekiwane wartości bierz z wymagania, nie przepisuj ich ze strony, i porównuj tekst dokładnie przez `toHaveText`, nie `toContainText`.
- Napisz asercję dla każdego zdania wymagania i wpisz w nazwie albo komentarzu testu, które wymaganie lub przypadek testowy sprawdza.
- Nie ukrywaj niejednoznacznego lokatora za `.first()`, `.nth()` ani `.last()`, tylko zawęź go, np. do wiersza tabeli.
- Wymaganie klienta testuj na koncie `user`, a wymaganie administratora na koncie `admin`.
- Uruchom test dwa razy i pokaż, że pada po zmianie oczekiwanej wartości, a zamiast pisać „jestem pewien”, pokaż wynik uruchomienia.

## Uruchamianie
- `npx playwright test` (wszystkie), `npx playwright test <plik>` (jeden plik), `npm run test:smoke`.
- Playwright sam uruchamia aplikację (`webServer` w `playwright.config.ts`).
- Po zmianach: `npm run typecheck`. Polecenia mają działać w PowerShell 5.1 (bez `&&`).
- Stan bazy psuje się po testach zmieniających dane: `npm run db:reset` przy zatrzymanej aplikacji.

## Dane
- Konta demo: `user` / `user123` (klient), `admin` / `admin123` (administrator).
- Opis API: `app/openapi.json`, w przeglądarce http://localhost:4100/api/docs.
- Nie zmieniaj kodu aplikacji w `app/`, chyba że użytkownik wyraźnie o to prosi.
