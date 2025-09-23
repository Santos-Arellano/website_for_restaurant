/**
 * Admin Adicionales JavaScript
 * Funciones para la gestión de adicionales en el panel de administración
 */

/**
 * Función para abrir modal de agregar adicional
 */
function openAddAdicionalModal() {
    console.log('openAddAdicionalModal llamado');
    if (window.universalAdmin) {
        window.universalAdmin.addItem();
    } else if (window.globalModalManager) {
        window.globalModalManager.openAdicionalModal('add');
    } else {
        alert('Sistema de modales no disponible. Por favor recarga la página.');
    }
}

/**
 * Función para editar un adicional
 * @param {number} id - ID del adicional a editar
 */
function editAdicional(id) {
    console.log('editAdicional llamado con ID:', id);
    if (window.globalModalManager) {
        window.globalModalManager.openAdicionalModal('edit', id);
    } else if (window.universalAdmin) {
        window.universalAdmin.editItem(id);
    } else {
        alert('Sistema no disponible. Por favor recarga la página.');
    }
}

/**
 * Función para eliminar un adicional
 * @param {number} id - ID del adicional a eliminar
 */
function deleteAdicional(id) {
    if (window.universalAdmin) {
        window.universalAdmin.deleteItem(id);
    } else {
        alert('Sistema no disponible. Por favor recarga la página.');
    }
}

/**
 * Función para filtrar adicionales por texto de búsqueda
 * @param {string} searchTerm - Término de búsqueda
 */
function filterAdicionales(searchTerm) {
    const tableRows = document.querySelectorAll('.table-row[data-adicional-id]');
    const term = searchTerm.toLowerCase().trim();
    
    tableRows.forEach(row => {
        const nombre = row.querySelector('.adicional-name')?.textContent.toLowerCase() || '';
        const categorias = Array.from(row.querySelectorAll('.categoria-badge'))
            .map(badge => badge.textContent.toLowerCase())
            .join(' ');
        
        const matches = nombre.includes(term) || categorias.includes(term);
        row.style.display = matches ? 'grid' : 'none';
    });
    
    // Mostrar/ocultar empty state
    updateEmptyState();
}

/**
 * Actualiza la visibilidad del estado vacío
 */
function updateEmptyState() {
    const visibleRows = document.querySelectorAll('.table-row[data-adicional-id]:not([style*="display: none"])');
    const emptyState = document.querySelector('.empty-state');
    
    if (emptyState) {
        emptyState.style.display = visibleRows.length === 0 ? 'block' : 'none';
    }
}

/**
 * Inicializa la página de adicionales del admin
 */
function initAdminAdicionalesPage() {
    console.log('=== ADICIONALES ADMIN DEBUG ===');
    console.log('AdminModalManager disponible:', !!window.AdminModalManager);
    console.log('globalModalManager disponible:', !!window.globalModalManager);
    console.log('universalAdmin disponible:', !!window.universalAdmin);
    
    // Verificar botones
    const editBtns = document.querySelectorAll('.btn-edit');
    const deleteBtns = document.querySelectorAll('.btn-delete');
    const addBtn = document.querySelector('.btn-add-adicional');
    
    console.log('Botones encontrados:');
    console.log('- Editar:', editBtns.length);
    console.log('- Eliminar:', deleteBtns.length);
    console.log('- Agregar:', !!addBtn);
    
    // Verificar funciones globales
    console.log('Funciones globales:');
    console.log('- editAdicional:', typeof window.editAdicional);
    console.log('- deleteAdicional:', typeof window.deleteAdicional);
    console.log('- openAddAdicionalModal:', typeof window.openAddAdicionalModal);
    
    // Crear modal manager de emergencia si no existe
    if (!window.globalModalManager && window.AdminModalManager) {
        console.log('🔧 Creando modal manager de emergencia...');
        window.globalModalManager = new window.AdminModalManager();
    }
    
    // Configurar event listeners
    setupEventListeners();
    
    // Hacer funciones globales
    window.openAddAdicionalModal = openAddAdicionalModal;
    window.editAdicional = editAdicional;
    window.deleteAdicional = deleteAdicional;
}

/**
 * Configura los event listeners de la página
 */
