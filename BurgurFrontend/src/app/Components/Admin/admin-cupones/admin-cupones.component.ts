import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CuponService } from '../../../Service/Cupon/cupon.service';
import { Cupon, CuponCreate } from '../../../Model/Cupon/cupon';
import { ToastService } from '../../Shared/toast/toast.service';

@Component({
  selector: 'app-admin-cupones',
  templateUrl: './admin-cupones.component.html',
  styleUrls: ['./admin-cupones.component.css']
})
export class AdminCuponesComponent implements OnInit, OnDestroy {
  cupones: Cupon[] = [];
  isLoading: boolean = false;
  searchTerm: string = '';
  showAddForm: boolean = false;
  showEditId: number | null = null;
  private subs = new Subscription();

  nuevoCupon: CuponCreate = {
    codigo: '',
    tipo: 'PERCENT',
    valor: 10,
    descripcion: '',
    activo: true
  };

  constructor(private cuponService: CuponService, private toast: ToastService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.subs.add(
      this.cuponService.listar().subscribe({
        next: (items) => {
          this.cupones = items;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      })
    );
    this.subs.add(
      this.cuponService.cupones$.subscribe((items) => {
        this.cupones = items;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get filtered(): Cupon[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.cupones;
    return this.cupones.filter((c) =>
      c.codigo.toLowerCase().includes(term) ||
      (c.descripcion || '').toLowerCase().includes(term) ||
      (c.tipo || '').toLowerCase().includes(term)
    );
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
  }

  crear(): void {
    const payload: CuponCreate = {
      codigo: (this.nuevoCupon.codigo || '').trim().toUpperCase(),
      tipo: this.nuevoCupon.tipo,
      valor: this.nuevoCupon.valor ?? 0,
      descripcion: this.nuevoCupon.descripcion || '',
      activo: !!this.nuevoCupon.activo
    };
    if (!payload.codigo) {
      this.toast.show('Debe ingresar un código de cupón', 'warning');
      return;
    }
    if (!payload.tipo) {
      this.toast.show('Debe seleccionar un tipo', 'warning');
      return;
    }
    this.cuponService.crear(payload).subscribe({
      next: () => {
        this.toast.show('Cupón creado', 'success');
        this.nuevoCupon = { codigo: '', tipo: 'PERCENT', valor: 10, descripcion: '', activo: true };
        this.showAddForm = false;
      },
      error: () => this.toast.show('Error al crear cupón', 'error')
    });
  }

  editar(c: Cupon): void {
    this.showEditId = c.id;
  }

  guardar(c: Cupon): void {
    const payload = {
      codigo: (c.codigo || '').trim().toUpperCase(),
      tipo: c.tipo,
      valor: c.valor ?? 0,
      descripcion: c.descripcion || '',
      activo: !!c.activo
    };
    this.cuponService.actualizar(c.id, payload).subscribe({
      next: () => {
        this.toast.show('Cupón actualizado', 'success');
        this.showEditId = null;
      },
      error: () => this.toast.show('Error al actualizar cupón', 'error')
    });
  }

  cancelarEdicion(): void {
    this.showEditId = null;
    // recargar listado por si hubo cambios locales no guardados
    this.cuponService.listar().subscribe();
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este cupón?')) return;
    this.cuponService.eliminar(id).subscribe({
      next: (ok) => {
        if (ok) this.toast.show('Cupón eliminado', 'success');
        else this.toast.show('No se pudo eliminar el cupón', 'error');
      },
      error: () => this.toast.show('Error al eliminar cupón', 'error')
    });
  }
}