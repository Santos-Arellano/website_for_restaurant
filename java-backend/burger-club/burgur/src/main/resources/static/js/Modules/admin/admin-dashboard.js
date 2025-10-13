/**
 * Admin Dashboard JavaScript Module
 * Funcionalidades específicas para el panel de administración
 */

// Función para actualizar adicionales
async function updateAdicionales() {
    try {
        const response = await fetch('/admin/update-adicionales', {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Éxito: ${result.message}\nAdicionales actualizados: ${result.count}`);
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar adicionales');
    }
}

// Animación de números en las estadísticas
function animateNumbers() {
    const numbers = document.querySelectorAll('.stat-number');
    numbers.forEach(number => {
        const target = parseInt(number.textContent);
        if (isNaN(target)) return;
        
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                number.textContent = target;
                clearInterval(timer);
            } else {
                number.textContent = Math.floor(current);
            }
        }, 30);
    });
}

// Actualizar hora cada minuto
function updateTime() {
    const timeElements = document.querySelectorAll('.activity-time');
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Solo actualizar elementos que muestran "Inicio" o similares
    timeElements.forEach(el => {
        if (el.textContent === 'Inicio') {
            el.textContent = timeStr;
        }
    });
}

// Inicializar funciones del dashboard
function initDashboard() {
    setTimeout(animateNumbers, 500);
    updateTime();
    setInterval(updateTime, 60000); // Actualizar cada minuto
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initDashboard);

// Exportar funciones para uso global
window.updateAdicionales = updateAdicionales;
window.animateNumbers = animateNumbers;
window.updateTime = updateTime;