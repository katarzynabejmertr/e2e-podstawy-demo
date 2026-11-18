import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Polowanie (ćwiczenie 13): po usunięciu ostatniego produktu koszyk pokazuje „Pozycji: 0”.
// Wynik z wersji obecnej: „Pozycji: 0, razem: 0,00 zł” i „Koszyk jest pusty.”
// Sprzątanie: afterEach opróżnia koszyk konta testowego.
test.afterEach(async ({ page }) => {
  const odpowiedz = await page.request.delete('/api/cart');
  expect(odpowiedz.status(), 'opróżnienie koszyka przy sprzątaniu').toBe(200);
});

test('po usunięciu jedynego produktu koszyk pokazuje „Pozycji: 0, razem: 0,00 zł”', async ({ page }) => {
  await zaloguj(page);
  // Koszyk z jednym Mydłem w kostce (page.request ma sesję przeglądarki).
  const czyszczenie = await page.request.delete('/api/cart');
  expect(czyszczenie.status(), 'opróżnienie koszyka przed testem').toBe(200);
  const mydlo = await page.request.post('/api/cart/items', { data: { product_id: 11, qty: 1 } });
  expect(mydlo.status(), 'Mydło w kostce w koszyku').toBe(201);

  await page.goto('/koszyk');
  await page.getByRole('button', { name: 'Usuń: Mydło w kostce' }).click();

  // Koszyk jest pusty...
  await expect(page.getByText('Koszyk jest pusty.')).toBeVisible();
  // ...więc licznik pozycji pokazuje 0, a suma 0,00 zł.
  await expect(page.getByText('Pozycji: 0, razem: 0,00 zł', { exact: true })).toBeVisible();
});
