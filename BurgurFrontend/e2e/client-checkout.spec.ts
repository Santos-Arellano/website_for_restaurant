import { test, expect } from '@playwright/test';

test.describe('Cliente - Checkout y Historial de Pedidos', () => {
  test('agrega producto al carrito y realiza checkout', async ({ page }) => {
    // Simular sesión de cliente "Juan" en localStorage
    await page.addInitScript(() => {
      const juan = {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        correo: 'juan@email.com',
        telefono: '3001234567',
        direccion: 'Calle 123 #45-67',
        fechaRegistro: new Date('2024-01-15'),
        activo: true,
        pedidos: []
      };
      window.localStorage.setItem('currentUser', JSON.stringify(juan));
    });

    // Ir al menú y agregar primer producto
    await page.route('**/api/productos**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 101,
            nombre: 'Hamburguesa E2E',
            descripcion: 'Prueba automatizada',
            precio: 15000,
            categoria: 'hamburguesa',
            imgURL: 'assets/Menu/cheeseburger.png',
            activo: true,
            ingredientes: ['carne', 'queso', 'pan'],
            nuevo: false,
            popular: false,
            stock: 10,
            adicionales: []
          }
        ])
      });
    });
    await page.goto('/menu');
    const addButtons = page.locator('button.btn-add-cart, .btn-add-cart');
    await expect(addButtons.first()).toBeVisible();
    // Mock agregar al carrito para sesión autenticada
    await page.route('**/api/carrito/agregar**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          carritoItems: [
            {
              id: 555,
              producto: { id: 101 },
              cantidad: 1,
              precioUnitario: 15000,
              adicionalesPorProducto: []
            }
          ],
          precioTotal: 15000,
          cliente: { id: 1 }
        })
      });
    });
    await addButtons.first().click();

    // Ir al carrito y proceder al pago
    await page.route('**/api/pedidos/crear**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/plain', body: 'Pedido creado exitosamente' });
    });
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: /Carrito de Compras/i })).toBeVisible();
    await expect(page.locator('.cart-item').first()).toBeVisible();
    await page.locator('button.btn-checkout, .btn-checkout').first().click({ force: true });

    // Debe navegar a historial de pedidos
    await expect(page).toHaveURL(/.*\/orders/);
    await expect(page.getByRole('heading', { name: /Historial de Pedidos/i })).toBeVisible();
  });
});