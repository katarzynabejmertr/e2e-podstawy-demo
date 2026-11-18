import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Scenariusz P4 z docs/projekt.md: klient nie wejdzie do panelu administratora.
// Klient: zaloguj(page) bez parametrów bierze konto z APP_USER i APP_PASSWORD (plik .env).
// Administrator: login i hasło z APP_ADMIN_USER i APP_ADMIN_PASSWORD (plik .env).
// Uruchamiamy tylko lokalnie: na wspólnym serwerze hasło admin zna tylko trener.
const adminLogin = process.env.APP_ADMIN_USER ?? '';
const adminHaslo = process.env.APP_ADMIN_PASSWORD ?? '';

test.describe('P4: brak uprawnień do panelu administratora', () => {
  test('klient na /admin widzi nagłówek „Brak uprawnień” i tekst „Ta strona wymaga roli admin.”', async ({ page }) => {
    await zaloguj(page);
    await page.goto('/admin');

    // 1. P4: „strona z nagłówkiem Brak uprawnień”
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Brak uprawnień');
    // 2. P4: „i tekstem Ta strona wymaga roli admin.” (dokładnie, z kropką)
    await expect(page.getByText('Ta strona wymaga roli admin.', { exact: true })).toBeVisible();
  });

  test('klient nie ma w menu pozycji „Panel admina”', async ({ page }) => {
    await zaloguj(page);
    const menu = page.getByRole('navigation', { name: 'Menu główne' });

    // 3. Menu się załadowało: widać pozycję klienta „Moje zamówienia”.
    //    Bez tego brak „Panel admina” przeszedłby także na pustej stronie.
    await expect(menu.getByRole('link', { name: 'Moje zamówienia', exact: true })).toBeVisible();
    // 4. P4: „w menu klienta nie ma pozycji Panel admina”
    await expect(menu.getByRole('link', { name: 'Panel admina', exact: true })).toHaveCount(0);
  });

  test('administrator ma w menu pozycję „Panel admina”', async ({ page }) => {
    await zaloguj(page, adminLogin, adminHaslo);
    const menu = page.getByRole('navigation', { name: 'Menu główne' });

    // 5. P4: „a w menu administratora jest”. Ten sam locator co w teście klienta,
    //    więc literówka w nazwie wywróci ten test, zamiast po cichu przejść u klienta.
    await expect(menu.getByRole('link', { name: 'Panel admina', exact: true })).toBeVisible();
  });
});
