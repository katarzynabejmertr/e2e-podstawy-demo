# Moje review

## Ćwiczenie 08: poprawki do planu

Plan: `tests/cwiczenia/08-zmiana-adresu.spec.ts`, przypadki TC-ADR-01 i TC-ADR-02 (`docs/scenariusze/zmiana-adresu.md` i `.feature`).

### Oczekiwane wyniki i punkty planu

| Nr | Oczekiwany wynik | Punkt planu, który go sprawdza |
|---|---|---|
| 1 | TC-ADR-01 k.1: napis „Zalogowano jako user (user)” | `beforeEach`: asercja tekstu w nagłówku |
| 2 | TC-ADR-01 k.2: nagłówek „Zmiana adresu dostawy” | `beforeEach`: asercja nagłówka po kliknięciu „Adres dostawy” |
| 3 | TC-ADR-01 k.2: pola zawierają adres startowy | `beforeEach`: `toHaveValue` na 4 polach |
| 4 | TC-ADR-01 k.3: pola pokazują wpisane wartości | Test 1: `toHaveValue` po wpisaniu |
| 5 | TC-ADR-01 k.4: komunikat „Zapisano adres dostawy.” | Test 1: asercja komunikatu po „Zapisz adres” |
| 6 | TC-ADR-01 k.5: po odświeżeniu pola mają nowy adres | Test 1: `page.reload()` i `toHaveValue` na 4 polach |
| 7 | TC-ADR-02 k.1: formularz z adresem startowym | `beforeEach` (jak nr 3) |
| 8 | TC-ADR-02 k.3: „Popraw błędy w formularzu (1).” | Testy 2–4: asercja komunikatu na górze |
| 9 | TC-ADR-02 k.3: komunikat pod polem Kod pocztowy | Test 2: asercja tekstu błędu |
| 10 | TC-ADR-02 k.3: brak „Zapisano adres dostawy.” | Testy 2–4: `not.toBeVisible()` |
| 11 | TC-ADR-02 k.4: kod pocztowy nadal `00-001` | Testy 2–4: ponowne otwarcie „Adres dostawy” i `toHaveValue` |
| 12 | Gherkin: telefon `12345` → komunikat pod polem Telefon, adres bez zmian | Test 3 |
| 13 | Gherkin: puste Miasto → „Podaj miasto”, adres bez zmian | Test 4 |

Każdy oczekiwany wynik ma w planie asercję.

### Trzy rzeczy do sprawdzenia

- **Przywracanie adresu startowego:** tak, `afterEach` wpisuje adres startowy, zapisuje go i sprawdza komunikat. Biegnie też po nieudanym teście.
- **Czy błędny adres się nie zapisał:** tak, testy 2–4 otwierają stronę jeszcze raz i sprawdzają wszystkie 4 pola. To ważne, bo po błędzie pole nadal pokazuje złą wartość (`31001`), więc sama asercja na formularzu nic by nie dała.
- **Konto `user`:** tak, logowanie `user` / `user123` w `beforeEach`, z asercją „Zalogowano jako user (user)”.

### Poprawki do planu

1. **Komunikat musi być przypięty do właściwego pola** (lista kontrolna p. 2). Samo `getByText('Kod pocztowy musi mieć format 00-000')` sprawdza tylko, że tekst jest gdzieś na stronie, a przypadek mówi „pod polem Kod pocztowy”. Dopisz `await expect(page.getByLabel('Kod pocztowy')).toHaveAttribute('aria-invalid', 'true')` i to samo dla Telefonu i Miasta. Aplikacja ustawia ten atrybut na polu z błędem.
2. **Dokładne teksty** (p. 5). Komunikaty sprawdzaj przez `toHaveText` z pełnym tekstem: `getByRole('alert')` → „Popraw błędy w formularzu (1).”, `getByRole('status')` → „Zapisano adres dostawy.”. Teksty błędów pod polami wyszukuj z `{ exact: true }`.
3. **Asercja „brak komunikatu sukcesu”** (p. 13). Tekst „Zapisano adres dostawy.” istnieje w aplikacji (widziany w teście 1), więc `not.toBeVisible()` ma sens. Zostawiam ją, ale szukaj po tekście `getByText('Zapisano adres dostawy.')`, a nie po samej roli `status`.
4. **Asercja z kroku 3 TC-ADR-01 jest słaba** (p. 3). `toHaveValue` zaraz po wpisaniu przejdzie zawsze, nawet gdy aplikacja nic nie zapisuje. Zostawiam ją, bo wymaga jej przypadek, ale dowodem zapisu są kroki 4 i 5. Dodaj o tym krótki komentarz w teście.
5. **Testy 2–4: trzy osobne testy zamiast pętli.** Dla osób, które uczą się kodu, trzy krótkie testy z nazwami wprost z tabeli Przykłady czytają się łatwiej niż pętla. Nazwy po polsku, opisują wynik: „kod pocztowy 31001 blokuje zapis adresu” itd.
6. **Widziałam, że test potrafi paść** (p. 12). Po pierwszym zielonym przebiegu zmień na chwilę w teście 1 oczekiwane miasto na „Gdańsk” i uruchom plik. Oczekiwany wynik: `1 failed`. Potem przywróć „Kraków”.
7. **Dwa przebiegi pod rząd** (p. 9). Uruchom plik dwa razy. Za każdym razem ma być `4 passed`, a na końcu pole Miasto ma wartość „Warszawa”.

