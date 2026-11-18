import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Scenariusz P1 z docs/projekt.md: zakup z płatnością przy odbiorze.
// Kopia tests/projekt/p1-zakup.spec.ts dostosowana do wspólnego serwera:
// bez anulowania kontem admin (na serwerze nie mamy jego hasła). Karta polowania pozwala
// tworzyć własne zamówienia; sprzątamy koszyk. Stan Balsamu mogą zmieniać inne pary.

test.afterEach(async ({ page }) => {
  const odpowiedz = await page.request.delete('/api/cart');
  expect(odpowiedz.status(), 'opróżnienie koszyka przy sprzątaniu').toBe(200);
});

test('P1: zakup Balsamu z płatnością przy odbiorze tworzy zamówienie „Nowe” i zmniejsza stan o 1', async ({ page }) => {
  await zaloguj(page);

  // Pusty koszyk na start, żeby w zamówieniu była tylko 1 sztuka Balsamu.
  // page.request korzysta z tej samej sesji co zalogowana przeglądarka.
  const czyszczenie = await page.request.delete('/api/cart');
  expect(czyszczenie.status(), 'opróżnienie koszyka').toBe(200);
  expect((await czyszczenie.json()).items, 'koszyk pusty przed zakupem').toEqual([]);

  // Stan przed zakupem czytamy z wiersza tabeli (pod tabelą są kafelki z tą samą nazwą).
  await page.goto('/');
  const stanBalsamu = page
    .getByRole('row')
    .filter({ hasText: 'Balsam do ciała' })
    .getByTestId('product-stock');
  const stanPrzed = Number(await stanBalsamu.textContent());

  await page.getByRole('button', { name: 'Dodaj do koszyka: Balsam do ciała' }).click();
  // Czekamy, aż aplikacja potwierdzi dodanie, zanim przejdziemy do koszyka.
  await expect(page).toHaveURL(/dodano=/);

  await page.goto('/koszyk');
  await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

  // P1, punkt 1: „aplikacja przechodzi na stronę Moje zamówienia”
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Moje zamówienia');

  // P1, punkt 1: „pokazuje komunikat Złożono zamówienie: ZAM-… z nowym numerem”.
  // Sprawdzamy go od razu: komunikat znika po kilku sekundach.
  const komunikat = page.getByText(/^Złożono zamówienie: ZAM-\d+$/);
  await expect(komunikat).toBeVisible();
  const numer = ((await komunikat.textContent()) ?? '').replace('Złożono zamówienie: ', '');

  // P1, punkt 2: „na liście jest wiersz z tym numerem, produktem Balsam do ciała i statusem Nowe”
  const wiersz = page.getByRole('row').filter({ hasText: numer });
  await expect(wiersz.getByRole('cell', { name: 'Balsam do ciała', exact: true })).toBeVisible();
  await expect(wiersz.getByRole('cell', { name: 'Nowe', exact: true })).toBeVisible();

  // P1, punkt 3: „na stronie Produkty stan Balsam do ciała jest mniejszy o 1 niż przed zakupem”
  await page.goto('/');
  await expect(stanBalsamu).toHaveText(String(stanPrzed - 1));
});
