import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Scenariusz P8 z docs/projekt.md: zamówienie z API anulowane w panelu administratora.
// Tylko lokalnie (konto admin). Anulowanie jest częścią testu i samo oddaje towar na stan.
// Gdyby test padł przed anulowaniem, afterEach anuluje zamówienie przez API.
let numerZamowienia: string | undefined;

test.afterEach(async ({ request }) => {
  if (!numerZamowienia) return;
  const numer = numerZamowienia;
  numerZamowienia = undefined;

  await zalogujPrzezApi(request, 'admin', 'admin123');
  const stan = await (await request.get(`/api/orders/${numer}`)).json();
  if (stan.status === 'new') {
    const odpowiedz = await request.post(`/api/admin/orders/${numer}/cancel`);
    expect(odpowiedz.status(), `anulowanie ${numer} przy sprzątaniu`).toBe(200);
  }
});

test('P8: zamówienie z API anulowane w panelu ma status Anulowane, a inne zamówienia się nie zmieniają', async ({ page, request }) => {
  // Klient składa zamówienie przez API (Kalendarz adwentowy 2026, duży stan magazynu).
  await zalogujPrzezApi(request);
  const zlozenie = await request.post('/api/orders', { data: { product_id: 21, qty: 1 } });
  const numer = (await zlozenie.json()).number;
  numerZamowienia = numer;
  expect(zlozenie.status(), 'złożenie zamówienia przez API').toBe(201);

  // Status innego zamówienia przed anulowaniem (do porównania na końcu).
  await zalogujPrzezApi(request, 'admin', 'admin123');
  const inneZamowieniePrzed = (await (await request.get('/api/orders/ZAM-1001')).json()).status;

  // Administrator znajduje zamówienie po numerze i klika „Anuluj”.
  await zaloguj(page, 'admin', 'admin123');
  await page.goto('/admin/zamowienia');
  await page.getByRole('searchbox', { name: 'Szukaj zamówienia' }).fill(numer);
  await page.getByRole('button', { name: 'Szukaj', exact: true }).click();
  const wiersz = page.getByRole('row').filter({ hasText: numer });
  await wiersz.getByRole('button', { name: 'Anuluj' }).click();

  // P8: „w wierszu tego zamówienia status Anulowane”
  await expect(wiersz.getByRole('cell', { name: 'Anulowane', exact: true })).toBeVisible();
  // P8: „i brak przycisku Anuluj”
  await expect(wiersz.getByRole('button', { name: 'Anuluj' })).toHaveCount(0);

  // P8: „GET /api/orders/<numer> zwraca status równy "cancelled"”
  const poAnulowaniu = await request.get(`/api/orders/${numer}`);
  expect((await poAnulowaniu.json()).status).toBe('cancelled');

  // P8: „inne zamówienia nie zmieniły statusu” (ZAM-1001 ma ten sam status co przed anulowaniem)
  const inneZamowieniePo = (await (await request.get('/api/orders/ZAM-1001')).json()).status;
  expect(inneZamowieniePo).toBe(inneZamowieniePrzed);
});
