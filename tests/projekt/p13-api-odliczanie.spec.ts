import { test, expect } from '@playwright/test';

// Scenariusz P13 z docs/projekt.md: odliczanie do Czarnego Piątku (API).
// Zmiana wymagań Bożeny z 13:00 (ćwiczenie 12b): zamiast 20.11 sprawdzamy dzień przed startem (26.11)
// i dzień startu (27.11). Sprawdzenie błędnej daty (400) zostaje.
// Nagłówek X-Namssor-Teraz ustawia „dzisiejszą” datę tylko w tym żądaniu (opis w /api/docs).
const daty = [
  {
    data: '2026-11-26',
    dni: 1,
    komunikat: 'Czarny Piątek w Namssorze startuje 27.11.2026. Do startu promocji został 1 dzień.',
  },
  {
    data: '2026-11-27',
    dni: 0,
    komunikat: 'Czarny Piątek w Namssorze trwa! Tylko dziś najniższe ceny.',
  },
];

test.describe('P13: odliczanie do Czarnego Piątku', () => {
  // Osobny test dla każdej daty, więc raport pokazuje osobny wynik dla 26.11 i 27.11.
  for (const { data, dni, komunikat } of daty) {
    test(`dla daty ${data} days_left to ${dni} i komunikat jest zgodny z wymaganiem`, async ({ request }) => {
      const odpowiedz = await request.get('/api/promocja', { headers: { 'X-Namssor-Teraz': data } });
      const tresc = await odpowiedz.json();

      // P13: „status 200”
      expect(odpowiedz.status()).toBe(200);
      // P13 (zmiana z 13:00): „days_left równe 1” dla 26.11, „równe 0” dla 27.11
      expect(tresc.days_left).toBe(dni);
      // P13 (zmiana z 13:00): „message równe …” (dokładnie)
      expect(tresc.message).toBe(komunikat);
    });
  }

  test('nagłówek z datą „jutro” daje status 400', async ({ request }) => {
    const odpowiedz = await request.get('/api/promocja', { headers: { 'X-Namssor-Teraz': 'jutro' } });

    // P13: „nagłówek X-Namssor-Teraz: jutro daje status 400”
    expect(odpowiedz.status()).toBe(400);
  });
});
