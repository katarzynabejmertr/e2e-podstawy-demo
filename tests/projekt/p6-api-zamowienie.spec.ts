import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Scenariusz P6 z docs/projekt.md: zamówienie przez API i błędne dane.
// Tylko lokalnie: sprzątanie anuluje zamówienia kontem admin, bo klient nie ma w API anulowania.
// Na wspólnym serwerze hasło admin zna tylko trener, więc tam padnie sprzątanie w afterEach.

// Numer zamówienia założonego w teście. afterEach je anuluje, a anulowanie oddaje towar na stan.
let numerDoAnulowania: string | undefined;

test.describe('P6: zamówienie przez API i błędne dane', () => {
  test.afterEach(async ({ request }) => {
    if (!numerDoAnulowania) return;
    const numer = numerDoAnulowania;
    numerDoAnulowania = undefined;

    await zalogujPrzezApi(request, 'admin', 'admin123');
    const odpowiedz = await request.post(`/api/admin/orders/${numer}/cancel`);
    expect(odpowiedz.status(), `anulowanie ${numer} przy sprzątaniu`).toBe(200);
  });

  test('złożenie zamówienia daje 201 i nowe zamówienie Balsamu do ciała ze statusem new', async ({ request }) => {
    await zalogujPrzezApi(request);

    const odpowiedz = await request.post('/api/orders', { data: { product_id: 10, qty: 2 } });
    const zamowienie = await odpowiedz.json();
    numerDoAnulowania = zamowienie.number;

    // P6, punkt 1: „status 201”
    expect(odpowiedz.status()).toBe(201);
    // P6, punkt 1: „w odpowiedzi nowy numer ZAM-…”
    expect(zamowienie.number).toMatch(/^ZAM-/);
    // P6, punkt 1: „qty równe 2”
    expect(zamowienie.qty).toBe(2);
    // P6, punkt 1: „status równy "new"”
    expect(zamowienie.status).toBe('new');
    // P6, punkt 1: „product równy "Balsam do ciała"”
    expect(zamowienie.product).toBe('Balsam do ciała');
  });

  test('odczyt złożonego zamówienia daje 200 i to samo zamówienie', async ({ request }) => {
    await zalogujPrzezApi(request);

    // Test składa własne zamówienie i bierze numer z odpowiedzi, nie zależy od testu wyżej.
    const zlozenie = await request.post('/api/orders', { data: { product_id: 10, qty: 2 } });
    const zlozone = await zlozenie.json();
    numerDoAnulowania = zlozone.number;
    expect(zlozenie.status(), 'złożenie zamówienia przed odczytem').toBe(201);

    const odczyt = await request.get(`/api/orders/${zlozone.number}`);
    const odczytane = await odczyt.json();

    // P6, punkt 2: „GET /api/orders/<numer> zwraca 200”
    expect(odczyt.status()).toBe(200);
    // P6, punkt 2: „i to samo zamówienie”: numer, ilość, produkt i status jak przy złożeniu
    expect(odczytane.number).toBe(zlozone.number);
    expect(odczytane.qty).toBe(zlozone.qty);
    expect(odczytane.product).toBe(zlozone.product);
    expect(odczytane.status).toBe(zlozone.status);
  });

  test('ilość 0 daje 400 i błąd pola qty', async ({ request }) => {
    await zalogujPrzezApi(request);

    const odpowiedz = await request.post('/api/orders', { data: { product_id: 10, qty: 0 } });
    const tresc = await odpowiedz.json();

    // P6, punkt 3: „qty równe 0 daje status 400”
    expect(odpowiedz.status()).toBe(400);
    // P6, punkt 3: „a w errors jest pole qty” (errors to lista: [{ field, message }])
    expect(tresc.errors).toContainEqual(expect.objectContaining({ field: 'qty' }));
  });

  test('niedostępny produkt daje 409 i błąd „Brak towaru na stanie”', async ({ request }) => {
    await zalogujPrzezApi(request);

    const odpowiedz = await request.post('/api/orders', { data: { product_id: 3, qty: 1 } });

    // P6, punkt 4: „produkt niedostępny (product_id 3) daje status 409”
    expect(odpowiedz.status()).toBe(409);
    // P6, punkt 4: „i { "error": "Brak towaru na stanie" }” (cała treść, dokładnie)
    expect(await odpowiedz.json()).toEqual({ error: 'Brak towaru na stanie' });
  });
});
