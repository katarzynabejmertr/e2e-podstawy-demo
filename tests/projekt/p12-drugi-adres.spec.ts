import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Scenariusz P12 z docs/projekt.md: drugi adres w profilu.
// Test sam usuwa swój adres na końcu. Gdyby padł wcześniej, afterEach usuwa go przez API.
let nazwaDoUsuniecia: string | undefined;

test.afterEach(async ({ page }) => {
  if (!nazwaDoUsuniecia) return;
  const nazwa = nazwaDoUsuniecia;
  nazwaDoUsuniecia = undefined;

  const adresy: { id: number; name: string }[] = await (await page.request.get('/api/account/addresses')).json();
  for (const adres of adresy.filter((a) => a.name === nazwa)) {
    const odpowiedz = await page.request.delete(`/api/account/addresses/${adres.id}`);
    expect(odpowiedz.status(), `usunięcie adresu ${nazwa} przy sprzątaniu`).toBe(200);
  }
});

test('P12: nowy adres po „Ustaw jako domyślny” ma jedyną plakietkę Domyślny, a po usunięciu wraca Adres główny', async ({ page }) => {
  // Unikalna nazwa, np. „Praca 1763460000000”.
  const nazwa = `Praca ${Date.now()}`;
  nazwaDoUsuniecia = nazwa;

  await zaloguj(page);
  await page.goto('/konto/adresy');
  await page.getByLabel('Nazwa adresu').fill(nazwa);
  await page.getByLabel('Ulica i numer').fill('ul. Biurowa 7');
  await page.getByLabel('Kod pocztowy').fill('00-950');
  await page.getByLabel('Miasto').fill('Warszawa');
  await page.getByLabel('Telefon').fill('600 700 800');
  await page.getByRole('button', { name: 'Dodaj adres' }).click();

  // P12: „komunikat Dodano adres: <nazwa>”
  await expect(page.getByText(`Dodano adres: ${nazwa}`, { exact: true })).toBeVisible();
  // P12: „i nowy adres na liście”
  const nowyAdres = page.getByRole('article').filter({ has: page.getByRole('heading', { name: nazwa }) });
  await expect(nowyAdres).toBeVisible();

  await page.getByRole('button', { name: `Ustaw jako domyślny: ${nazwa}` }).click();
  // P12: „plakietka Domyślny jest przy nowym adresie”
  await expect(nowyAdres.getByText('Domyślny', { exact: true })).toBeVisible();
  // P12: „i na stronie jest tylko jedna taka plakietka”
  await expect(page.getByText('Domyślny', { exact: true })).toHaveCount(1);

  // P12: „Adres główny nie ma przycisku Usuń” (nowy adres ma „Usuń adres: <nazwa>”, więc nazwa przycisku jest prawdziwa)
  const adresGlowny = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Adres główny' }) });
  await expect(nowyAdres.getByRole('button', { name: /^Usuń adres:/ })).toBeVisible();
  await expect(adresGlowny.getByRole('button', { name: /^Usuń adres:/ })).toHaveCount(0);

  // P12: „Test na koniec usuwa swój adres. Wtedy Domyślny wraca do Adres główny.”
  await page.getByRole('button', { name: `Usuń adres: ${nazwa}` }).click();
  await expect(nowyAdres).toHaveCount(0);
  nazwaDoUsuniecia = undefined;
  await expect(adresGlowny.getByText('Domyślny', { exact: true })).toBeVisible();
});
