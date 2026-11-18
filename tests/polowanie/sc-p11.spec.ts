import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Scenariusz P11 z docs/projekt.md: kod rabatowy w koszyku.
// Każdy kod sprawdzamy w osobnym teście na czystym koszyku: po błędnym kodzie
// aplikacja zostawia rabat z poprzedniego kodu, więc „bez rabatu” trzeba sprawdzać od zera.
// Testy używają koszyka tego samego konta, więc biegną po kolei.
test.describe.configure({ mode: 'serial' });

test.describe('P11: kod rabatowy w koszyku', () => {
  test.beforeEach(async ({ page }) => {
    await zaloguj(page);
    // Czysty koszyk z jednym Mydłem w kostce (page.request ma sesję przeglądarki).
    const czyszczenie = await page.request.delete('/api/cart');
    expect(czyszczenie.status(), 'opróżnienie koszyka przed testem').toBe(200);
    const mydlo = await page.request.post('/api/cart/items', { data: { product_id: 11, qty: 1 } });
    expect(mydlo.status(), 'Mydło w kostce w koszyku').toBe(201);
    await page.goto('/koszyk');
  });

  test.afterEach(async ({ page }) => {
    // P11: „Test na koniec usuwa kod i mydło z koszyka” (opróżnienie koszyka usuwa też kod).
    const odpowiedz = await page.request.delete('/api/cart');
    expect(odpowiedz.status(), 'opróżnienie koszyka przy sprzątaniu').toBe(200);
  });

  test('kod CZARNY20 jest przyjęty i pod sumą jest linia z rabatem', async ({ page }) => {
    await page.getByLabel('Kod rabatowy').fill('CZARNY20');
    await page.getByRole('button', { name: 'Użyj kodu' }).click();

    // P11: „komunikat Kod CZARNY20 przyjęty: -20% na całe zamówienie.”
    await expect(page.getByRole('status')).toHaveText('Kod CZARNY20 przyjęty: -20% na całe zamówienie.');
    // P11: „pod sumą linia Przed rabatem: …, rabat (CZARNY20): -…” (kwoty zależą od zaokrągleń, stąd wzorzec;
    // \s+ dlatego, że w HTML po „(CZARNY20):” jest przejście do nowej linii)
    await expect(page.getByText(/^Przed rabatem: \d+,\d{2} zł, rabat \(CZARNY20\):\s+-\d+,\d{2} zł$/)).toBeVisible();
  });

  test('kod NIEMA jest odrzucony i nie ma rabatu', async ({ page }) => {
    await page.getByLabel('Kod rabatowy').fill('NIEMA');
    await page.getByRole('button', { name: 'Użyj kodu' }).click();

    // P11: „komunikat Nie ma takiego kodu rabatowego: NIEMA”
    await expect(page.getByRole('alert')).toHaveText('Nie ma takiego kodu rabatowego: NIEMA');
    // P11: „bez rabatu” (nie ma linii „Przed rabatem”, którą test CZARNY20 widzi)
    await expect(page.getByText(/^Przed rabatem:/)).toHaveCount(0);
  });

  test('kod WLOSY15 bez produktów z kategorii Włosy jest odrzucony z wyjaśnieniem', async ({ page }) => {
    await page.getByLabel('Kod rabatowy').fill('WLOSY15');
    await page.getByRole('button', { name: 'Użyj kodu' }).click();

    // P11: „komunikat Kod WLOSY15 działa tylko na produkty z kategorii Włosy. W koszyku nie ma takich produktów.”
    await expect(page.getByRole('alert')).toHaveText(
      'Kod WLOSY15 działa tylko na produkty z kategorii Włosy. W koszyku nie ma takich produktów.',
    );
  });
});
