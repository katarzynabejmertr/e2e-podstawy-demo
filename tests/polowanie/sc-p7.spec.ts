import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Scenariusz P7 z docs/projekt.md: klient nie widzi cudzych zamówień.
// Kopia części klienta i części bez logowania z tests/projekt/p7-api-cudze-zamowienia.spec.ts.
// Klient to konto z APP_USER. Pominięte: część administratora oraz „user widzi swoje ZAM-1001”,
// bo ZAM-1001 należy do konta user, a dla konta z APP_USER jest cudze.
test.describe('P7: klient nie widzi cudzych zamówień', () => {
  test('cudze zamówienie ZAM-1005 daje klientowi 404 „Nie ma takiego zamówienia”', async ({ request }) => {
    await zalogujPrzezApi(request);

    const cudze = await request.get('/api/orders/ZAM-1005');
    // P7: „GET /api/orders/ZAM-1005 daje 404”
    expect(cudze.status()).toBe(404);
    // P7: „i { "error": "Nie ma takiego zamówienia" }”
    expect(await cudze.json()).toEqual({ error: 'Nie ma takiego zamówienia' });
  });

  test('bez logowania zamówienie daje 401 „Wymagane logowanie”', async ({ request }) => {
    const odpowiedz = await request.get('/api/orders/ZAM-1001');

    // P7: „bez logowania: 401”
    expect(odpowiedz.status()).toBe(401);
    // P7: „i { "error": "Wymagane logowanie" }”
    expect(await odpowiedz.json()).toEqual({ error: 'Wymagane logowanie' });
  });
});