## Ćwiczenie 08: porównanie formatów (część B)

Porównanie `docs/scenariusze/biuro-mikolaja.md` (kroki z Azure Test Plans) z `docs/scenariusze/biuro-mikolaja.feature` (Gherkin).

| Krok w Azure Test Plans | Linia w Gherkinie | Różnica |
|---|---|---|
| Warunki wstępne: koszyk jest pusty | 9: `Oraz mój koszyk jest pusty` | w Azure to założenie, w Gherkinie krok, który test ma wykonać |
| 1. Zaloguj się jako `@klient` → „Zalogowano jako biuro (user)” | 8: `Zakładając, że jestem zalogowany jako "biuro"…` | Gherkin nie sprawdza napisu w nagłówku |
| 2. Karta produktu, ilość 10, „Dodaj do koszyka” → „Dodano do koszyka: Kalendarz adwentowy 2026” | 12: `Jeżeli dodam do koszyka 10 sztuk…` | Gherkin nie sprawdza komunikatu |
| 3. Otwórz „Koszyk” → jedna pozycja, ilość 10, „Pozycji: 1, razem: 399,90 zł” | brak | w Gherkinie brak całego kroku sprawdzenia koszyka |
| 4. „Faktura na firmę”, NIP, firma, „Złóż zamówienie…” → „Złożono zamówienie: ZAM-…” | 13–17 | brak |
| 5. Numer na liście „Moje zamówienia” → status „Nowe”, „Faktura na firmę: Biuro Mikołaja, NIP 2412241228”, przycisk „Pobierz fakturę” | 18: `…status "Nowe" i NIP "2412241228"` | Gherkin nie sprawdza nazwy firmy ani przycisku i nie mówi, jak dojść do zamówienia |
| 6. Wyloguj, zaloguj jako `admin`, `/admin/zamowienia/<numer>` → status „Nowe”, pole „Status zamówienia” | 19 (połowa) | Gherkin nie mówi o wylogowaniu ani o danych admina (`admin123`) i nie sprawdza panelu admina |
| 7. Status „Opłacone”, „Zapisz status” → „Opłacone” | 19: `…na "Opłacone", a potem…` | Gherkin nie sprawdza statusu pośredniego „Opłacone” |
| 8. Status „Wysłane”, „Zapisz status” → „Wysłane” | 19: `…a potem na "Wysłane"` | Gherkin nie sprawdza statusu w panelu admina |
| 9. Wyloguj, zaloguj jako `@klient`, otwórz zamówienie → „Wysłane” | 20: `Wtedy na stronie zamówienia zobaczę status "Wysłane"` | Gherkin pomija powrót na konto klienta |
| 10. „Pobierz fakturę” → plik `faktura-<numer>.html`, NIP nabywcy, nabywca „Biuro Mikołaja”, pozycja, „Razem do zapłaty: 399,90 zł” | 21–27 | Gherkin nie sprawdza nabywcy „Biuro Mikołaja” w fakturze |
| Po teście: status „Wysłane” zostaje, sprzątanie przez `npm run db:reset` | brak | Gherkin nie mówi, co zostaje w bazie |

**Czego brakuje w Gherkinie:**
- asercji „Zalogowano jako biuro (user)” i „Dodano do koszyka: …”;
- całego kroku 3, czyli sprawdzenia koszyka (ilość 10, „Pozycji: 1, razem: 399,90 zł”);
- nazwy firmy „Biuro Mikołaja” na stronie zamówienia i w fakturze;
- przycisku „Pobierz fakturę” w kroku 5;
- danych logowania admina, wylogowania i sprawdzenia statusów „Nowe” i „Opłacone” w panelu admina;
- informacji, co zostaje w bazie po teście.

**Czego brakuje w krokach Azure Test Plans:**
- celu biznesowego: Gherkin w opisie funkcji (linie 3–4) mówi, po co jest scenariusz;
- pusty koszyk to w Azure tylko warunek wstępny. Z kroków nie wynika, że test ma go sam zapewnić; w Gherkinie to krok `Założenia`;
- pozycji faktury jako tabeli z nazwami kolumn (Nazwa, Ilość, Cena, Wartość). W Azure wartości są w jednym zdaniu, więc łatwiej pomylić cenę z wartością.

**Wniosek:** test piszę z `biuro-mikolaja.md`, bo ma więcej oczekiwanych wyników. Z Gherkina biorę krok „koszyk jest pusty”, który test wykonuje sam, i tabelę pozycji faktury.
