import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie (ćwiczenie 13): nowy adres w profilu z kodem pocztowym bez myślnika jest odrzucany.
// Opis API (/api/docs): POST /api/account/addresses, postal_code ma format 00-000 (wzorzec ^\d{2}-\d{3}$),
// błędne dane dają 400 i listę errors z polem, którego dotyczy błąd.
// Sprzątanie: jeśli aplikacja mimo to zapisze adres, afterEach go usuwa.
let idDoUsuniecia: number | undefined;

test.afterEach(async ({ request }) => {
  if (idDoUsuniecia === undefined) return;
  const id = idDoUsuniecia;
  idDoUsuniecia = undefined;
  const odpowiedz = await request.delete(`/api/account/addresses/${id}`);
  expect(odpowiedz.status(), `usunięcie adresu ${id} przy sprzątaniu`).toBe(200);
});

test('adres w profilu z kodem pocztowym 00950 (bez myślnika) daje 400 i błąd pola postal_code', async ({ request }) => {
  await zalogujPrzezApi(request);

  const odpowiedz = await request.post('/api/account/addresses', {
    data: {
      name: `Polowanie ${Date.now()}`,
      street: 'ul. Biurowa 7',
      postal_code: '00950',
      city: 'Warszawa',
      phone: '600 700 800',
    },
  });
  const tresc = await odpowiedz.json();
  // Gdyby adres jednak powstał, zapamiętujemy go do usunięcia w afterEach.
  if (odpowiedz.status() === 201) idDoUsuniecia = tresc.id;

  // Kod 00950 nie ma formatu 00-000: status 400.
  expect(odpowiedz.status()).toBe(400);
  // W errors jest pole postal_code.
  expect(tresc.errors).toContainEqual(expect.objectContaining({ field: 'postal_code' }));
});
