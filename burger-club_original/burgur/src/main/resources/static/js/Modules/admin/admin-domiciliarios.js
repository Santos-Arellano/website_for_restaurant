/**
 * Administración de Domiciliarios
 * Script para gestionar la interfaz de administración de domiciliarios
 */

// Variables globales
let domiciliarios = [];
let domiciliarioIdToDelete = null;

// Elementos DOM
const btnNuevoDomiciliario = document.getElementById('btnNuevoDomiciliario');
const btnRefrescar = document.getElementById('btnRefrescar');
const domiciliarioModal = document.getElementById('domiciliarioModal');
const confirmModal = document.getElementById('confirmModal');
const domiciliarioForm = document.getElementById('domiciliarioForm');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.querySelector('.close-modal');
const btnCancelar = document.getElementById('btnCancelar');
const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Cargar domiciliarios al iniciar
    cargarDomiciliarios();
    
    // Event Listeners
    btnNuevoDomiciliario.addEventListener('click', abrirModalNuevo);
    btnRefrescar.addEventListener('click', cargarDomiciliarios);
    closeModal.addEventListener('click', cerrarModal);
    btnCancelar.addEventListener('click', cerrarModal);
    btnCancelarEliminar.addEventListener('click', cerrarModalConfirmacion);
    btnConfirmarEliminar.addEventListener('click', eliminarDomiciliario);
    domiciliarioForm.addEventListener('submit', guardarDomiciliario);
    
    // Delegación de eventos para botones de acción en la tabla
    document.querySelector('.admin-table tbody').addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        
        const id = target.getAttribute('data-id');
        
        if (target.classList.contains('btn-edit')) {
            editarDomiciliario(id);
        } else if (target.classList.contains('btn-delete')) {
            confirmarEliminar(id);
        } else if (target.classList.contains('btn-toggle-status')) {
            const disponible = target.getAttribute('data-disponible') === 'true';
            cambiarEstado(id, !disponible);
        }
    });
});

// Funciones API
async function cargarDomiciliarios() {
    try {
        mostrarCargando();
        const response = await fetch('/api/domiciliarios');
        
        if (!response.ok) {
            throw new Error('Error al cargar domiciliarios');
        }
        
        domiciliarios = await response.json();
        renderizarTablaDomiciliarios();
        ocultarCargando();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('No se pudieron cargar los domiciliarios');
        ocultarCargando();
    }
}

