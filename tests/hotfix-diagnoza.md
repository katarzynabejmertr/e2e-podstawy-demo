# Hotfix Mirka (14:00): diagnoza czerwonych testów

Ćwiczenie 12c · lokalnie, konto `user` (i `admin`, `biuro` tam, gdzie test ich używa)

| Uruchomienie | Wynik |
|---|---|
| Krok 1: wersja zwykła, `main` | 122 passed, 4 skipped, 0 failed |
| Krok 2: `APP_VERSION=hotfix`, `main` | 19 failed, 4 skipped, 93 passed |
| Krok 4: `APP_VERSION=hotfix`, gałąź `hotfix-testy` | 3 failed, 4 skipped, 119 passed |

## Tabela diagnozy (krok 3)

| Test (plik i linia) | Pierwsza linia błędu | Przyczyna | Decyzja |
|---|---|---|---|
| `tests/cwiczenia/04-adres-walidacja.spec.ts:6` | `locator.click: Test timeout`, czeka na przycisk „Zapisz adres” | przycisk ma teraz napis „Zapisz”: zmieniony tekst | test do poprawy |
| `tests/cwiczenia/08-zmiana-adresu.spec.ts:37` | `locator.click: Test ended`, czeka na „Zapisz adres” | jak wyżej | test do poprawy |
| `tests/review/03-adres-walidacja.spec.ts:7` | `locator.click: Test timeout`, czeka na „Zapisz adres” | jak wyżej | test do poprawy |
| `tests/review/05-zmiana-adresu.spec.ts:6` | `locator.click: Test timeout`, czeka na „Zapisz adres” | jak wyżej | test do poprawy |
| `tests/cwiczenia/04-karta-produktu.spec.ts:7` | `toBeVisible() failed`, brak „Dodano do koszyka: Krem do twarzy na dzień” | komunikat to teraz „Produkt w koszyku: …”: zmieniony tekst | test do poprawy |
| `tests/cwiczenia/06-platnosc-w-ramce.spec.ts:27` | `toBeVisible() failed`, brak „Dodano do koszyka: Maseczka glinkowa” | jak wyżej | test do poprawy |
| `tests/cwiczenia/04-karta-produktu.spec.ts:44` | `locator.click: Test timeout`, czeka na przycisk „Zastosuj kod” | przycisk ma teraz napis „Użyj kodu”: zmieniony tekst | test do poprawy |
| `tests/projekt/p11-kod-rabatowy.spec.ts:27` | `locator.click: Test timeout`, czeka na „Zastosuj kod” | jak wyżej | test do poprawy |
| `tests/polowanie/sc-p11.spec.ts:27` | `locator.click: Test timeout`, czeka na „Zastosuj kod” | jak wyżej | test do poprawy |
| `tests/review/06-kod-rabatowy.spec.ts:6` | `locator.click: Test timeout`, czeka na „Zastosuj kod” | jak wyżej | test do poprawy |
| `tests/projekt/p10-faktura-na-firme.spec.ts:38` | `page.waitForEvent: Test timeout`, czeka na link „Pobierz fakturę” | link ma teraz napis „Faktura (HTML)”, plik pobiera się tak samo: zmieniony tekst | test do poprawy |
| `tests/polowanie/sc-p10.spec.ts:29` | jak wyżej | jak wyżej | test do poprawy |
| `tests/czytanie/05-karta-produktu.spec.ts:13` | `toContainText` oczekuje „Dostępny”, jest „Na stanie: 100 szt.” | nowy tekst dostępności: zmieniony tekst | test do poprawy |
| `tests/smoke.spec.ts:36` | jak wyżej | jak wyżej | test do poprawy |
| `tests/czytanie/05-karta-produktu.spec.ts:26` | `toHaveText` oczekuje „Niedostępny”, jest „Chwilowo brak” | zmieniony tekst; przycisk „Dodaj do koszyka” nadal wyłączony | test do poprawy |
| `tests/projekt/p15-status-w-panelu.spec.ts:9` | najpierw brak opcji „Opłacone”, potem brak „Status: Opłacone” | opcja i status nazywają się teraz „Zapłacone”; klient dalej widzi `shipped`: zmieniony tekst | test do poprawy |
| `tests/cwiczenia/08-biuro-mikolaja.spec.ts:12` | najpierw brak „Dodano do koszyka: Kalendarz adwentowy 2026”; po poprawce tekstu: brak „Pozycji: 1, razem: 399,90 zł” | po poprawce tekstów: suma koszyka 39,99 zł zamiast 399,90 zł: **aplikacja liczy źle** | błąd do zgłoszenia Mirkowi |
| `tests/projekt/p16-ilosc-z-karty.spec.ts:15` | `toHaveText` oczekuje „959,76 zł”, jest „39,99 zł” w `cart-total` | wiersz pokazuje 24 szt. i 959,76 zł, a „razem” to cena jednej sztuki: **aplikacja liczy źle** | błąd do zgłoszenia Mirkowi |
| `tests/polowanie/sc-p16.spec.ts:13` | `toHaveText` oczekuje „29,97 zł”, jest „9,99 zł” | jak wyżej (3 × Żel pod prysznic) | błąd do zgłoszenia Mirkowi |

Uwaga do „Zapłacone”: podpowiedź pod listą statusów w panelu dalej mówi „Kolejność: Nowe → Opłacone → Wysłane.”. Klient może dalej zrobić zakupy, więc to nie jest błąd blokujący. Warto jednak, żeby Bożena zdecydowała, która nazwa obowiązuje, i żeby poprawić `docs/projekt.md` (P15).

## Zgłoszenie dla Mirka (krok 5)

```
Tytuł: Suma „razem” w koszyku pokazuje cenę jednej sztuki zamiast sumy wartości pozycji
Wersja: hotfix
Kroki:
  1. Zaloguj się jako user / user123.
  2. Otwórz kartę produktu „Kalendarz adwentowy 2026”.
  3. W polu „Ilość” wpisz 24 i kliknij „Dodaj do koszyka”.
  4. Otwórz Koszyk.
Oczekiwany wynik: wiersz „Kalendarz adwentowy 2026”: ilość 24, wartość 959,76 zł;
  „Pozycji: 1, razem: 959,76 zł” (suma kolumny „Wartość”).
Faktyczny wynik: wiersz poprawny (24, 959,76 zł), ale „Pozycji: 1, razem: 39,99 zł”,
  czyli cena jednej sztuki. To samo dla 3 × Żel pod prysznic (9,99 zł zamiast 29,97 zł)
  i 10 kalendarzy (39,99 zł zamiast 399,90 zł). Klient widzi złą kwotę do zapłaty.
Test: tests/projekt/p16-ilosc-z-karty.spec.ts › P16: 24 Kalendarze adwentowe 2026 z karty produktu
  dają w koszyku wartość 959,76 zł i taką samą sumę
  (failed na hotfix: Expected "959,76 zł", Received "39,99 zł"; passed bez APP_VERSION)
```

To nie są „same kosmetyczne poprawki tekstów”. Hotfix zmienia sposób liczenia sumy w koszyku.