function setupEventListeners() {
    // Event listener para búsqueda
    const searchInput = document.getElementById('adminSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterAdicionales(e.target.value);
        });
    }
    
    // Event listener para botón de agregar adicional
    const addBtn = document.querySelector('.btn-add-adicional');
    if (addBtn) {
        addBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openAddAdicionalModal();
        });
    }
    
    // Event listeners para botones de acción (editar/eliminar)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-edit') || e.target.closest('.btn-edit')) {
            const button = e.target.classList.contains('btn-edit') ? e.target : e.target.closest('.btn-edit');
            const row = button.closest('.table-row');
            const adicionalId = row ? row.dataset.adicionalId : null;
            
            if (adicionalId) {
                e.preventDefault();
                editAdicional(parseInt(adicionalId));
            }
        }
        
        if (e.target.classList.contains('btn-delete') || e.target.closest('.btn-delete')) {
            const button = e.target.classList.contains('btn-delete') ? e.target : e.target.closest('.btn-delete');
            const row = button.closest('.table-row');
            const adicionalId = row ? row.dataset.adicionalId : null;
            
            if (adicionalId) {
                e.preventDefault();
                deleteAdicional(parseInt(adicionalId));
            }
        }
    });
}

/**
 * Actualiza las estadísticas de adicionales
 */
function updateAdicionalStats() {
    const totalRows = document.querySelectorAll('.table-row[data-adicional-id]').length;
    const totalElement = document.querySelector('.stat-card .stat-number');
    
    if (totalElement) {
        totalElement.textContent = totalRows;
    }
}

/**
 * Agrega un nuevo adicional a la tabla (después de crearlo)
 * @param {Object} adicional - Datos del adicional
 */
function addAdicionalToTable(adicional) {
    const tableContainer = document.querySelector('.adicionales-table');
    const emptyState = document.querySelector('.empty-state');
    
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    const newRow = document.createElement('div');
    newRow.className = 'table-row';
    newRow.setAttribute('data-adicional-id', adicional.id);
    
    // Crear badges de categorías
    const categoriaBadges = adicional.categoria.map(cat => 
        `<span class="categoria-badge">${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>`
    ).join('');
    
    newRow.innerHTML = `
        <div class="cell">
            <span class="adicional-name">${adicional.nombre}</span>
        </div>
        <div class="cell">
            <span class="adicional-price">$${adicional.precio.toLocaleString()}</span>
        </div>
        <div class="cell">
            <div class="categoria-badges">
                ${categoriaBadges}
            </div>
        </div>
        <div class="cell actions-cell">
            <button class="btn-action btn-edit" onclick="editAdicional(${adicional.id})">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn-action btn-delete" onclick="deleteAdicional(${adicional.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    tableContainer.appendChild(newRow);
    updateAdicionalStats();
}

/**
 * Elimina un adicional de la tabla
 * @param {number} adicionalId - ID del adicional a eliminar
 */
function removeAdicionalFromTable(adicionalId) {
    const row = document.querySelector(`[data-adicional-id="${adicionalId}"]`);
    if (row) {
        row.remove();
        updateAdicionalStats();
        updateEmptyState();
    }
}

/**
 * Actualiza un adicional en la tabla
 * @param {Object} adicional - Datos actualizados del adicional
 */
function updateAdicionalInTable(adicional) {
    const row = document.querySelector(`[data-adicional-id="${adicional.id}"]`);
    if (row) {
        const nameElement = row.querySelector('.adicional-name');
        const priceElement = row.querySelector('.adicional-price');
        const badgesContainer = row.querySelector('.categoria-badges');
        
        if (nameElement) {
            nameElement.textContent = adicional.nombre;
        }
        
        if (priceElement) {
            priceElement.textContent = `$${adicional.precio.toLocaleString()}`;
        }
        
        if (badgesContainer) {
            const categoriaBadges = adicional.categoria.map(cat => 
                `<span class="categoria-badge">${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>`
            ).join('');
            badgesContainer.innerHTML = categoriaBadges;
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initAdminAdicionalesPage();
});

// Exportar funciones para uso externo si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openAddAdicionalModal,
        editAdicional,
        deleteAdicional,
        filterAdicionales,
        initAdminAdicionalesPage,
        addAdicionalToTable,
        removeAdicionalFromTable,
        updateAdicionalInTable
    };
}