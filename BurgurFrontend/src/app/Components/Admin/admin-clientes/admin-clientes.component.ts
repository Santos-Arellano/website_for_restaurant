import { Component, OnInit } from '@angular/core';
import { ClienteService } from '../../../Service/Cliente/cliente.service';
import { Cliente } from '../../../Model/Cliente/cliente';

@Component({
  selector: 'app-admin-clientes',
  templateUrl: './admin-clientes.component.html',
  styleUrls: ['./admin-clientes.component.css']
})
export class AdminClientesComponent implements OnInit {
  // Propiedades para datos
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  
  // Propiedades para estadísticas
  totalClientes: number = 0;
  clientesActivos: number = 0;
  
  // Propiedades para filtros y búsqueda
  filtroTexto: string = '';
  
  // Propiedades para modal
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  clienteSeleccionado: Cliente = this.crearClienteVacio();
  
  // Propiedades para UI
  cargando: boolean = false;

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  // Métodos para cargar datos
  cargarClientes(): void {
    this.cargando = true;
    this.clienteService.getAllClientes().subscribe({
      next: (clientes: Cliente[]) => {
        this.clientes = clientes;
        this.clientesFiltrados = [...clientes];
        this.calcularEstadisticas();
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al cargar clientes:', error);
        this.cargando = false;
      }
    });
  }

  calcularEstadisticas(): void {
    this.totalClientes = this.clientes.length;
    this.clientesActivos = this.clientes.filter(cliente => cliente.activo).length;
  }

  // Métodos para filtros y búsqueda
  filtrarClientes(): void {
    if (!this.filtroTexto.trim()) {
      this.clientesFiltrados = [...this.clientes];
    } else {
      const filtro = this.filtroTexto.toLowerCase();
      this.clientesFiltrados = this.clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(filtro) ||
        cliente.apellido.toLowerCase().includes(filtro) ||
        cliente.correo.toLowerCase().includes(filtro) ||
        (cliente.telefono && cliente.telefono.includes(filtro))
      );
    }
  }

  // Métodos para modal
  abrirModalAgregarCliente(): void {
    this.modoEdicion = false;
    this.clienteSeleccionado = this.crearClienteVacio();
    this.mostrarModal = true;
  }

  editarCliente(cliente: Cliente): void {
    this.modoEdicion = true;
    this.clienteSeleccionado = { ...cliente };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.clienteSeleccionado = this.crearClienteVacio();
  }

  // Métodos CRUD
  guardarCliente(): void {
    if (this.modoEdicion) {
      this.actualizarCliente();
    } else {
      this.agregarCliente();
    }
  }

  agregarCliente(): void {
    this.cargando = true;
    
    const clienteData = {
      nombre: this.clienteSeleccionado.nombre,
      apellido: this.clienteSeleccionado.apellido,
      correo: this.clienteSeleccionado.correo,
      contrasena: 'temporal123', // Contraseña temporal para admin
      telefono: this.clienteSeleccionado.telefono,
      direccion: this.clienteSeleccionado.direccion
    };

    this.clienteService.registrarCliente(clienteData).subscribe({
      next: (nuevoCliente) => {
        this.cargarClientes(); // Recargar la lista desde el servicio
        this.cerrarModal();
        this.cargando = false;
        console.log('Cliente agregado:', nuevoCliente);
      },
      error: (error) => {
        console.error('Error al agregar cliente:', error);
        alert('Error al agregar cliente: ' + error);
        this.cargando = false;
      }
    });
  }

  actualizarCliente(): void {
    this.cargando = true;
    
    this.clienteService.updateCliente(this.clienteSeleccionado.id, this.clienteSeleccionado).subscribe({
      next: (clienteActualizado) => {
        this.cargarClientes(); // Recargar la lista desde el servicio
        this.cerrarModal();
        this.cargando = false;
        console.log('Cliente actualizado:', clienteActualizado);
      },
      error: (error) => {
        console.error('Error al actualizar cliente:', error);
        alert('Error al actualizar cliente: ' + error);
        this.cargando = false;
      }
    });
  }

  eliminarCliente(clienteId: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      this.cargando = true;
      
      this.clienteService.deleteCliente(clienteId).subscribe({
        next: (res) => {
          this.cargarClientes();
          this.cargando = false;
          console.log('Cliente eliminado:', res);
        },
        error: (error) => {
          console.error('Error al eliminar cliente:', error);
          alert('Error al eliminar cliente: ' + (error?.message || error));
          this.cargando = false;
        }
      });
    }
  }

  // Métodos auxiliares
  private crearClienteVacio(): Cliente {
    return {
      id: 0,
      nombre: '',
      apellido: '',
      correo: '',
      telefono: '',
      direccion: '',
      fechaRegistro: new Date(),
      activo: true,
      pedidos: []
    };
  }
}
