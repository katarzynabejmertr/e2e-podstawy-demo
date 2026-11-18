import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Scenariusz P16 z docs/projekt.md: ilość z karty produktu.
// Zmiana wymagań Bożeny z 13:00 (ćwiczenie 12b): zamiast 3 Żeli pod prysznic
// Biuro Mikołaja kupuje 24 Kalendarze adwentowe 2026 (po jednym na każde okienko).
// Koszyk należy do konta, więc pakiet uruchamiamy z --workers=1.

test.afterEach(async ({ page }) => {
  // Pusty koszyk po teście (usuwa też Kalendarze).
  const odpowiedz = await page.request.delete('/api/cart');
  expect(odpowiedz.status(), 'opróżnienie koszyka przy sprzątaniu').toBe(200);
});

test('P16: 24 Kalendarze adwentowe 2026 z karty produktu dają w koszyku wartość 959,76 zł i taką samą sumę', async ({ page }) => {
  await zaloguj(page);
  // Pusty koszyk na start: wtedy w koszyku jest tylko Kalendarz (page.request ma sesję przeglądarki).
  const czyszczenie = await page.request.delete('/api/cart');
  expect(czyszczenie.status(), 'opróżnienie koszyka przed testem').toBe(200);

  await page.goto('/');
  await page
    .getByRole('article', { name: 'Kalendarz adwentowy 2026' })
    .getByRole('link', { name: 'Kalendarz adwentowy 2026' })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kalendarz adwentowy 2026');

  await page.getByRole('spinbutton', { name: 'Ilość' }).fill('24');
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  // Czekamy, aż aplikacja potwierdzi dodanie, zanim przejdziemy do koszyka.
  await expect(page).toHaveURL(/dodano=/);
  await page.goto('/koszyk');

  const wiersz = page.getByRole('row').filter({ hasText: 'Kalendarz adwentowy 2026' });
  // P16 (zmiana z 13:00): „ilość 24”
  await expect(wiersz.getByRole('cell', { name: '24', exact: true })).toBeVisible();
  // P16 (zmiana z 13:00): „wartość 959,76 zł”
  await expect(wiersz.getByRole('cell', { name: '959,76 zł', exact: true })).toBeVisible();
  // P16: „suma razem jest równa sumie kolumny Wartość”.
  // W koszyku jest tylko ten wiersz, więc suma kolumny Wartość to 959,76 zł.
  await expect(page.getByTestId('cart-total')).toHaveText('959,76 zł');
});
