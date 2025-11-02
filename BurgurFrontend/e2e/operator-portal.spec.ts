import { test, expect } from '@playwright/test';

test.describe('Operador - Pedidos Activos', () => {
  test('debe acceder a /operador/pedidos con sesión en localStorage', async ({ page }) => {
    await page.addInitScript(() => {
      const operador = {
        id: 999,
        nombre: 'Operador E2E',
        cedula: 'e2e',
        disponible: true
      };
      window.localStorage.setItem('currentOperador', JSON.stringify(operador));
    });

    await page.goto('/operador/pedidos');
    await expect(page).toHaveURL(/.*\/operador\/pedidos/);
    await expect(page.getByRole('heading', { name: 'Pedidos Activos' })).toBeVisible();
  });
});