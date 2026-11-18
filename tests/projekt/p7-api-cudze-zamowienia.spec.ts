import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Scenariusz P7 z docs/projekt.md: klient nie widzi cudzych zamówień.
// ZAM-1001 należy do konta user, ZAM-1005 do konta admin (dane startowe aplikacji).
// Konto user podajemy wprost, bo ZAM-1001 jest jego, a konto domyślne z .env może być inne.
// Tylko lokalnie: na wspólnym serwerze nie ma haseł user i admin.
test.describe('P7: klient nie widzi cudzych zamówień', () => {
  test('klient user widzi swoje ZAM-1001 (200), a cudze ZAM-1005 daje 404 „Nie ma takiego zamówienia”', async ({ request }) => {
    await zalogujPrzezApi(request, 'user', 'user123');

    const swoje = await request.get('/api/orders/ZAM-1001');
    // P7: „klient user: GET /api/orders/ZAM-1001 daje 200”
    expect(swoje.status()).toBe(200);

    const cudze = await request.get('/api/orders/ZAM-1005');
    // P7: „GET /api/orders/ZAM-1005 daje 404”
    expect(cudze.status()).toBe(404);
    // P7: „i { "error": "Nie ma takiego zamówienia" }”
    expect(await cudze.json()).toEqual({ error: 'Nie ma takiego zamówienia' });
  });

  test('administrator widzi zamówienie klienta ZAM-1001 (200)', async ({ request }) => {
    await zalogujPrzezApi(request, 'admin', 'admin123');

    const odpowiedz = await request.get('/api/orders/ZAM-1001');
    // P7: „administrator: GET /api/orders/ZAM-1001 daje 200”
    expect(odpowiedz.status()).toBe(200);
  });

  test('bez logowania zamówienie daje 401 „Wymagane logowanie”', async ({ request }) => {
    const odpowiedz = await request.get('/api/orders/ZAM-1001');

    // P7: „bez logowania: 401”
    expect(odpowiedz.status()).toBe(401);
    // P7: „i { "error": "Wymagane logowanie" }”
    expect(await odpowiedz.json()).toEqual({ error: 'Wymagane logowanie' });
  });
});
