import { test, expect } from '@playwright/test';

test.describe('Cliente - Add-ons en modal', () => {
  test('selecciona adicionales en modal, verifica en carrito y en órdenes', async ({ page }) => {
    // Simular sesión de cliente en localStorage
    await page.addInitScript(() => {
      // Asegurar carrito limpio al inicio
      window.localStorage.removeItem('carrito');
      const cliente = {
        id: 1,
        nombre: 'Cliente E2E',
        apellido: 'Pruebas',
        correo: 'cliente@e2e.com',
        telefono: '3000000000',
        direccion: 'Calle Falsa 123',
        fechaRegistro: new Date('2024-01-15'),
        activo: true,
        pedidos: []
      };
      window.localStorage.setItem('currentUser', JSON.stringify(cliente));
    });

    // Mock carrito activo dinámico
    let currentActiveCarrito: any = { carritoItems: [], precioTotal: 0, cliente: { id: 1 } };
    await page.route('**/api/carrito/activo/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentActiveCarrito)
      });
    });

    // Mock productos con adicionales
    await page.route('**/api/productos**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 101,
            nombre: 'Hamburguesa E2E',
            descripcion: 'Prueba con adicionales',
            precio: 15000,
            categoria: 'hamburguesa',
            imagen: 'assets/Menu/cheeseburger.png',
            ingredientes: ['carne', 'queso', 'pan'],
            isNew: false,
            isPopular: false,
            activos: true,
            adicionales: [
              { id: 1, nombre: 'Queso Extra', precio: 2000 },
              { id: 2, nombre: 'Tocineta', precio: 3000 }
            ]
          }
        ])
      });
    });

    await page.goto('/menu');

    // Abrir modal de detalles desde la tarjeta
    const overlay = page.locator('.menu-card .card-overlay').first();
    await expect(overlay).toBeVisible();
    await overlay.click();

    // Seleccionar dos adicionales y aumentar cantidad a 2 (inputs ocultos, clic sobre label)
    await page.locator('.adicional-item', { hasText: 'Queso Extra' }).locator('.adicional-checkbox').click();
    await page.locator('.adicional-item', { hasText: 'Tocineta' }).locator('.adicional-checkbox').click();

    const qtyButtons = page.locator('.modal-footer .quantity-controls .quantity-btn');
    await qtyButtons.nth(1).click(); // incrementar a 2

    // Mock agregar al carrito para sesión autenticada con adicionales seleccionados
    await page.route('**/api/carrito/agregar**', async (route) => {
      const unit = 15000 + 2000 + 3000; // base + queso + tocineta
      const body = {
        carritoItems: [
          {
            id: 600,
            producto: { id: 101, nombre: 'Hamburguesa E2E' },
            cantidad: 2,
            precioUnitario: unit,
            adicionalIds: [1,2],
            // Repetir entradas por unidad para contar cantidad de cada adicional
            adicionalesPorProducto: [
              { adicional: { id: 1, nombre: 'Queso Extra', precio: 2000 } },
              { adicional: { id: 1, nombre: 'Queso Extra', precio: 2000 } },
              { adicional: { id: 2, nombre: 'Tocineta', precio: 3000 } },
              { adicional: { id: 2, nombre: 'Tocineta', precio: 3000 } }
            ]
          }
        ],
        precioTotal: unit * 2,
        cliente: { id: 1 }
      };
      currentActiveCarrito = body;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });

    // Click en Agregar al Carrito dentro del modal y esperar la respuesta
    await page.locator('.modal-overlay .modal-footer .add-to-cart-btn').click();
    await page.waitForResponse((resp) => resp.url().includes('/api/carrito/agregar') && resp.request().method() === 'POST');
    await page.waitForFunction(() => {
      const c = window.localStorage.getItem('carrito');
      try { return !!c && Array.isArray(JSON.parse(c)) && JSON.parse(c).length > 0; } catch { return false; }
    });
    const preNavCartLen = await page.evaluate(() => {
      const c = window.localStorage.getItem('carrito');
      try { return c ? JSON.parse(c).length : 0; } catch { return 0; }
    });
    expect(preNavCartLen).toBe(1);

    // Ir al carrito y verificar adicionales y total
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: /Carrito de Compras/i })).toBeVisible();
    const cartItem = page.locator('.cart-item').first();
    await expect(cartItem).toBeVisible();

    // Total esperado con domicilio: 40000 + 3000 = 43000
    await expect(page.locator('.cart-summary .total-row span').last()).toContainText(/43,?000|\$43,?000/i);

    // Mock creación de pedido
    await page.route('**/api/pedidos/crear**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/plain', body: 'Pedido creado exitosamente' });
    });

    // Mock historial de pedidos del cliente
    await page.route('**/api/pedidos/cliente/**', async (route) => {
      const unit = 15000 + 2000 + 3000;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 999,
            estado: 'RECIBIDO',
            carrito: {
              carritoItems: [
                {
                  id: 600,
                  producto: { id: 101, nombre: 'Hamburguesa E2E' },
                  cantidad: 2,
                  precioUnitario: unit,
                  adicionalesPorProducto: [
                    { adicional: { id: 1, nombre: 'Queso Extra', precio: 2000 } },
                    { adicional: { id: 1, nombre: 'Queso Extra', precio: 2000 } },
                    { adicional: { id: 2, nombre: 'Tocineta', precio: 3000 } },
                    { adicional: { id: 2, nombre: 'Tocineta', precio: 3000 } }
                  ]
                }
              ],
              precioTotal: unit * 2,
              cliente: { id: 1 }
            }
          }
        ])
      });
    });

    await page.locator('button.btn-checkout, .btn-checkout').first().click({ force: true });

    // Debe navegar a historial y mostrar el pedido con adicionales
    await expect(page).toHaveURL(/.*\/orders/);
    await expect(page.getByRole('heading', { name: /Historial de Pedidos/i })).toBeVisible();
    await expect(page.locator('.items-list li').first()).toContainText(/2x\s+Hamburguesa E2E/i);
    await expect(page.locator('.adicionales-list')).toContainText(/Queso Extra/i);
    await expect(page.locator('.adicionales-list')).toContainText(/Tocineta/i);
  });
});