async function guardarDomiciliario(e) {
    e.preventDefault();
    
    const id = document.getElementById('domiciliarioId').value;
    const nombre = document.getElementById('nombre').value;
    const cedula = document.getElementById('cedula').value;
    const disponible = document.getElementById('disponible').value === 'true';
    
    const domiciliarioData = {
        nombre,
        cedula,
        disponible
    };
    
    try {
        mostrarCargando();
        let response;
        
        if (id) {
            // Actualizar existente
            response = await fetch(`/api/domiciliarios/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(domiciliarioData)
            });
        } else {
            // Crear nuevo
            response = await fetch('/api/domiciliarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(domiciliarioData)
            });
        }
        
        if (!response.ok) {
            throw new Error('Error al guardar domiciliario');
        }
        
        cerrarModal();
        await cargarDomiciliarios();
        mostrarMensaje(id ? 'Domiciliario actualizado correctamente' : 'Domiciliario creado correctamente');
    } catch (error) {
        console.error('Error:', error);
        mostrarError('No se pudo guardar el domiciliario');
    } finally {
        ocultarCargando();
    }
}

async function eliminarDomiciliario() {
    if (!domiciliarioIdToDelete) return;
    
    try {
        mostrarCargando();
        const response = await fetch(`/api/domiciliarios/${domiciliarioIdToDelete}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar domiciliario');
        }
        
        cerrarModalConfirmacion();
        await cargarDomiciliarios();
        mostrarMensaje('Domiciliario eliminado correctamente');
    } catch (error) {
        console.error('Error:', error);
        mostrarError('No se pudo eliminar el domiciliario');
    } finally {
        ocultarCargando();
    }
}

async function cambiarEstado(id, nuevoEstado) {
    const domiciliario = domiciliarios.find(d => d.id == id);
    if (!domiciliario) return;
    
    try {
        mostrarCargando();
        const response = await fetch(`/api/domiciliarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: domiciliario.nombre,
                cedula: domiciliario.cedula,
                disponible: nuevoEstado
            })
        });
        
        if (!response.ok) {
            throw new Error('Error al cambiar estado del domiciliario');
        }
        
        await cargarDomiciliarios();
        mostrarMensaje(`Domiciliario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
    } catch (error) {
        console.error('Error:', error);
        mostrarError('No se pudo cambiar el estado del domiciliario');
    } finally {
        ocultarCargando();
    }
}

// Funciones UI
function renderizarTablaDomiciliarios() {
    const tbody = document.querySelector('.admin-table tbody');
    if (!tbody) return;
    
    if (domiciliarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-table">No hay domiciliarios registrados</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = domiciliarios.map(domiciliario => `
        <tr>
            <td>${domiciliario.id}</td>
            <td>${domiciliario.nombre}</td>
            <td>${domiciliario.cedula}</td>
            <td>
                <span class="status-badge ${domiciliario.disponible ? 'available' : 'unavailable'}">
                    ${domiciliario.disponible ? 'Disponible' : 'No Disponible'}
                </span>
            </td>
            <td class="actions-cell">
                <button class="btn-edit" data-id="${domiciliario.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" data-id="${domiciliario.id}">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn-toggle-status" data-id="${domiciliario.id}" data-disponible="${domiciliario.disponible}">
                    <i class="fas fa-exchange-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Actualizar contadores en la interfaz
    actualizarContadores();
}

function actualizarContadores() {
    const totalElement = document.querySelector('.stat-card:first-child .stat-number');
    const disponiblesElement = document.querySelector('.stat-card:last-child .stat-number');
    
    if (totalElement) {
        totalElement.textContent = domiciliarios.length;
    }
    
    if (disponiblesElement) {
        disponiblesElement.textContent = domiciliarios.filter(d => d.disponible).length;
    }
}

function abrirModalNuevo() {
    modalTitle.textContent = 'Nuevo Domiciliario';
    document.getElementById('domiciliarioId').value = '';
    domiciliarioForm.reset();
    document.getElementById('disponible').value = 'true';
    domiciliarioModal.style.display = 'block';
}

function editarDomiciliario(id) {
    console.log('editarDomiciliario llamado con ID:', id);
    
    // Usar el modal manager global si está disponible
    if (window.globalModalManager && window.globalModalManager.openDomiciliarioModal) {
        window.globalModalManager.openDomiciliarioModal('edit', id);
        return;
    }
    
    // Fallback al método original
    const domiciliario = domiciliarios.find(d => d.id == id);
    if (!domiciliario) {
        console.error('Domiciliario no encontrado:', id);
        return;
    }
    
    modalTitle.textContent = 'Editar Domiciliario';
    document.getElementById('domiciliarioId').value = domiciliario.id;
    document.getElementById('nombre').value = domiciliario.nombre;
    document.getElementById('cedula').value = domiciliario.cedula;
    document.getElementById('disponible').value = domiciliario.disponible.toString();
    
    domiciliarioModal.style.display = 'block';
}

function confirmarEliminar(id) {
    domiciliarioIdToDelete = id;
    confirmModal.style.display = 'block';
}

function cerrarModal() {
    domiciliarioModal.style.display = 'none';
    domiciliarioForm.reset();
}

function cerrarModalConfirmacion() {
    confirmModal.style.display = 'none';
    domiciliarioIdToDelete = null;
}

// Funciones de utilidad
function mostrarCargando() {
    // Implementar indicador de carga si es necesario
    document.body.style.cursor = 'wait';
}

function ocultarCargando() {
    document.body.style.cursor = 'default';
}

function mostrarMensaje(mensaje) {
    alert(mensaje); // Reemplazar con una implementación más elegante si es necesario
}

function mostrarError(mensaje) {
    alert('Error: ' + mensaje); // Reemplazar con una implementación más elegante si es necesario
}