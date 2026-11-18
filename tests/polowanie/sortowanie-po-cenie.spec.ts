import { test, expect } from '@playwright/test';

// Polowanie (ćwiczenie 13): katalog z sort=cena ma być ułożony od najtańszego do najdroższego.
// Opis API (/api/docs): GET /api/catalog, parametr sort=cena, cena klienta to promo_price_cents.
// Test tylko czyta katalog: nie loguje się i nie zmienia danych na wspólnym serwerze.
test('katalog posortowany po cenie zaczyna się od najtańszego produktu i ceny rosną', async ({ request }) => {
  const odpowiedz = await request.get('/api/catalog?sort=cena');
  expect(odpowiedz.status()).toBe(200);

  const produkty: { promo_price_cents: number }[] = await odpowiedz.json();
  const ceny = produkty.map((produkt) => produkt.promo_price_cents);

  // Ta sama lista ułożona liczbowo rosnąco: 499 przed 1099, a nie jak tekst („1099” przed „499”).
  const cenyRosnaco = [...ceny].sort((a, b) => a - b);

  // Kolejność z API ma być identyczna z kolejnością liczbową.
  expect(ceny).toEqual(cenyRosnaco);
});
