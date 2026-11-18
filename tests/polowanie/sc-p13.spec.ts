import { test, expect } from '@playwright/test';

// Scenariusz P13 z docs/projekt.md: odliczanie do Czarnego Piątku (API).
// Nagłówek X-Namssor-Teraz ustawia „dzisiejszą” datę tylko w tym żądaniu (opis w /api/docs).
test.describe('P13: odliczanie do Czarnego Piątku', () => {
  test('dla daty 2026-11-20 zostaje 7 dni i komunikat podaje start 27.11.2026', async ({ request }) => {
    const odpowiedz = await request.get('/api/promocja', { headers: { 'X-Namssor-Teraz': '2026-11-20' } });
    const tresc = await odpowiedz.json();

    // P13: „status 200”
    expect(odpowiedz.status()).toBe(200);
    // P13: „days_left równe 7”
    expect(tresc.days_left).toBe(7);
    // P13: „message równe …” (dokładnie)
    expect(tresc.message).toBe('Czarny Piątek w Namssorze startuje 27.11.2026. Do startu promocji zostało 7 dni.');
  });

  test('nagłówek z datą „jutro” daje status 400', async ({ request }) => {
    const odpowiedz = await request.get('/api/promocja', { headers: { 'X-Namssor-Teraz': 'jutro' } });

    // P13: „nagłówek X-Namssor-Teraz: jutro daje status 400”
    expect(odpowiedz.status()).toBe(400);
  });
});
