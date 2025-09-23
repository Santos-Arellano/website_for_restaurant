import { Component, OnInit, OnDestroy, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Services
import { AdminService, Product, Adicional, Cliente, Domiciliario } from '../../services/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';

// Interfaces
interface ModalConfig {
  title: string;
  mode: 'add' | 'edit';
  section: 'productos' | 'adicionales' | 'clientes' | 'domiciliarios';
  data?: any;
}

@Component({
  selector: 'app-admin-modal-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="admin-modal" [class.active]="isVisible" *ngIf="isVisible">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>
            <i class="fas fa-{{ config.mode === 'edit' ? 'edit' : 'plus' }}"></i>
            {{ config.title }}
          </h3>
          <button class="modal-close" type="button" (click)="closeModal()">&times;</button>
        </div>

        <div class="modal-body">
          <form [formGroup]="modalForm" (ngSubmit)="onSubmit()" class="admin-form">
            
            <!-- Product Form -->
            <ng-container *ngIf="config.section === 'productos'">
              <div class="form-row">
                <div class="form-group">
                  <label for="productName">Nombre del Producto *</label>
                  <input
                    type="text"
                    id="productName"
                    formControlName="nombre"
                    placeholder="Ej: Hamburguesa Classic"
                    [class.error]="isFieldInvalid('nombre')"
                  >
                  <div class="field-error" *ngIf="isFieldInvalid('nombre')">
                    El nombre del producto es requerido
                  </div>
                </div>
                <div class="form-group">
                  <label for="productCategory">Categoría *</label>
                  <select
                    id="productCategory"
                    formControlName="categoria"
                    [class.error]="isFieldInvalid('categoria')"
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="hamburguesa">Hamburguesa</option>
                    <option value="acompañamiento">Acompañamiento</option>
                    <option value="perro caliente">Perro Caliente</option>
                    <option value="bebida">Bebida</option>
                    <option value="postre">Postre</option>
                  </select>
                  <div class="field-error" *ngIf="isFieldInvalid('categoria')">
                    La categoría es requerida
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="productPrice">Precio *</label>
                  <input
                    type="number"
                    id="productPrice"
                    formControlName="precio"
                    placeholder="0"
                    min="0"
                    step="100"
                    [class.error]="isFieldInvalid('precio')"
                  >
                  <div class="field-error" *ngIf="isFieldInvalid('precio')">
                    El precio debe ser mayor a 0
                  </div>
                </div>
                <div class="form-group">
                  <label for="productImage">URL de Imagen</label>
                  <input
                    type="url"
                    id="productImage"
                    formControlName="imagen"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    [class.error]="isFieldInvalid('imagen')"
                  >
                  <div class="field-error" *ngIf="isFieldInvalid('imagen')">
                    URL de imagen inválida
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="productDescription">Descripción</label>
                <textarea
                  id="productDescription"
                  formControlName="descripcion"
                  placeholder="Descripción del producto..."
                  rows="3"
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group checkbox-group">
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      formControlName="disponible"
                    >
                    <span class="checkmark"></span>
                    Producto disponible
                  </label>
                </div>
                <div class="form-group checkbox-group">
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      formControlName="destacado"
                    >
                    <span class="checkmark"></span>
                    Producto destacado
                  </label>
                </div>
              </div>
            </ng-container>

            <!-- Adicional Form -->
            <ng-container *ngIf="config.section === 'adicionales'">
              <div class="form-row">
                <div class="form-group">
                  <label for="adicionalName">Nombre del Adicional *</label>
                  <input
                    type="text"
                    id="adicionalName"
                    formControlName="nombre"
                    placeholder="Ej: Queso Extra"
                    [class.error]="isFieldInvalid('nombre')"
                  >
                  <div class="field-error" *ngIf="isFieldInvalid('nombre')">
                    El nombre del adicional es requerido
                  </div>
                </div>
                <div class="form-group">
                  <label for="adicionalPrice">Precio *</label>
                  <input
                    type="number"
                    id="adicionalPrice"
                    formControlName="precio"
                    placeholder="0"
                    min="0"
                    step="100"
                    [class.error]="isFieldInvalid('precio')"
                  >
                  <div class="field-error" *ngIf="isFieldInvalid('precio')">
                    El precio debe ser mayor a 0
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="adicionalCategory">Categoría *</label>
                  <select
                    id="adicionalCategory"
                    formControlName="categoria"
                    [class.error]="isFieldInvalid('categoria')"
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="proteina">Proteína</option>
                    <option value="queso">Queso</option>
                    <option value="vegetal">Vegetal</option>
                    <option value="salsa">Salsa</option>
                    <option value="otro">Otro</option>
                  </select>
                  <div class="field-error" *ngIf="isFieldInvalid('categoria')">
                    La categoría es requerida
                  </div>
                </div>
                <div class="form-group checkbox-group">
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      formControlName="disponible"
                    >
                    <span class="checkmark"></span>
                    Adicional disponible
                  </label>
                </div>
              </div>
            </ng-container>

            <!-- Cliente Form -->
            <ng-container *ngIf="config.section === 'clientes'">
              <div class="form-row">
                <div class="form-group">
                  <label for="clienteName">Nombre Completo *</label>
                  <input
                    type="text"
                    id="clienteName"
                    formControlName="nombre"
                    placeholder="Ej: Juan Pérez"
                    [class.error]="isFieldInvalid('nombre')"
                  >
                  <div class="field-error" *ngIf="isFieldInvalid('nombre')">
                    El nombre es requerido
                  </div>
                </div>
                <div class="form-group">
                  <label for="clienteEmail">Email *</label>
                  <input
                    type="email"
                    id="clienteEmail"
                    formControlName="email"
                    placeholder="ejemplo@correo.com"
                    [class.error]="isFieldInvalid('email')"
                  >
                  <div class="field-error" *ngIf="isFieldInvalid('email')">
                    Email inválido
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="clientePhone">Teléfono *</label>
                  <input
                    type="tel"
                    id="clientePhone"
                    formControlName="telefono"
                    placeholder="300 123 4567"
                    [class.error]="isFieldInvalid('telefono')"
                  >
                  <div class="field-error" *ngIf="isFieldInvalid('telefono')">
                    Teléfono inválido
                  </div>
                </div>
                <div class="form-group">
                  <label for="clienteAddress">Dirección</label>
                  <input
                    type="text"
                    id="clienteAddress"
                    formControlName="direccion"
                    placeholder="Calle 123 #45-67"
                  >
                </div>
              </div>
            </ng-container>

            <!-- Domiciliario Form -->
            <ng-container *ngIf="config.section === 'domiciliarios'">
              <div class="form-row">
                <div class="form-group">
                  <label for="domiciliarioName">Nombre Completo *</label>
                  <input
                    type="text"
                    id="domiciliarioName"
                    formControlName="nombre"
                    placeholder="Ej: Carlos Rodríguez"
                    [class.error]="isFieldInvalid('nombre')"
                  >
                  <div class="field-error" *ngIf="isFieldInvalid('nombre')">
                    El nombre es requerido
                  </div>
                </div>
                <div class="form-group">
                  <label for="domiciliarioPhone">Teléfono *</label>
                  <input
                    type="tel"
                    id="domiciliarioPhone"
                    formControlName="telefono"
                    placeholder="300 123 4567"
                    [class.error]="isFieldInvalid('telefono')"
                  >
                  <div class="field-error" *ngIf="isFieldInvalid('telefono')">
                    Teléfono inválido
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="domiciliarioVehicle">Vehículo *</label>
                  <select
                    id="domiciliarioVehicle"
                    formControlName="vehiculo"
                    [class.error]="isFieldInvalid('vehiculo')"
                  >
                    <option value="">Seleccionar vehículo</option>
                    <option value="moto">Motocicleta</option>
                    <option value="bicicleta">Bicicleta</option>
                    <option value="carro">Automóvil</option>
                    <option value="pie">A pie</option>
                  </select>
                  <div class="field-error" *ngIf="isFieldInvalid('vehiculo')">
                    El vehículo es requerido
                  </div>
                </div>
                <div class="form-group">
                  <label for="domiciliarioZone">Zona de Cobertura</label>
                  <input
                    type="text"
                    id="domiciliarioZone"
                    formControlName="zona"
                    placeholder="Ej: Centro, Norte"
                  >
                </div>
              </div>

              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    formControlName="activo"
                  >
                  <span class="checkmark"></span>
                  Domiciliario activo
                </label>
              </div>
            </ng-container>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="button" class="btn btn-cancel" (click)="closeModal()">
                <i class="fas fa-times"></i>
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="modalForm.invalid || isSubmitting"
              >
                <i class="fas fa-{{ isSubmitting ? 'spinner fa-spin' : (config.mode === 'edit' ? 'save' : 'plus') }}"></i>
                {{ isSubmitting ? 'Guardando...' : (config.mode === 'edit' ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div class="loading-overlay" *ngIf="isLoading">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>{{ loadingMessage }}</p>
      </div>
    </div>
  `,
  styles: [`
    .admin-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }

    .admin-modal.active {
      opacity: 1;
      visibility: visible;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      transform: scale(0.9);
      transition: transform 0.3s ease;
    }

    .admin-modal.active .modal-content {
      transform: scale(1);
    }

    .modal-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--primary-color, #12372a);
      color: white;
      border-radius: 12px 12px 0 0;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .modal-close {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: background 0.3s ease;
    }

    .modal-close:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .modal-body {
      padding: 2rem;
    }

    .admin-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.75rem;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--primary-color, #12372a);
      box-shadow: 0 0 0 3px rgba(18, 55, 42, 0.1);
    }

    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
      border-color: #f44336;
      box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
    }

    .field-error {
      color: #f44336;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    .checkbox-group {
      flex-direction: row;
      align-items: center;
      gap: 0.75rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-weight: 500;
    }

    .checkbox-label input[type="checkbox"] {
      width: auto;
      margin: 0;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid #e0e0e0;
      margin-top: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      text-decoration: none;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-cancel {
      background: #6c757d;
      color: white;
    }

    .btn-cancel:hover:not(:disabled) {
      background: #5a6268;
    }

    .btn-primary {
      background: var(--primary-color, #12372a);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--primary-dark, #0d2a1f);
      transform: translateY(-1px);
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }

    .loading-spinner {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .loading-spinner i {
      font-size: 2rem;
      color: var(--primary-color, #12372a);
      margin-bottom: 1rem;
    }

    .loading-spinner p {
      margin: 0;
      color: #666;
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .modal-content {
        width: 95%;
        margin: 1rem;
      }

      .modal-header,
      .modal-body {
        padding: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class AdminModalManagerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private notificationService = inject(NotificationService);

  @Input() config: ModalConfig = {
    title: '',
    mode: 'add',
    section: 'productos'
  };

  @Output() modalClosed = new EventEmitter<void>();
  @Output() itemSaved = new EventEmitter<any>();

  isVisible = false;
  isLoading = false;
  isSubmitting = false;
  loadingMessage = 'Procesando...';
  modalForm: FormGroup = this.fb.group({});

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.modalForm = this.createFormForSection(this.config.section);
    
    if (this.config.mode === 'edit' && this.config.data) {
      this.modalForm.patchValue(this.config.data);
    }
  }

  private createFormForSection(section: string): FormGroup {
    switch (section) {
      case 'productos':
        return this.fb.group({
          nombre: ['', [Validators.required, Validators.minLength(2)]],
          categoria: ['', Validators.required],
          precio: [0, [Validators.required, Validators.min(1)]],
          descripcion: [''],
          imagen: ['', this.urlValidator],
          disponible: [true],
          destacado: [false]
        });

      case 'adicionales':
        return this.fb.group({
          nombre: ['', [Validators.required, Validators.minLength(2)]],
          precio: [0, [Validators.required, Validators.min(1)]],
          categoria: ['', Validators.required],
          disponible: [true]
        });

      case 'clientes':
        return this.fb.group({
          nombre: ['', [Validators.required, Validators.minLength(2)]],
          email: ['', [Validators.required, Validators.email]],
          telefono: ['', [Validators.required, this.phoneValidator]],
          direccion: ['']
        });

      case 'domiciliarios':
        return this.fb.group({
          nombre: ['', [Validators.required, Validators.minLength(2)]],
          telefono: ['', [Validators.required, this.phoneValidator]],
          vehiculo: ['', Validators.required],
          zona: [''],
          activo: [true]
        });

      default:
        return this.fb.group({});
    }
  }

  private urlValidator(control: any) {
    if (!control.value) return null;
    try {
      new URL(control.value);
      return null;
    } catch {
      return { invalidUrl: true };
    }
  }

  private phoneValidator(control: any) {
    if (!control.value) return null;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(control.value.replace(/\s/g, '')) ? null : { invalidPhone: true };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.modalForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  showModal(config: ModalConfig): void {
    this.config = config;
    this.initializeForm();
    this.isVisible = true;
    
    // Focus first input after animation
    setTimeout(() => {
      const firstInput = document.querySelector('.admin-modal input') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 300);
  }

  closeModal(): void {
    this.isVisible = false;
    this.modalForm.reset();
    this.modalClosed.emit();
  }

  async onSubmit(): Promise<void> {
    if (this.modalForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.modalForm.value;

    try {
      let result;
      
      if (this.config.mode === 'edit') {
        result = await this.adminService.updateItem(
          this.config.data.id,
          formData,
          this.config.section
        ).toPromise();
        this.notificationService.show('Elemento actualizado correctamente', 'success');
      } else {
        result = await this.adminService.createItem(
          formData,
          this.config.section
        ).toPromise();
        this.notificationService.show('Elemento creado correctamente', 'success');
      }

      this.itemSaved.emit(result);
      this.closeModal();

    } catch (error) {
      console.error('Error saving item:', error);
      this.notificationService.show('Error al guardar el elemento', 'danger');
    } finally {
      this.isSubmitting = false;
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.modalForm.controls).forEach(key => {
      this.modalForm.get(key)?.markAsTouched();
    });
  }

  showLoading(show: boolean, message = 'Procesando...'): void {
    this.isLoading = show;
    this.loadingMessage = message;
  }
}