import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie (ćwiczenie 13): cudze zamówienie z numerem zapisanym małymi literami też daje 404.
// Wymaganie P7 z docs/projekt.md: klient nie widzi cudzych zamówień, odpowiedź to 404
// i { "error": "Nie ma takiego zamówienia" }. Opis API (/api/docs): GET /api/orders/{number} ma 404.
// ZAM-1005 należy do konta admin, więc dla klienta jest cudze. Test tylko czyta, nic nie zmienia.
test('cudze zamówienie zam-1005 zapisane małymi literami daje 404 „Nie ma takiego zamówienia”', async ({ request }) => {
  await zalogujPrzezApi(request);

  const odpowiedz = await request.get('/api/orders/zam-1005');

  // Cudzego (ani nieistniejącego) zamówienia klient nie dostaje: status 404.
  expect(odpowiedz.status()).toBe(404);
  // Treść błędu jak w P7.
  expect(await odpowiedz.json()).toEqual({ error: 'Nie ma takiego zamówienia' });
});
