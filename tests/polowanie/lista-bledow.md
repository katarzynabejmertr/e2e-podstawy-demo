# Co znaleźliśmy w wersji `rc`

Para `tester06` · polowanie 18.11.2026 · na spotkanie „wydajemy czy nie”

**Rekomendacja: nie wydajemy.** Klient może zobaczyć cudze zamówienie, a w koszyku i na fakturze są złe kwoty i dane.

Każdy błąd ma test w `tests/polowanie/`. Potwierdzony oznacza: test pada na `rc` i przechodzi na wersji zwykłej.

| # | Co jest źle | Waga | Test | Wynik na `rc` |
|---|---|---|---|---|
| 1 | Klient widzi cudze zamówienie, jeśli wpisze numer małymi literami (`GET /api/orders/zam-1005`). | krytyczna: wyciek danych | `numer-zamowienia-malymi-literami.spec.ts` | 200 zamiast 404 · potwierdzony |
| 2 | Promocja w koszyku jest naliczona dwa razy: Krem do twarzy kosztuje 21,11 zł zamiast 26,39 zł. | wysoka: sklep traci pieniądze | `cena-promocyjna-w-koszyku.spec.ts` | 1 failed · potwierdzony |
| 3 | Na fakturze firmowej jest zły NIP nabywcy: `1234563218` zamiast `1012023036` (Biuro Mikołaja). | wysoka: błędna faktura | `faktura-nip-nabywcy.spec.ts` | 1 failed · potwierdzony |
| 4 | Sortowanie „Cena: od najniższej” układa ceny jak tekst (39,99 zł przed 4,99 zł), zarówno w API, jak i na stronie Produkty. | średnia | `sortowanie-po-cenie.spec.ts`, `sortowanie-po-cenie-strona.spec.ts` | 1 failed (API) · potwierdzony |
| 5 | Adres w profilu przyjmuje kod pocztowy bez myślnika (`00950`). | średnia: złe dane do wysyłki | `adres-zly-kod-pocztowy.spec.ts` | 201 zamiast 400 · potwierdzony |
| 6 | Nowo dodany adres od razu staje się domyślny, bez kliknięcia „Ustaw jako domyślny”. | średnia: paczka może pojechać pod zły adres | `nowy-adres-nie-jest-domyslny.spec.ts` | `default: true` zamiast `false` · potwierdzony |
| 7 | Po usunięciu ostatniego produktu koszyk nie pokazuje „Pozycji: 0, razem: 0,00 zł”. | niska | `licznik-po-usunieciu-ostatniego.spec.ts` | brak zapisanego wyniku z `rc` |

## Uwagi

- Błąd 4 to jeden błąd złapany dwiema drogami, przez API i przez przeglądarkę. Dla Mirka: zacząć od `/api/catalog?sort=cena`.
- Dla błędów 4 (strona) i 7 nie mamy zapisanego wyniku z obu adresów, a serwery już nie działają. Zostają na liście jako podejrzenia.
- Wszystkie testy sprzątają po sobie: koszyk i adresy przez `afterEach`. Zamówienia firmowe z testu 3 zostały na serwerze, co zasady polowania dopuszczały.
