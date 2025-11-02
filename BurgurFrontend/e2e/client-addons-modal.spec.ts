import { test, expect } from '@playwright/test';

test.describe('Cliente - Modal de producto con adicionales', () => {
  test('selecciona adicionales en modal, agrega al carrito y realiza checkout', async ({ page }) => {
    // Simular sesión autenticada
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

    // Mock productos básicos para el menú
    await page.route('**/api/productos**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 101,
            nombre: 'Hamburguesa Modal',
            descripcion: 'Con selección de adicionales en modal',
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

    // Abrir modal desde overlay de la primera tarjeta
    const cardOverlay = page.locator('.menu-card .card-overlay').first();
    await expect(cardOverlay).toBeVisible();
    await cardOverlay.click();

    // Verifica que el modal esté visible
    await expect(page.locator('.modal-overlay .modal-content .modal-title')).toHaveText(/Hamburguesa Modal/i);

    // Seleccionar dos adicionales: Queso Extra y Tocineta
    const quesoCheckbox = page.locator('.adicional-item', { hasText: 'Queso Extra' }).locator('input[type="checkbox"]');
    const tocinetaCheckbox = page.locator('.adicional-item', { hasText: 'Tocineta' }).locator('input[type="checkbox"]');
    await quesoCheckbox.check();
    await tocinetaCheckbox.check();

    // Incrementar cantidad a 2
    await page.locator('.modal-footer .quantity-controls .quantity-btn').last().click();
    await expect(page.locator('.modal-footer .quantity-display')).toHaveText('2');

    // Interceptar agregar al carrito y validar query params
    let agregarUrl: string | null = null;
    await page.route('**/api/carrito/agregar**', async (route) => {
      agregarUrl = route.request().url();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          carritoItems: [
            {
              id: 777,
              producto: { id: 101 },
              cantidad: 2,
              precioUnitario: 15000 + 2000 + 3000, // unit price including ambos adicionales
              adicionalesPorProducto: [
                { adicionalId: 1, cantidad: 2 },
                { adicionalId: 2, cantidad: 2 }
              ]
            }
          ],
          precioTotal: (15000 + 2000 + 3000) * 2,
          cliente: { id: 1 }
        })
      });
    });

    // Click en Agregar al Carrito
    await page.locator('.add-to-cart-btn').click();

    // Validar que la URL incluya cantidad=2 y adicionalesIds con repeticiones
    expect(agregarUrl).toBeTruthy();
    expect(agregarUrl!).toContain('cantidad=2');
    expect(agregarUrl!).toMatch(/adicionalesIds=1,1,2,2|adicionalesIds=2,2,1,1/);

    // Mock creación de pedido
    await page.route('**/api/pedidos/crear**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/plain', body: 'Pedido creado exitosamente' });
    });

    // Ir al carrito y verificar item
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: /Carrito de Compras/i })).toBeVisible();
    await expect(page.locator('.cart-item')).toHaveCount(1);
    // Verificar que haya indicadores de cantidad en adicionales (x2)
    await expect(page.locator('.cart-item .cart-item-extras .extra-qty')).toContainText('x2');

    // Realizar checkout
    await page.locator('button.btn-checkout, .btn-checkout').first().click({ force: true });
    await expect(page).toHaveURL(/.*\/orders/);
    await expect(page.getByRole('heading', { name: /Historial de Pedidos/i })).toBeVisible();
  });
});