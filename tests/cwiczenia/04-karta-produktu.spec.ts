import { test, expect } from '@playwright/test';

// Ćwiczenie 04b: ta sama cena promocyjna na kafelku, na karcie produktu i w koszyku.
// Karta: docs/cwiczenia/04-locatory-codegen.md (część 04b)
// Konto tester11 ma osobny koszyk: testy z ćwiczeń 02 i 04 dodają produkty do koszyka konta user.

test('cena promocyjna kremu jest taka sama na kafelku, karcie produktu i w koszyku', async ({ page }) => {
  // Logowanie jako tester11. Po zalogowaniu aplikacja wraca na stronę „Produkty”.
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester11');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByRole('heading', { name: 'Produkty' })).toBeVisible();

  // Kafelek kremu w sekcji „Oferta na Czarny Piątek”.
  // Ceny sprawdzamy po test id, bo sam tekst nie mówi, która cena jest nowa, a która stara.
  const kafelek = page.getByRole('article', { name: 'Krem do twarzy na dzień' });
  await expect(kafelek.getByTestId('tile-price')).toHaveText('26,39 zł');
  await expect(kafelek.getByTestId('tile-old-price')).toHaveText('32,99 zł');
  await expect(kafelek.getByTestId('tile-badge')).toHaveText('-20%');

  // Karta produktu: nagłówek i te same trzy informacje o cenie.
  await kafelek.getByRole('link', { name: 'Krem do twarzy na dzień' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Krem do twarzy na dzień' })).toBeVisible();
  await expect(page.getByTestId('product-price')).toHaveText('26,39 zł');
  await expect(page.getByTestId('product-old-price')).toHaveText('32,99 zł');
  await expect(page.getByTestId('product-badge')).toHaveText('-20%');

  // Dodanie do koszyka z karty produktu.
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page.getByText('Dodano do koszyka: Krem do twarzy na dzień')).toBeVisible();

  // Koszyk: w komórce ceny jest też stara cena i plakietka, dlatego toContainText.
  await page.getByRole('link', { name: 'Koszyk' }).click();
  const wiersz = page.getByRole('row').filter({ hasText: 'Krem do twarzy na dzień' });
  await expect(wiersz.getByTestId('cart-item-price')).toContainText('26,39 zł');

  // Sprzątanie: usuwamy krem, żeby następne uruchomienie zaczynało od pustego koszyka.
  await wiersz.getByRole('button', { name: 'Usuń: Krem do twarzy na dzień' }).click();
  await expect(wiersz).toHaveCount(0);
});
