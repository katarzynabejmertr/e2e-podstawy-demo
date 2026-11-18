import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Scenariusz P15 z docs/projekt.md: status zamówienia w panelu administratora.
// Tylko lokalnie (konto admin).
// Bez sprzątania: wysłanego zamówienia aplikacja nie pozwala anulować (API zwraca 409),
// więc każdy przebieg zostawia jedno wysłane zamówienie Kalendarza adwentowego 2026.
// Lokalnie usuwa je npm run db:reset (przy zatrzymanej aplikacji).
test('P15: administrator zmienia status na Opłacone, potem na Wysłane, a klient widzi shipped', async ({ page, request }) => {
  // Klient składa zamówienie przez API (Kalendarz adwentowy 2026, duży stan magazynu).
  await zalogujPrzezApi(request);
  const zlozenie = await request.post('/api/orders', { data: { product_id: 21, qty: 1 } });
  const numer = (await zlozenie.json()).number;
  expect(zlozenie.status(), 'złożenie zamówienia przez API').toBe(201);

  await zaloguj(page, 'admin', 'admin123');
  await page.goto(`/admin/zamowienia/${numer}`);

  await page.getByRole('combobox', { name: 'Status zamówienia' }).selectOption('Zapłacone');
  await page.getByRole('button', { name: 'Zapisz status' }).click();
  // P15: „po zapisie status na stronie zamówienia to Opłacone” (hotfix: etykieta zmieniona na „Zapłacone”)
  await expect(page.getByText('Status: Zapłacone', { exact: true })).toBeVisible();

  await page.getByRole('combobox', { name: 'Status zamówienia' }).selectOption('Wysłane');
  await page.getByRole('button', { name: 'Zapisz status' }).click();
  // P15: „po zapisie status na stronie zamówienia to Wysłane”
  await expect(page.getByText('Status: Wysłane', { exact: true })).toBeVisible();

  // P15: „klient widzi w GET /api/orders/<numer> status równy "shipped"” (request jest zalogowany jako klient)
  const odczyt = await request.get(`/api/orders/${numer}`);
  expect(odczyt.status()).toBe(200);
  expect((await odczyt.json()).status).toBe('shipped');
});
