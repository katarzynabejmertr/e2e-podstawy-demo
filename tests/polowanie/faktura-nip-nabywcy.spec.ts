import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie (ćwiczenie 13): na fakturze nabywca ma swój NIP, a nie NIP sprzedawcy.
// Wymaganie P10 z docs/projekt.md: faktura na „Biuro Mikołaja” z NIP 101-202-30-36 ma dane nabywcy
// „Biuro Mikołaja” i NIP 1012023036. Opis API (/api/docs): GET /api/orders/{number}/invoice.
// Test składa własne zamówienie firmowe (karta polowania pozwala tworzyć własne zamówienia).
test('faktura na Biuro Mikołaja ma NIP nabywcy 1012023036, a nie NIP sprzedawcy', async ({ request }) => {
  await zalogujPrzezApi(request);

  const zlozenie = await request.post('/api/business-orders', {
    data: { product_id: 21, qty: 1, nip: '101-202-30-36', company: 'Biuro Mikołaja' },
  });
  const zamowienie = await zlozenie.json();
  expect(zlozenie.status(), 'złożenie zamówienia na firmę').toBe(201);

  const odpowiedz = await request.get(`/api/orders/${zamowienie.number}/invoice`);
  expect(odpowiedz.status()).toBe(200);
  const faktura = await odpowiedz.json();

  // P10: dane nabywcy to firma klienta i jej NIP (bez kresek).
  expect(faktura.buyer).toEqual({ name: 'Biuro Mikołaja', nip: '1012023036' });
});
