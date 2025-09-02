/**
 * Menu Page JavaScript
 * Handles search functionality, product detail modals, authentication status,
 * and user interface enhancements for the menu page.
 */

document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.querySelector('.menu-search-form');
    const searchInput = document.querySelector('.menu-search-input');
    const searchClear = document.querySelector('.search-clear');
    
    // Auto-submit al escribir (con debounce)
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.length >= 2 || this.value.length === 0) {
                    searchForm.submit();
                }
            }, 800);
        });
        
        // Submit al presionar Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                clearTimeout(searchTimeout);
                searchForm.submit();
            }
        });
    }
    
    // Funcionalidad del botón limpiar
    if (searchClear) {
        searchClear.addEventListener('click', function(e) {
            e.preventDefault();
            searchInput.value = '';
            window.location.href = '/menu';
        });
    }

    // Initialize product detail modal
    if (typeof ProductDetailModal !== 'undefined') {
        window.productDetailModal = new ProductDetailModal();
    }
    
    // Enhance existing menu cards with click-to-view-details functionality
    const menuCards = document.querySelectorAll('.menu-card');
    menuCards.forEach((card, index) => {
        // Add click handler for product details
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking the add to cart button directly
            if (e.target.closest('.btn-add-cart')) {
                return;
            }
            
            const productId = card.getAttribute('data-id');
            if (window.productDetailModal && productId) {
                window.productDetailModal.showProductDetail(productId);
            }
        });
        
        // Enhance visual feedback
        card.style.cursor = 'pointer';
        
        // Add hover effect to show overlay
        card.addEventListener('mouseenter', () => {
            const overlay = card.querySelector('.card-overlay');
            if (overlay) {
                overlay.style.opacity = '1';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const overlay = card.querySelector('.card-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
            }
        });
    });
    
    // Quick notification function
    function showQuickNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `quick-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add styles if not exist
        if (!document.getElementById('quick-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'quick-notification-styles';
            style.textContent = `
                .quick-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--bg-color);
                    border: 2px solid;
                    border-radius: 8px;
                    padding: 12px 16px;
                    z-index: 1500;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    font-family: 'Sansita Swashed', cursive;
                    font-size: 14px;
                    min-width: 250px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }
                
                .quick-notification.show {
                    transform: translateX(0);
                }
                
                .quick-notification.success {
                    border-color: #4caf50;
                    color: #4caf50;
                }
                
                .quick-notification.info {
                    border-color: #2196f3;
                    color: #2196f3;
                }
                
                .quick-notification .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .card-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    border-radius: 8px 8px 0 0;
                }
                
                .overlay-content {
                    text-align: center;
                    color: white;
                }
                
                .overlay-text {
                    margin: 0 0 10px 0;
                    font-weight: 600;
                    font-size: 0.9rem;
                }
                
                .overlay-icon {
                    font-size: 1.5rem;
                    color: #fbb5b5;
                }
                
                .auth-cta {
                    margin-top: 40px;
                    padding: 30px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    text-align: center;
                    border: 2px dashed rgba(251, 181, 181, 0.3);
                }
                
                .cta-content h3 {
                    color: #fbb5b5;
                    margin-bottom: 10px;
                    font-family: 'Lexend Zetta', sans-serif;
                }
                
                .cta-content p {
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: 20px;
                }
                
                .cta-buttons {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                
                .btn-cta {
                    padding: 12px 24px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    font-family: 'Sansita Swashed', cursive;
                }
                
                .btn-cta.primary {
                    background: #fbb5b5;
                    color: #12372a;
                }
                
                .btn-cta.secondary {
                    background: transparent;
                    color: #fbb5b5;
                    border: 2px solid #fbb5b5;
                }
                
                .btn-cta:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }
                
                @media (max-width: 480px) {
                    .quick-notification {
                        right: 10px;
                        left: 10px;
                        min-width: auto;
                    }
                    
                    .cta-buttons {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .btn-cta {
                        width: 200px;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 2500);
    }
    
    // Add authentication check for better UX
    checkAuthenticationStatus();
    
    async function checkAuthenticationStatus() {
        try {
            const response = await fetch('/auth/api/current');
            const data = await response.json();
            
            if (data.authenticated) {
                updateHeaderForLoggedInUser(data.cliente);
            } else {
                // Show auth CTA for non-authenticated users
                const authCta = document.getElementById('authCta');
                if (authCta) {
                    authCta.style.display = 'block';
                }
            }
        } catch (error) {
            console.log('Authentication check failed:', error);
            // Show auth CTA on error
            const authCta = document.getElementById('authCta');
            if (authCta) {
                authCta.style.display = 'block';
            }
        }
    }
    
    function updateHeaderForLoggedInUser(cliente) {
        const nav = document.querySelector('.main-nav ul');
        const mobileNav = document.querySelector('.mobile-menu ul');
        
        if (nav && cliente) {
            // Replace login/register links with user menu in desktop nav
            const authLinks = nav.querySelectorAll('.auth-link');
            authLinks.forEach(link => link.parentElement.remove());
            
            // Add user menu
            const userMenuItem = document.createElement('li');
            userMenuItem.innerHTML = `
                <div class="user-menu">
                    <span class="user-greeting">Hola, ${cliente.nombre}</span>
                    <div class="user-dropdown">
                        <a href="/auth/logout">Cerrar Sesión</a>
                    </div>
                </div>
            `;
            nav.appendChild(userMenuItem);
            
            // Update mobile nav too
            if (mobileNav) {
                const mobileAuthLinks = mobileNav.querySelectorAll('.mobile-auth-link');
                mobileAuthLinks.forEach(link => link.parentElement.remove());
                
                const mobileUserItem = document.createElement('li');
                mobileUserItem.innerHTML = `<a href="/auth/logout" class="mobile-nav-link">Cerrar Sesión (${cliente.nombre})</a>`;
                mobileNav.insertBefore(mobileUserItem, mobileNav.children[3]); // Before cart link
            }
            
            // Add user menu styles
            if (!document.getElementById('user-menu-styles')) {
                const style = document.createElement('style');
                style.id = 'user-menu-styles';
                style.textContent = `
                    .user-menu {
                        position: relative;
                        cursor: pointer;
                        padding: 8px 16px;
                        border-radius: 6px;
                        transition: all 0.3s ease;
                    }
                    
                    .user-menu:hover {
                        background: rgba(251, 181, 181, 0.2);
                    }
                    
                    .user-greeting {
                        color: #fbb5b5;
                        font-weight: 600;
                    }
                    
                    .user-dropdown {
                        position: absolute;
                        top: 100%;
                        right: 0;
                        background: var(--bg-color);
                        border: 2px solid #fbb5b5;
                        border-radius: 6px;
                        padding: 10px;
                        min-width: 150px;
                        opacity: 0;
                        visibility: hidden;
                        transform: translateY(-10px);
                        transition: all 0.3s ease;
                        z-index: 100;
                    }
                    
                    .user-menu:hover .user-dropdown {
                        opacity: 1;
                        visibility: visible;
                        transform: translateY(0);
                    }
                    
                    .user-dropdown a {
                        display: block;
                        color: white;
                        text-decoration: none;
                        padding: 8px 12px;
                        border-radius: 4px;
                        transition: background 0.3s ease;
                    }
                    
                    .user-dropdown a:hover {
                        background: rgba(251, 181, 181, 0.2);
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }
    
    // Make showQuickNotification globally available
    window.showQuickNotification = showQuickNotification;
});