import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Scenariusz P4 z docs/projekt.md, część klienta (bez testu menu administratora).
// Kopia testów 1 i 2 z tests/projekt/p4-brak-uprawnien.spec.ts.
test.describe('P4: brak uprawnień do panelu administratora (klient)', () => {
  test('klient na /admin widzi nagłówek „Brak uprawnień” i tekst „Ta strona wymaga roli admin.”', async ({ page }) => {
    await zaloguj(page);
    await page.goto('/admin');

    // P4: „strona z nagłówkiem Brak uprawnień”
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Brak uprawnień');
    // P4: „i tekstem Ta strona wymaga roli admin.” (dokładnie, z kropką)
    await expect(page.getByText('Ta strona wymaga roli admin.', { exact: true })).toBeVisible();
  });

  test('klient nie ma w menu pozycji „Panel admina”', async ({ page }) => {
    await zaloguj(page);
    const menu = page.getByRole('navigation', { name: 'Menu główne' });

    // Menu się załadowało: widać pozycję klienta „Moje zamówienia”.
    await expect(menu.getByRole('link', { name: 'Moje zamówienia', exact: true })).toBeVisible();
    // P4: „w menu klienta nie ma pozycji Panel admina”
    await expect(menu.getByRole('link', { name: 'Panel admina', exact: true })).toHaveCount(0);
  });
});