test.describe('Cliente - Modal de producto con adicionales', () => {
  test('selecciona adicionales en modal, agrega al carrito y realiza checkout', async ({ page }) => {
    // Simular sesión autenticada y carrito limpio
    await page.addInitScript(() => {
      window.localStorage.removeItem('carrito');
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

    // Mock carrito activo dinámico
    let currentActiveCarrito2: any = { carritoItems: [], precioTotal: 0, cliente: { id: 1 } };
    await page.route('**/api/carrito/activo/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentActiveCarrito2)
      });
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
    const quesoLabel = page.locator('.adicional-item', { hasText: 'Queso Extra' }).locator('.adicional-checkbox');
    const tocinetaLabel = page.locator('.adicional-item', { hasText: 'Tocineta' }).locator('.adicional-checkbox');
    await quesoLabel.click();
    await tocinetaLabel.click();

    // Incrementar cantidad a 2
    await page.locator('.modal-footer .quantity-controls .quantity-btn').last().click();
    await expect(page.locator('.modal-footer .quantity-display')).toHaveText('2');

    // Interceptar agregar al carrito y validar query params
    let agregarUrl: string | null = null;
    await page.route('**/api/carrito/agregar**', async (route) => {
      agregarUrl = route.request().url();
      const body = {
        carritoItems: [
          {
            id: 777,
            producto: { id: 101 },
            cantidad: 2,
            precioUnitario: 15000 + 2000 + 3000, // unit price including ambos adicionales
            adicionalesPorProducto: [
              { adicional: { id: 1, precio: 2000 } },
              { adicional: { id: 1, precio: 2000 } },
              { adicional: { id: 2, precio: 3000 } },
              { adicional: { id: 2, precio: 3000 } }
            ]
          }
        ],
        precioTotal: (15000 + 2000 + 3000) * 2,
        cliente: { id: 1 }
      };
      currentActiveCarrito2 = body;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });

    // Click en Agregar al Carrito dentro del modal y esperar la respuesta
    await page.locator('.modal-overlay .modal-footer .add-to-cart-btn').click();
    await page.waitForResponse((resp) => resp.url().includes('/api/carrito/agregar') && resp.request().method() === 'POST');
    await page.waitForFunction(() => {
      const c = window.localStorage.getItem('carrito');
      try { return !!c && Array.isArray(JSON.parse(c)) && JSON.parse(c).length > 0; } catch { return false; }
    });

    // Validar que la URL incluya cantidad=2 y adicionalesIds con repeticiones
    expect(agregarUrl).toBeTruthy();
    expect(agregarUrl!).toContain('cantidad=2');
    expect(agregarUrl!).toMatch(/adicionalesIds=1,1,2,2|adicionalesIds=2,2,1,1/);

    // Mock creación de pedido
    await page.route('**/api/pedidos/crear**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'text/plain', body: 'Pedido creado exitosamente' });
    });

    // Ir al carrito y verificar item y total
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: /Carrito de Compras/i })).toBeVisible();
    // Re-validar estado del carrito
    const postNavCartLen = await page.evaluate(() => {
      const c = window.localStorage.getItem('carrito');
      try { return c ? JSON.parse(c).length : 0; } catch { return 0; }
    });
    expect(postNavCartLen).toBe(1);
    await expect(page.locator('.cart-container .cart-item')).toHaveCount(1, { timeout: 10000 });
    await expect(page.locator('.cart-container .cart-summary .total-row span').last()).toContainText(/43,?000|\$43,?000/i);

    // Realizar checkout
    await page.locator('button.btn-checkout, .btn-checkout').first().click({ force: true });
    await expect(page).toHaveURL(/.*\/orders/);
    await expect(page.getByRole('heading', { name: /Historial de Pedidos/i })).toBeVisible();
  });
});