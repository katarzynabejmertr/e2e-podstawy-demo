import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Scenariusz P4 z docs/projekt.md: klient nie wejdzie do panelu administratora.
// Uruchamiamy tylko lokalnie, bo test administratora potrzebuje konta admin.

// Jedna nazwa pozycji menu dla obu testów. Test administratora sprawdza, że link
// o tej nazwie istnieje. Gdyby nazwa była zła (literówka), padnie test administratora,
// a nie przejdzie po cichu sprawdzenie „brak w menu” w teście klienta.
const PANEL_ADMINA = 'Panel admina';

test.describe('P4: dostęp do panelu administratora', () => {
  test('klient na /admin widzi „Brak uprawnień” i nie ma w menu „Panel admina”', async ({ page }) => {
    // Konto klienta z .env (bez parametrów).
    await zaloguj(page);
    await page.goto('/admin');

    // P4: „strona z nagłówkiem Brak uprawnień”
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Brak uprawnień');
    // P4: „i tekstem Ta strona wymaga roli admin.”
    await expect(page.getByText('Ta strona wymaga roli admin.', { exact: true })).toBeVisible();

    // P4: „w menu klienta nie ma pozycji Panel admina”
    const menu = page.getByRole('navigation', { name: 'Menu główne' });
    await expect(menu.getByRole('link', { name: PANEL_ADMINA, exact: true })).toHaveCount(0);
  });

  test('administrator ma w menu pozycję „Panel admina”', async ({ page }) => {
    await zaloguj(page, 'admin', 'admin123');

    // P4: „a w menu administratora jest” (ta sama nazwa co w teście klienta)
    const menu = page.getByRole('navigation', { name: 'Menu główne' });
    await expect(menu.getByRole('link', { name: PANEL_ADMINA, exact: true })).toBeVisible();
  });
});
