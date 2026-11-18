import { test, expect } from '@playwright/test';

// Scenariusz P5 z docs/projekt.md: katalog produktów w API.
// Katalog jest publiczny, więc testy się nie logują i nie zmieniają danych.
test.describe('P5: katalog produktów w API', () => {
  test('produkty z kategorii Dziecko: status 200 i 3 produkty, każdy z kategorią Dziecko', async ({ request }) => {
    const odpowiedz = await request.get('/api/products?category=Dziecko');

    // P5: „pierwsze żądanie: status 200”
    expect(odpowiedz.status()).toBe(200);
    const produkty: { category: string }[] = await odpowiedz.json();
    // P5: „lista 3 produktów”
    expect(produkty).toHaveLength(3);
    // P5: „każdy z category równym "Dziecko"”
    expect(produkty.map((produkt) => produkt.category)).toEqual(['Dziecko', 'Dziecko', 'Dziecko']);
  });

  test('nieistniejący produkt 999: status 404 i błąd „Nie ma takiego produktu”', async ({ request }) => {
    const odpowiedz = await request.get('/api/products/999');

    // P5: „drugie żądanie: status 404”
    expect(odpowiedz.status()).toBe(404);
    // P5: „i treść { "error": "Nie ma takiego produktu" }”
    expect(await odpowiedz.json()).toEqual({ error: 'Nie ma takiego produktu' });
  });
});
