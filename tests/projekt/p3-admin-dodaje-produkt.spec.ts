import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Scenariusz P3 z docs/projekt.md: administrator dodaje produkt.
// Tylko lokalnie (konto admin).
// Bez sprzątania: panel nie ma usuwania produktów, więc każdy przebieg zostawia produkt
// w kategorii „Testowe”. Lokalnie usuwa go npm run db:reset (przy zatrzymanej aplikacji).
test('P3: produkt dodany przez administratora jest w wyszukiwarce za 12,50 zł, dostępny i do kupienia', async ({ page }) => {
  // Unikalna nazwa, żeby test przechodził przy każdym uruchomieniu.
  const nazwa = `Produkt P3 ${Date.now()}`;

  await zaloguj(page, 'admin', 'admin123');
  await page.goto('/admin/produkty');
  await page.getByLabel('Nazwa', { exact: true }).fill(nazwa);
  await page.getByLabel('Kategoria', { exact: true }).fill('Testowe');
  await page.getByLabel('Cena (zł)', { exact: true }).fill('12,50');
  await page.getByLabel('Stan', { exact: true }).fill('5');
  await page.getByRole('button', { name: 'Dodaj produkt' }).click();

  // P3: „komunikat Dodano produkt: <nazwa>” (sprawdzamy od razu, komunikat znika po kilku sekundach)
  await expect(page.getByText(`Dodano produkt: ${nazwa}`, { exact: true })).toBeVisible();

  // P3: „na stronie Produkty wyszukiwarka znajduje ten produkt”
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Szukaj produktu' }).fill(nazwa);
  await page.getByRole('button', { name: 'Filtruj' }).click();
  // Pod tabelą są kafelki z tą samą nazwą, więc sprawdzamy w wierszu tabeli.
  const wiersz = page.getByRole('row').filter({ hasText: nazwa });

  // P3: „z ceną 12,50 zł”
  await expect(wiersz.getByRole('cell', { name: '12,50 zł', exact: true })).toBeVisible();
  // P3: „jako Dostępny”
  await expect(wiersz.getByRole('cell', { name: 'Dostępny', exact: true })).toBeVisible();
  // P3: „z aktywnym przyciskiem Dodaj do koszyka”
  await expect(wiersz.getByRole('button', { name: `Dodaj do koszyka: ${nazwa}` })).toBeEnabled();
});
