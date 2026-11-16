import { test, expect } from '@playwright/test';

// Ćwiczenie 04, scenariusz B: dodanie produktu do koszyka i usunięcie go.
// Karta: docs/cwiczenia/04-locatory-codegen.md

test('usunięty produkt znika z koszyka', async ({ page }) => {
  // Logowanie jako klient
  await page.goto('/');
  await page.getByRole('link', { name: 'Zaloguj' }).click();
  await page.getByRole('textbox', { name: 'Login' }).fill('user');
  await page.getByRole('textbox', { name: 'Hasło' }).fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  // Dodanie produktu i przejście do koszyka
  await page.getByRole('button', { name: 'Dodaj do koszyka: Żel pod prysznic' }).click();
  await page.getByRole('link', { name: 'Koszyk' }).click();

  // Wiersz z produktem szukamy po treści
  const wierszZelu = page.getByRole('row').filter({ hasText: 'Żel pod prysznic' });
  await expect(wierszZelu).toBeVisible();

  // Usunięcie produktu z koszyka
  await wierszZelu.getByRole('button', { name: 'Usuń: Żel pod prysznic' }).click();

  // Wiersza z produktem już nie ma
  await expect(wierszZelu).toHaveCount(0);
});
