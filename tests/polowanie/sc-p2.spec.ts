import { test, expect } from '@playwright/test';

// Scenariusz P2 z docs/projekt.md: koszyk wymaga logowania.
// Kopia tests/projekt/p2-koszyk-wymaga-logowania.spec.ts z kontem ze zmiennych APP_USER i APP_PASSWORD.
// Bez funkcji zaloguj(page): ona otwiera /logowanie od nowa i gubi parametr next=%2Fkoszyk,
// a ten scenariusz sprawdza właśnie powrót do koszyka po logowaniu.
const login = process.env.APP_USER ?? '';
const haslo = process.env.APP_PASSWORD ?? '';

test('P2: niezalogowany klient na /koszyk trafia na logowanie, a po zalogowaniu wraca do koszyka', async ({ page }) => {
  await page.goto('/koszyk');

  // P2: „przed logowaniem aplikacja pokazuje stronę Logowanie, adres zawiera next=%2Fkoszyk”
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Logowanie');
  await expect(page).toHaveURL(/next=%2Fkoszyk/);

  // Logowanie na stronie, na którą przekierowała aplikacja.
  await page.getByLabel('Login').fill(login);
  await page.getByLabel('Hasło').fill(haslo);
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  // P2: „po zalogowaniu klient wraca na stronę Koszyk, a nie na stronę główną”
  await expect(page).toHaveURL('/koszyk');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Koszyk');
});
