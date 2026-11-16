import { test, expect } from '@playwright/test';

// Ćwiczenie 03: przeczytaj ten plik i opisz słowami, co sprawdza.

test('produktu niedostępnego nie da się dodać do koszyka', async ({ page }) => {
  await page.goto('/');

  const wiersz = page.getByRole('row').filter({ hasText: 'Serum z witaminą C' });

  await expect(wiersz).toBeVisible();
  await expect(wiersz.getByText('Niedostępny')).toBeVisible();

  // Sedno testu: przycisk w tym wierszu jest wyłączony, więc produktu nie da się dodać.
  // Sama etykieta „Niedostępny” tego nie gwarantuje.
  await expect(wiersz.getByRole('button', { name: 'Dodaj do koszyka' })).toBeDisabled();
});
