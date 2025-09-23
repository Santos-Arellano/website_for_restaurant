/**
 * Admin Clientes JavaScript
 * Funciones para la gestión de clientes en el panel de administración
 */

/**
 * Función para abrir modal de agregar cliente
 */
function openAddClienteModal() {
    console.log('openAddClienteModal llamado');
    if (window.universalAdmin) {
        window.universalAdmin.addItem();
    } else if (window.globalModalManager) {
        window.globalModalManager.openClienteModal('add');
    } else {
        alert('Sistema de modales no disponible. Por favor recarga la página.');
    }
}

/**
 * Función para editar un cliente
 * @param {number} id - ID del cliente a editar
 */
function editCliente(id) {
    console.log('editCliente llamado con ID:', id);
    if (window.globalModalManager) {
        window.globalModalManager.openClienteModal('edit', id);
    } else if (window.universalAdmin) {
        window.universalAdmin.editItem(id);
    } else {
        alert('Sistema no disponible. Por favor recarga la página.');
    }
}

/**
 * Función para eliminar un cliente
 * @param {number} id - ID del cliente a eliminar
 */
function deleteCliente(id) {
    console.log('deleteCliente llamado con ID:', id);
    if (window.universalAdmin) {
        window.universalAdmin.deleteItem(id);
    } else {
        alert('Sistema no disponible. Por favor recarga la página.');
    }
}

/**
 * Función para filtrar clientes por texto de búsqueda
 * @param {string} searchTerm - Término de búsqueda
 */
function filterClientes(searchTerm) {
    const tableRows = document.querySelectorAll('.table-row[data-cliente-id]');
    const term = searchTerm.toLowerCase().trim();
    
    tableRows.forEach(row => {
        const nombre = row.querySelector('.cliente-name')?.textContent.toLowerCase() || '';
        const email = row.querySelector('.cliente-email')?.textContent.toLowerCase() || '';
        const phone = row.querySelector('.cliente-phone')?.textContent.toLowerCase() || '';
        
        const matches = nombre.includes(term) || email.includes(term) || phone.includes(term);
        row.style.display = matches ? 'grid' : 'none';
    });
    
    // Mostrar/ocultar empty state
    updateEmptyState();
}

/**
 * Actualiza la visibilidad del estado vacío
 */
function updateEmptyState() {
    const visibleRows = document.querySelectorAll('.table-row[data-cliente-id]:not([style*="display: none"])');
    const emptyState = document.querySelector('.empty-state');
    
    if (emptyState) {
        emptyState.style.display = visibleRows.length === 0 ? 'block' : 'none';
    }
}

/**
 * Inicializa la página de clientes del admin
 */
function initAdminClientesPage() {
    console.log('=== CLIENTE ADMIN DEBUG ===');
    console.log('AdminModalManager disponible:', !!window.AdminModalManager);
    console.log('globalModalManager disponible:', !!window.globalModalManager);
    console.log('universalAdmin disponible:', !!window.universalAdmin);
    
    // Verificar botones
    const editBtns = document.querySelectorAll('.btn-edit');
    const deleteBtns = document.querySelectorAll('.btn-delete');
    const addBtn = document.querySelector('.btn-add-cliente');
    
    console.log('Botones encontrados:');
    console.log('- Editar:', editBtns.length);
    console.log('- Eliminar:', deleteBtns.length);
    console.log('- Agregar:', !!addBtn);
    
    // Verificar funciones globales
    console.log('Funciones globales:');
    console.log('- editCliente:', typeof window.editCliente);
    console.log('- deleteCliente:', typeof window.deleteCliente);
    console.log('- openAddClienteModal:', typeof window.openAddClienteModal);
    
    // Crear modal manager de emergencia si no existe
    if (!window.globalModalManager && window.AdminModalManager) {
        console.log('🔧 Creando modal manager de emergencia...');
        window.globalModalManager = new window.AdminModalManager();
    }
    
    // Configurar event listeners
    setupEventListeners();
    
    // Hacer funciones globales
    window.openAddClienteModal = openAddClienteModal;
    window.editCliente = editCliente;
    window.deleteCliente = deleteCliente;
}

/**
 * Configura los event listeners de la página
 */
function setupEventListeners() {
    // Event listener para búsqueda
    const searchInput = document.getElementById('adminSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterClientes(e.target.value);
        });
    }
    
    // Event listener para botón de agregar cliente
    const addBtn = document.querySelector('.btn-add-cliente');
    if (addBtn) {
        addBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openAddClienteModal();
        });
    }
    
    // Event listeners para botones de acción (editar/eliminar)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-edit') || e.target.closest('.btn-edit')) {
            const button = e.target.classList.contains('btn-edit') ? e.target : e.target.closest('.btn-edit');
            const row = button.closest('.table-row');
            const clienteId = row ? row.dataset.clienteId : null;
            
            if (clienteId) {
                e.preventDefault();
                editCliente(parseInt(clienteId));
            }
        }
        
        if (e.target.classList.contains('btn-delete') || e.target.closest('.btn-delete')) {
            const button = e.target.classList.contains('btn-delete') ? e.target : e.target.closest('.btn-delete');
            const row = button.closest('.table-row');
            const clienteId = row ? row.dataset.clienteId : null;
            
            if (clienteId) {
                e.preventDefault();
                deleteCliente(parseInt(clienteId));
            }
        }
    });
}

/**
 * Actualiza las estadísticas de clientes
 */
function updateClienteStats() {
    const totalRows = document.querySelectorAll('.table-row[data-cliente-id]').length;
    const totalElement = document.querySelector('.stat-card .stat-number');
    
    if (totalElement) {
        totalElement.textContent = totalRows;
    }
}

/**
 * Agrega un nuevo cliente a la tabla (después de crearlo)
 * @param {Object} cliente - Datos del cliente
 */
function addClienteToTable(cliente) {
    const tableContainer = document.querySelector('.clientes-table');
    const emptyState = document.querySelector('.empty-state');
    
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    const newRow = document.createElement('div');
    newRow.className = 'table-row';
    newRow.setAttribute('data-cliente-id', cliente.id);
    
    newRow.innerHTML = `
        <div class="cell">
            <span class="cliente-name">${cliente.nombre}</span>
        </div>
        <div class="cell">
            <span class="cliente-name">${cliente.apellido}</span>
        </div>
        <div class="cell">
            <span class="cliente-email">${cliente.correo}</span>
        </div>
        <div class="cell">
            <span class="cliente-phone">${cliente.telefono || 'No registrado'}</span>
        </div>
        <div class="cell actions-cell">
            <button class="btn-action btn-edit" onclick="editCliente(${cliente.id})">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-action btn-delete" onclick="deleteCliente(${cliente.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    tableContainer.appendChild(newRow);
    updateClienteStats();
}

/**
 * Elimina un cliente de la tabla
 * @param {number} clienteId - ID del cliente a eliminar
 */
function removeClienteFromTable(clienteId) {
    const row = document.querySelector(`[data-cliente-id="${clienteId}"]`);
    if (row) {
        row.remove();
        updateClienteStats();
        updateEmptyState();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initAdminClientesPage();
});

// Exportar funciones para uso externo si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openAddClienteModal,
        editCliente,
        deleteCliente,
        filterClientes,
        initAdminClientesPage,
        addClienteToTable,
        removeClienteFromTable
    };
}