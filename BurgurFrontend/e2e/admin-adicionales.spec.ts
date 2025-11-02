import { test, expect } from '@playwright/test';

test.describe('Admin - Agregar Adicional', () => {
  test('debe abrir modal y crear un adicional', async ({ page }) => {
    // Simular sesión admin en localStorage para pasar el AdminGuard
    await page.addInitScript(() => {
      const admin = {
        id: 0,
        nombre: 'Admin',
        apellido: 'BurgerClub',
        correo: 'admin@burgerclub.com',
        telefono: '3000000000',
        direccion: 'Oficina Central',
        fechaRegistro: new Date('2024-01-01'),
        activo: true,
        pedidos: []
      };
      window.localStorage.setItem('currentUser', JSON.stringify(admin));
    });

    // Ir directamente a la sección de adicionales del admin
    await page.goto('/admin/adicionales');
    await expect(page).toHaveURL(/.*\/admin\/adicionales/);

    // Abrir modal para agregar adicional
    const addBtn = page.locator('button.btn-add-adicional, .btn-add-adicional');
    await addBtn.first().click();

    // Rellenar campos del modal de creación
    const modalForm = page.locator('form.modal-form').first();
    await expect(modalForm).toBeVisible();

    await modalForm.locator('#nombre').fill('Queso Test E2E');
    await modalForm.locator('#precio').fill('2000');

    // Seleccionar una categoría (Hamburguesa)
    const categoriaLabel = modalForm.locator('.categoria-checkboxes label', { hasText: 'Hamburguesa' }).first();
    await categoriaLabel.click();

    // Guardar/Agregar
    await modalForm.getByRole('button', { name: /Agregar/i }).click();

    // Esperar cierre de modal
    await expect(page.locator('.modal-overlay')).toHaveCount(0);

    // Verificar que el adicional aparezca en la lista
    await expect(page.locator('text=Queso Test E2E')).toBeVisible();
  });
});