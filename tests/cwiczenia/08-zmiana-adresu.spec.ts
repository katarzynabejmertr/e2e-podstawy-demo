import { test, expect } from '@playwright/test';

// Przypadki TC-ADR-01 i TC-ADR-02 z docs/scenariusze/zmiana-adresu.md i .feature.
test.describe('Zmiana adresu dostawy', () => {
  // Wszystkie testy zmieniają adres tego samego konta user,
  // więc biegną po kolei, żeby nie nadpisywać sobie danych.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // TC-ADR-01 krok 1: logowanie jako klient
    await page.goto('/logowanie');
    await page.getByLabel('Login').fill('user');
    await page.getByLabel('Hasło').fill('user123');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await expect(page.getByText('Zalogowano jako user (user)')).toBeVisible();

    // TC-ADR-01 krok 2 i TC-ADR-02 krok 1: formularz z adresem startowym
    await page.getByRole('link', { name: 'Adres dostawy' }).click();
    await expect(page.getByRole('heading', { name: 'Zmiana adresu dostawy' })).toBeVisible();
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Przykładowa 12/3');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('00-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Warszawa');
    await expect(page.getByLabel('Telefon')).toHaveValue('500 100 200');
  });

  test.afterEach(async ({ page }) => {
    // Sprzątanie: przywracamy adres startowy, także po nieudanym teście
    await page.goto('/konto/adres');
    await page.getByLabel('Ulica i numer').fill('ul. Przykładowa 12/3');
    await page.getByLabel('Kod pocztowy').fill('00-001');
    await page.getByLabel('Miasto').fill('Warszawa');
    await page.getByLabel('Telefon').fill('500 100 200');
    await page.getByRole('button', { name: 'Zapisz', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Zapisano adres dostawy.');
  });

  test('poprawny adres zapisuje się i zostaje po odświeżeniu strony', async ({ page }) => {
    // Krok 3: wpisujemy nowy adres
    await page.getByLabel('Ulica i numer').fill('ul. Lipowa 7');
    await page.getByLabel('Kod pocztowy').fill('31-001');
    await page.getByLabel('Miasto').fill('Kraków');
    await page.getByLabel('Telefon').fill('600 200 300');
    // Te asercje sprawdzają tylko wpisanie. Zapis potwierdzają kroki 4 i 5.
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Lipowa 7');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('31-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Kraków');
    await expect(page.getByLabel('Telefon')).toHaveValue('600 200 300');

    // Krok 4: zapis i komunikat
    await page.getByRole('button', { name: 'Zapisz', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Zapisano adres dostawy.');

    // Krok 5: po odświeżeniu pola nadal mają nowy adres, czyli zapisał się w bazie
    await page.reload();
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Lipowa 7');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('31-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Kraków');
    await expect(page.getByLabel('Telefon')).toHaveValue('600 200 300');
  });

  test('kod pocztowy 31001 blokuje zapis adresu', async ({ page }) => {
    await page.getByLabel('Kod pocztowy').fill('31001');
    await page.getByRole('button', { name: 'Zapisz', exact: true }).click();

    await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');
    await expect(page.getByText('Kod pocztowy musi mieć format 00-000', { exact: true })).toBeVisible();
    // Błąd dotyczy właśnie pola Kod pocztowy
    await expect(page.getByLabel('Kod pocztowy')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Zapisano adres dostawy.')).not.toBeVisible();

    // Po błędzie pole nadal pokazuje 31001, więc otwieramy stronę jeszcze raz,
    // żeby zobaczyć, co naprawdę jest zapisane na koncie
    await page.getByRole('link', { name: 'Adres dostawy' }).click();
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Przykładowa 12/3');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('00-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Warszawa');
    await expect(page.getByLabel('Telefon')).toHaveValue('500 100 200');
  });

  test('telefon 12345 blokuje zapis adresu', async ({ page }) => {
    await page.getByLabel('Telefon').fill('12345');
    await page.getByRole('button', { name: 'Zapisz', exact: true }).click();

    await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');
    await expect(page.getByText('Telefon musi mieć 9 cyfr (opcjonalnie z +48)', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Telefon')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Zapisano adres dostawy.')).not.toBeVisible();

    // Adres na koncie się nie zmienił
    await page.getByRole('link', { name: 'Adres dostawy' }).click();
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Przykładowa 12/3');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('00-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Warszawa');
    await expect(page.getByLabel('Telefon')).toHaveValue('500 100 200');
  });

  test('puste miasto blokuje zapis adresu', async ({ page }) => {
    await page.getByLabel('Miasto').fill('');
    await page.getByRole('button', { name: 'Zapisz', exact: true }).click();

    await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');
    await expect(page.getByText('Podaj miasto', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Miasto')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Zapisano adres dostawy.')).not.toBeVisible();

    // Adres na koncie się nie zmienił
    await page.getByRole('link', { name: 'Adres dostawy' }).click();
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Przykładowa 12/3');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('00-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Warszawa');
    await expect(page.getByLabel('Telefon')).toHaveValue('500 100 200');
  });
});
