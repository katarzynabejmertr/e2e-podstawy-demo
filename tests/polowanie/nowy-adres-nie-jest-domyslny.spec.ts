import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie (ćwiczenie 13): dodany adres nie staje się sam domyślny.
// Wymaganie P12 z docs/projekt.md: adres staje się domyślny dopiero po „Ustaw jako domyślny”,
// a domyślny jest wtedy tylko jeden. Do tego czasu domyślny zostaje „Adres główny”.
// Sprzątanie: afterEach usuwa dodany adres.
let idDoUsuniecia: number | undefined;

test.afterEach(async ({ request }) => {
  if (idDoUsuniecia === undefined) return;
  const id = idDoUsuniecia;
  idDoUsuniecia = undefined;
  const odpowiedz = await request.delete(`/api/account/addresses/${id}`);
  expect(odpowiedz.status(), `usunięcie adresu ${id} przy sprzątaniu`).toBe(200);
});

test('nowo dodany adres nie jest domyślny, domyślny zostaje „Adres główny”', async ({ request }) => {
  await zalogujPrzezApi(request);
  const nazwa = `Polowanie ${Date.now()}`;

  const dodanie = await request.post('/api/account/addresses', {
    data: { name: nazwa, street: 'ul. Biurowa 7', postal_code: '00-950', city: 'Warszawa', phone: '600 700 800' },
  });
  const nowy = await dodanie.json();
  idDoUsuniecia = nowy.id;
  expect(dodanie.status(), 'dodanie adresu').toBe(201);

  // P12: przed „Ustaw jako domyślny” nowy adres nie jest domyślny.
  expect(nowy.default).toBe(false);

  // P12: domyślny jest jeden i jest nim nadal „Adres główny”.
  const lista = await request.get('/api/account/addresses');
  expect(lista.status()).toBe(200);
  const adresy: { name: string; default: boolean }[] = await lista.json();
  const domyslne = adresy.filter((adres) => adres.default).map((adres) => adres.name);
  expect(domyslne).toEqual(['Adres główny']);
});
