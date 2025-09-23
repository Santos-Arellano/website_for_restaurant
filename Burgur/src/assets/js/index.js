/**
 * Index Page JavaScript
 * Handles authentication status and user interface updates for the index page.
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Optimized authentication check
    async function checkAuthenticationStatus() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
            
            const response = await fetch('/auth/current', {
                signal: controller.signal,
                cache: 'no-cache'
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.authenticated && data.cliente) {
                updateHeaderForLoggedInUser(data.cliente);
            }
        } catch (error) {
            console.log('Authentication check failed:', error.message);
            // Keep auth buttons visible if check fails
        }
    }
    
    function updateHeaderForLoggedInUser(cliente) {
        const nav = document.querySelector('.main-nav ul');
        const mobileNav = document.querySelector('.mobile-menu ul');
        
        if (nav && cliente) {
            // Update login link to show user profile
            const loginLink = nav.querySelector('#loginLink');
            if (loginLink) {
                loginLink.textContent = 'Mi Perfil';
                loginLink.href = '/user/profile';
            }
            
            // Remove the register link
            const registerLink = nav.querySelector('#registerLink');
            if (registerLink && registerLink.parentElement) {
                registerLink.parentElement.remove();
            }
            
            // Add user menu after the profile link
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
                const mobileLoginLink = mobileNav.querySelector('.mobile-auth-link[href*="login"]');
                if (mobileLoginLink) {
                    mobileLoginLink.textContent = 'Mi Perfil';
                    mobileLoginLink.href = '/user/profile';
                }
                
                // Remove the mobile register link
                const mobileRegisterLink = mobileNav.querySelector('.mobile-auth-link[href*="register"]');
                if (mobileRegisterLink && mobileRegisterLink.parentElement) {
                    mobileRegisterLink.parentElement.remove();
                }
                
                const mobileUserItem = document.createElement('li');
                mobileUserItem.innerHTML = `<a href="/auth/logout" class="mobile-nav-link">Cerrar Sesión (${cliente.nombre})</a>`;
                mobileNav.insertBefore(mobileUserItem, mobileNav.children[mobileNav.children.length - 2]); // Before location link
            }
            
            // Add user menu styles if not already present
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
    
    // Initialize authentication check
    checkAuthenticationStatus();
});