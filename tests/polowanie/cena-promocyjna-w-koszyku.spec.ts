import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie (ćwiczenie 13): produkt w promocji ma w koszyku tę samą cenę co w katalogu.
// Wymaganie P9 z docs/projekt.md: „Krem do twarzy na dzień” kosztuje po promocji -20% „26,39 zł”,
// także w koszyku. Promocja ma być naliczona raz, a nie dwa razy.
// Sprzątanie: afterEach opróżnia koszyk konta testowego.
test.afterEach(async ({ request }) => {
  const odpowiedz = await request.delete('/api/cart');
  expect(odpowiedz.status(), 'opróżnienie koszyka przy sprzątaniu').toBe(200);
});

test('Krem do twarzy w promocji kosztuje w koszyku 26,39 zł, tyle samo co w katalogu', async ({ request }) => {
  await zalogujPrzezApi(request);

  // Pusty koszyk na start, żeby w koszyku był tylko krem.
  const czyszczenie = await request.delete('/api/cart');
  expect(czyszczenie.status(), 'opróżnienie koszyka przed testem').toBe(200);

  // Cena w katalogu (karta produktu): P9 „nowa cena 26,39 zł”.
  const katalog = await request.get('/api/catalog/5');
  expect(katalog.status()).toBe(200);
  const krem = await katalog.json();
  expect(krem.promo_price_cents).toBe(2639);

  const dodanie = await request.post('/api/cart/items', { data: { product_id: 5, qty: 1 } });
  expect(dodanie.status()).toBe(201);
  const koszyk = await dodanie.json();

  // P9: „w koszyku w wierszu Krem do twarzy na dzień cena 26,39 zł” (jak w katalogu).
  expect(koszyk.items).toEqual([
    expect.objectContaining({ product_id: 5, qty: 1, unit_price_cents: 2639, total_cents: 2639 }),
  ]);
});
