import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Scenariusz P16 z docs/projekt.md: ilość z karty produktu.
// Koszyk należy do konta, więc pakiet uruchamiamy z --workers=1.

test.afterEach(async ({ page }) => {
  // Pusty koszyk po teście.
  const odpowiedz = await page.request.delete('/api/cart');
  expect(odpowiedz.status(), 'opróżnienie koszyka przy sprzątaniu').toBe(200);
});

test('P16: 3 sztuki Żelu pod prysznic z karty produktu dają w koszyku wartość 29,97 zł i taką samą sumę', async ({ page }) => {
  await zaloguj(page);
  // Pusty koszyk na start: wtedy w koszyku jest tylko Żel (page.request ma sesję przeglądarki).
  const czyszczenie = await page.request.delete('/api/cart');
  expect(czyszczenie.status(), 'opróżnienie koszyka przed testem').toBe(200);

  await page.goto('/');
  await page.getByRole('article', { name: 'Żel pod prysznic' }).getByRole('link', { name: 'Żel pod prysznic' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Żel pod prysznic');

  await page.getByRole('spinbutton', { name: 'Ilość' }).fill('3');
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  // Czekamy, aż aplikacja potwierdzi dodanie, zanim przejdziemy do koszyka.
  await expect(page).toHaveURL(/dodano=/);
  await page.goto('/koszyk');

  const wiersz = page.getByRole('row').filter({ hasText: 'Żel pod prysznic' });
  // P16: „w koszyku wiersz Żel pod prysznic: ilość 3”
  await expect(wiersz.getByRole('cell', { name: '3', exact: true })).toBeVisible();
  // P16: „wartość 29,97 zł”
  await expect(wiersz.getByRole('cell', { name: '29,97 zł', exact: true })).toBeVisible();
  // P16: „suma razem jest równa sumie kolumny Wartość”.
  // W koszyku jest tylko ten wiersz, więc suma kolumny Wartość to 29,97 zł.
  await expect(page.getByTestId('cart-total')).toHaveText('29,97 zł');
});
