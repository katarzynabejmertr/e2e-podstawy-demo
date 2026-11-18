import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Scenariusz P10 z docs/projekt.md: zamówienie na firmę i faktura (konto biuro).
// Tylko lokalnie: sprzątanie anuluje zamówienie kontem admin.
// Oba testy używają koszyka konta biuro, więc biegną po kolei.
test.describe.configure({ mode: 'serial' });

let numerDoAnulowania: string | undefined;

test.afterEach(async ({ page, request }) => {
  // Pusty koszyk konta biuro (page jest zalogowany jako biuro).
  const koszyk = await page.request.delete('/api/cart');
  expect(koszyk.status(), 'opróżnienie koszyka przy sprzątaniu').toBe(200);

  if (!numerDoAnulowania) return;
  const numer = numerDoAnulowania;
  numerDoAnulowania = undefined;
  await zalogujPrzezApi(request, 'admin', 'admin123');
  const odpowiedz = await request.post(`/api/admin/orders/${numer}/cancel`);
  expect(odpowiedz.status(), `anulowanie ${numer} przy sprzątaniu`).toBe(200);
});

test.describe('P10: zamówienie na firmę i faktura', () => {
  test.beforeEach(async ({ page }) => {
    await zaloguj(page, 'biuro', 'biuro123');
    // Pusty koszyk na start, potem jeden Kalendarz adwentowy 2026.
    const czyszczenie = await page.request.delete('/api/cart');
    expect(czyszczenie.status(), 'opróżnienie koszyka przed testem').toBe(200);
    await page.goto('/');
    await page.getByRole('button', { name: 'Dodaj do koszyka: Kalendarz adwentowy 2026' }).click();
    await expect(page).toHaveURL(/dodano=/);
    await page.goto('/koszyk');
    await page.getByRole('checkbox', { name: 'Faktura na firmę' }).check();
    await page.getByLabel('Nazwa firmy').fill('Biuro Mikołaja');
  });

  test('poprawny NIP: zamówienie z fakturą na Biuro Mikołaja i plik faktury na 39,99 zł', async ({ page }) => {
    await page.getByLabel('NIP').fill('101-202-30-36');
    await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

    // P10: „strona Moje zamówienia”
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Moje zamówienia');
    // P10: „a w adresie strony numer nowego zamówienia (zlozono=ZAM-…)”
    await expect(page).toHaveURL(/zlozono=ZAM-\d+/);
    const numer = new URL(page.url()).searchParams.get('zlozono') ?? '';
    numerDoAnulowania = numer;

    await page.goto(`/zamowienia/${numer}`);
    // P10: „na stronie tego zamówienia: Faktura na firmę: Biuro Mikołaja i NIP 1012023036”
    await expect(page.getByText('Faktura na firmę: Biuro Mikołaja, NIP 1012023036', { exact: true })).toBeVisible();

    const pobieranie = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Pobierz fakturę' }).click();
    const plik = await pobieranie;
    // P10: „Pobierz fakturę pobiera plik faktura-ZAM-….html”
    expect(plik.suggestedFilename()).toBe(`faktura-${numer}.html`);

    // Zapisujemy pobrany plik z końcówką .html i otwieramy go w przeglądarce testu,
    // żeby sprawdzić jego treść zwykłymi lokatorami.
    const sciezka = test.info().outputPath(`faktura-${numer}.html`);
    await plik.saveAs(sciezka);
    await page.goto(`file:///${sciezka.replaceAll('\\', '/')}`);
    // P10: „z numerem faktury FV/2026/ZAM-…”
    await expect(page.getByRole('heading', { name: `Faktura FV/2026/${numer}` })).toBeVisible();
    // P10: „danymi nabywcy”. Nazwa i NIP są w jednym akapicie, w dwóch liniach,
    // więc porównujemy tekst widoczny na ekranie (useInnerText).
    const nabywca = page.getByRole('paragraph').filter({ hasText: 'NIP nabywcy:' });
    await expect(nabywca).toHaveText('Biuro Mikołaja NIP nabywcy: 1012023036', { useInnerText: true });
    // P10: „i kwotą Razem do zapłaty: 39,99 zł”
    await expect(page.getByText('Razem do zapłaty: 39,99 zł', { exact: true })).toBeVisible();
  });

  test('NIP ze złą sumą kontrolną zatrzymuje zamówienie i klient zostaje w koszyku', async ({ page }) => {
    await page.getByLabel('NIP').fill('101-202-30-37');
    await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

    // P10: „komunikat Nieprawidłowy NIP: błędna suma kontrolna”
    await expect(page.getByText('Nieprawidłowy NIP: błędna suma kontrolna', { exact: true })).toBeVisible();
    // P10: „klient zostaje w koszyku”
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Koszyk');
  });
});
