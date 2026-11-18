import { test, expect } from '@playwright/test';

// Polowanie (ćwiczenie 13): na stronie Produkty sortowanie „Cena: od najniższej” układa produkty
// od najtańszego do najdroższego. Wynik z wersji obecnej: 4,99 zł na początku, 39,99 zł na końcu.
// Ten sam błąd co w API (/api/catalog?sort=cena), tu widoczny dla klienta na stronie.
// Strona jest publiczna: test się nie loguje i nie zmienia danych.
test('na stronie Produkty „Cena: od najniższej” układa kafelki od najtańszego produktu', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Sortuj' }).selectOption({ label: 'Cena: od najniższej' });
  await page.getByRole('button', { name: 'Filtruj' }).click();
  await expect(page).toHaveURL(/sort=cena/);

  // Ceny z kafelków w kolejności na stronie, np. „4,99 zł” -> 4.99.
  const tekstyCen = await page.getByTestId('tile-price').allInnerTexts();
  const ceny = tekstyCen.map((tekst) => Number(tekst.replace(' zł', '').replace(',', '.')));

  // Ta sama lista ułożona liczbowo rosnąco (4,99 przed 10,99, a nie jak tekst).
  const cenyRosnaco = [...ceny].sort((a, b) => a - b);
  expect(ceny).toEqual(cenyRosnaco);
});
