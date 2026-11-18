import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Scenariusz P14 z docs/projekt.md: zamówienie firmowe przez API (konto biuro).
// Tylko lokalnie: sprzątanie anuluje zamówienie kontem admin.

// Numer zamówienia założonego w teście. afterEach je anuluje, a anulowanie oddaje towar na stan.
let numerDoAnulowania: string | undefined;

const zamowienieFirmowe = { product_id: 21, qty: 10, nip: '101-202-30-36', company: 'Biuro Mikołaja' };

test.describe('P14: zamówienie firmowe przez API', () => {
  test.afterEach(async ({ request }) => {
    if (!numerDoAnulowania) return;
    const numer = numerDoAnulowania;
    numerDoAnulowania = undefined;

    await zalogujPrzezApi(request, 'admin', 'admin123');
    const odpowiedz = await request.post(`/api/admin/orders/${numer}/cancel`);
    expect(odpowiedz.status(), `anulowanie ${numer} przy sprzątaniu`).toBe(200);
  });

  test('zamówienie 10 kalendarzy na firmę: 201, status new, 399,90 zł i firma na fakturze', async ({ request }) => {
    await zalogujPrzezApi(request, 'biuro', 'biuro123');

    const odpowiedz = await request.post('/api/business-orders', { data: zamowienieFirmowe });
    const zamowienie = await odpowiedz.json();
    numerDoAnulowania = zamowienie.number;

    // P14: „status 201”
    expect(odpowiedz.status()).toBe(201);
    // P14: „status równy "new"”
    expect(zamowienie.status).toBe('new');
    // P14: „qty równe 10”
    expect(zamowienie.qty).toBe(10);
    // P14: „total_cents równe 39990”
    expect(zamowienie.total_cents).toBe(39990);
    // P14: „invoice.company równe "Biuro Mikołaja"”
    expect(zamowienie.invoice.company).toBe('Biuro Mikołaja');
  });

  test('faktura do zamówienia firmowego: 200 i numer FV/2026/<numer zamówienia>', async ({ request }) => {
    await zalogujPrzezApi(request, 'biuro', 'biuro123');

    // Test składa własne zamówienie i bierze numer z odpowiedzi.
    const zlozenie = await request.post('/api/business-orders', { data: zamowienieFirmowe });
    const zamowienie = await zlozenie.json();
    numerDoAnulowania = zamowienie.number;
    expect(zlozenie.status(), 'złożenie zamówienia przed pobraniem faktury').toBe(201);

    const faktura = await request.get(`/api/orders/${zamowienie.number}/invoice`);

    // P14: „GET /api/orders/<numer>/invoice zwraca 200”
    expect(faktura.status()).toBe(200);
    // P14: „i invoice_number równy FV/2026/<numer>”
    expect((await faktura.json()).invoice_number).toBe(`FV/2026/${zamowienie.number}`);
  });

  test('ilość 1001 daje 400 i błąd pola qty', async ({ request }) => {
    await zalogujPrzezApi(request, 'biuro', 'biuro123');

    const odpowiedz = await request.post('/api/business-orders', { data: { ...zamowienieFirmowe, qty: 1001 } });
    const tresc = await odpowiedz.json();

    // P14: „qty równe 1001 daje 400”
    expect(odpowiedz.status()).toBe(400);
    // P14: „a w errors jest pole qty”
    expect(tresc.errors).toContainEqual(expect.objectContaining({ field: 'qty' }));
  });
});
