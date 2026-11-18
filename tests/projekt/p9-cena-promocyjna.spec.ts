import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Scenariusz P9 z docs/projekt.md: ta sama cena promocyjna w trzech miejscach.
// Koszyk należy do konta, więc pakiet uruchamiamy z --workers=1.

test.afterEach(async ({ page }) => {
  // P9: „Test na koniec usuwa krem z koszyka” (opróżniamy koszyk konta).
  const odpowiedz = await page.request.delete('/api/cart');
  expect(odpowiedz.status(), 'opróżnienie koszyka przy sprzątaniu').toBe(200);
});

test('P9: Krem do twarzy ma cenę 26,39 zł (zamiast 32,99 zł, -20%) na kafelku, na karcie produktu i w koszyku', async ({ page }) => {
  await zaloguj(page);
  // Pusty koszyk na start (page.request ma tę samą sesję co przeglądarka).
  const czyszczenie = await page.request.delete('/api/cart');
  expect(czyszczenie.status(), 'opróżnienie koszyka przed testem').toBe(200);

  await page.goto('/');
  const kafelek = page.getByRole('article', { name: 'Krem do twarzy na dzień' });
  // P9: „na kafelku: stara cena 32,99 zł przekreślona”
  await expect(kafelek.getByTestId('tile-old-price')).toHaveText('32,99 zł');
  // P9: „nowa cena 26,39 zł”
  await expect(kafelek.getByTestId('tile-price')).toHaveText('26,39 zł');
  // P9: „plakietka -20%”
  await expect(kafelek.getByTestId('tile-badge')).toHaveText('-20%');

  await kafelek.getByRole('link', { name: 'Krem do twarzy na dzień' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Krem do twarzy na dzień');
  // P9: „na karcie produktu: stara cena 32,99 zł przekreślona”
  await expect(page.getByTestId('product-old-price')).toHaveText('32,99 zł');
  // P9: „nowa cena 26,39 zł”
  await expect(page.getByTestId('product-price')).toHaveText('26,39 zł');
  // P9: „plakietka -20%”
  await expect(page.getByTestId('product-badge')).toHaveText('-20%');

  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  // Czekamy, aż aplikacja potwierdzi dodanie, zanim przejdziemy do koszyka.
  await expect(page).toHaveURL(/dodano=/);
  await page.goto('/koszyk');

  // P9: „w koszyku w wierszu Krem do twarzy na dzień cena 26,39 zł”
  // (1 sztuka, więc wartość wiersza to cena za sztukę).
  const wiersz = page.getByRole('row').filter({ hasText: 'Krem do twarzy na dzień' });
  await expect(wiersz.getByRole('cell', { name: '26,39 zł', exact: true })).toBeVisible();
});
