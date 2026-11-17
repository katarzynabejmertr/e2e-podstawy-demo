import { test, expect } from '@playwright/test';

// Wymaganie: filtr kategorii „Dziecko” na stronie produktów pokazuje dokładnie 3 produkty.
test('Filtr kategorii „Dziecko” pokazuje dokładnie 3 produkty', async ({ page }) => {
  await page.goto('/');

  // Wybieramy kategorię i zatwierdzamy filtr.
  await page.getByLabel('Kategoria').selectOption('Dziecko');
  await page.getByRole('button', { name: 'Filtruj' }).click();

  // Wiersze produktów mają komórki „cell”; wiersz nagłówka ma tylko „columnheader”, więc się nie liczy.
  // Liczymy wiersze tabeli, bo sekcja „Oferta na Czarny Piątek” powtarza te same produkty.
  const wierszeProduktow = page.getByRole('row').filter({ has: page.getByRole('cell') });

  // Liczba 3 pochodzi z wymagania. Przed filtrowaniem produktów jest więcej, więc asercja padnie, gdy filtr nie zadziała.
  await expect(wierszeProduktow).toHaveCount(3);

  // Wszystkie pokazane produkty należą do kategorii „Dziecko”.
  await expect(
    wierszeProduktow.filter({ has: page.getByRole('cell', { name: 'Dziecko', exact: true }) }),
  ).toHaveCount(3);

  // Licznik nad tabelą pokazuje tę samą liczbę.
  await expect(page.getByText('Liczba produktów: 3', { exact: true })).toBeVisible();
});
