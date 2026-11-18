import { test, expect } from '@playwright/test';

// Ćwiczenie 04, scenariusz C: adres dostawy z błędnym kodem pocztowym.
// Karta: docs/cwiczenia/04-locatory-codegen.md

test('błędny kod pocztowy blokuje zapis adresu', async ({ page }) => {
  // Logowanie jako klient
  await page.goto('/logowanie');
  await page.getByRole('textbox', { name: 'Login' }).fill('user');
  await page.getByRole('textbox', { name: 'Hasło' }).fill('user123');
  await page.getByRole('textbox', { name: 'Hasło' }).press('Enter');

  // Formularz „Adres dostawy” z kodem bez myślnika
  await page.getByRole('link', { name: 'Adres dostawy' }).click();
  await page.getByRole('textbox', { name: 'Kod pocztowy' }).fill('00000');
  await page.getByRole('button', { name: 'Zapisz', exact: true }).click();

  // Podsumowanie błędów nad formularzem: błędne jest tylko jedno pole
  await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');

  // Komunikat przy polu „Kod pocztowy”
  await expect(page.getByText('Kod pocztowy musi mieć format 00-000')).toBeVisible();

  // Adres nie został zapisany
  await expect(page.getByText('Zapisano adres dostawy.')).not.toBeVisible();
});
