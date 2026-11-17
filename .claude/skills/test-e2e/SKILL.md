---
name: test-e2e
description: Pisze test E2E Playwright według zasad z CLAUDE.md. Użyj, gdy użytkownik prosi o nowy test, automatyzację przypadku testowego albo scenariusza.
---

# Test E2E krok po kroku

Wykonaj kroki po kolei i nie pomijaj żadnego. Zasady pisania kodu są w `CLAUDE.md`.

1. Przeczytaj przypadek testowy albo scenariusz od użytkownika i wypisz zdania wymagania, które test ma sprawdzić.
2. Przejdź scenariusz w działającej aplikacji (http://localhost:4100) i zanotuj prawdziwe nazwy przycisków, pól i komunikatów.
3. Pokaż plan: nazwę pliku w `tests/cwiczenia/`, konto, kroki, asercje i to, skąd bierzesz każdą oczekiwaną wartość, a potem poczekaj na akceptację.
4. Napisz test zgodnie z zaakceptowanym planem i uruchom `npm run typecheck`.
5. Uruchom test dwa razy pod rząd poleceniem `npx playwright test <plik>` i pokaż oba wyniki.
6. Zmień na chwilę oczekiwaną wartość, uruchom test, pokaż `1 failed`, przywróć wartość i pokaż `1 passed`.
7. Przejdź `docs/lista-kontrolna-review.md` pytanie po pytaniu i przy każdym napisz „tak” albo „nie” z numerem linii.
8. Na końcu podaj polecenie, którym użytkownik sam uruchomi test.
