// ==========================================
// BURGER CLUB - MENU MANAGER MODULE
// ==========================================

import { MenuFilters } from './menu-filters.js';
import { MenuGrid } from './menu-grid.js';
import { debounce } from '../../utils/helpers.js';
import { MENU_CONFIG } from '../../utils/constants.js';

export class MenuManager {
    constructor() {
        this.filters = null;
        this.grid = null;
        this.searchInput = null;
        this.currentSearchTerm = '';
        
        this.init();
    }
    
    init() {
        // Check if we're on a menu page
        const menuGrid = document.getElementById('menuGrid');
        if (!menuGrid) return;
        
        this.initializeComponents();
        this.initializeSearch();
        this.initializeAnimations();
        this.bindGlobalEvents();
        
        console.log('📋 Menu Manager initialized');
    }
    
    initializeComponents() {
        this.filters = new MenuFilters();
        this.grid = new MenuGrid();
        
        // Hide load more if using server-side rendering
        const hasServerCards = document.querySelector('.menu-card[th\\:each]');
        if (hasServerCards) {
            this.grid.hideLoadMore();
        }
    }
    
    initializeSearch() {
        this.createSearchInput();
        this.bindSearchEvents();
    }
    
    createSearchInput() {
        const menuHeader = document.querySelector('.menu-header');
        if (!menuHeader) return;
        
        const searchContainer = document.createElement('div');
        searchContainer.className = 'menu-search-container';
        searchContainer.innerHTML = `
            <div class="search-input-wrapper">
                <input type="text" 
                       id="menuSearchInput" 
                       placeholder="Buscar productos..." 
                       class="menu-search-input">
                <i class="fas fa-search search-icon"></i>
                <button class="search-clear" id="searchClear" style="display: none;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        menuHeader.appendChild(searchContainer);
        
        this.searchInput = document.getElementById('menuSearchInput');
        this.searchClear = document.getElementById('searchClear');
        
        this.addSearchStyles();
    }
    
    bindSearchEvents() {
        if (!this.searchInput) return;
        
        this.searchInput.addEventListener('input', 
            debounce((e) => this.handleSearch(e.target.value), MENU_CONFIG.searchDebounceDelay)
        );
        
        if (this.searchClear) {
            this.searchClear.addEventListener('click', () => {
                this.clearSearch();
            });
        }
        
        // Advanced search modal trigger (Ctrl+F or Ctrl+K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'k')) {
                if (document.getElementById('menuGrid')) {
                    e.preventDefault();
                    this.openAdvancedSearch();
                }
            }
        });
    }
    
    handleSearch(searchTerm) {
        this.currentSearchTerm = searchTerm.trim();
        
        // Update search clear button visibility
        if (this.searchClear) {
            this.searchClear.style.display = this.currentSearchTerm ? 'block' : 'none';
        }
        
        // Perform search using filters
        const shownCount = this.filters.filterBySearch(this.currentSearchTerm);
        
        // Show search results info
        this.showSearchResults(this.currentSearchTerm, shownCount);
        
        // Update load more button
        if (this.grid) {
            if (this.currentSearchTerm) {
                this.grid.hideLoadMore();
            } else {
                this.grid.showLoadMore();
            }
        }
        
        // Dispatch search event
        document.dispatchEvent(new CustomEvent('menuSearched', {
            detail: {
                term: this.currentSearchTerm,
                resultsCount: shownCount
            }
        }));
    }
    
    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        
        if (this.searchClear) {
            this.searchClear.style.display = 'none';
        }
        
        this.currentSearchTerm = '';
        
        // Reset to current filter
        this.filters.filterMenuItems(this.filters.getCurrentFilter());
        this.hideSearchResults();
        
        if (this.grid) {
            this.grid.showLoadMore();
        }
    }
    
    showSearchResults(searchTerm, resultsCount) {
        let resultsContainer = document.querySelector('.search-results-info');
        
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.className = 'search-results-info';
            
            const menuGrid = document.getElementById('menuGrid');
            menuGrid.parentNode.insertBefore(resultsContainer, menuGrid);
        }
        
        if (searchTerm) {
            resultsContainer.innerHTML = `
                <p>
                    <i class="fas fa-search"></i>
                    Mostrando ${resultsCount} resultado${resultsCount !== 1 ? 's' : ''} para "<strong>${searchTerm}</strong>"
                    ${resultsCount === 0 ? '<button class="btn-advanced-search" onclick="window.MenuManager?.openAdvancedSearch()">Búsqueda avanzada</button>' : ''}
                </p>
            `;
            resultsContainer.style.display = 'block';
        } else {
            resultsContainer.style.display = 'none';
        }
    }
    
    hideSearchResults() {
        const resultsContainer = document.querySelector('.search-results-info');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
    }
    
    openAdvancedSearch() {
        import('./menu-modals.js').then(({ MenuSearchModal }) => {
            new MenuSearchModal();
        });
    }
    
    initializeAnimations() {
        // Animate menu cards on load
        const menuCards = document.querySelectorAll('.menu-card');
        menuCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
        
        // Animate filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach((button, index) => {
            button.style.opacity = '0';
            button.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                button.style.transition = 'all 0.4s ease';
                button.style.opacity = '1';
                button.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    bindGlobalEvents() {
        // Listen for cart events to update UI
        document.addEventListener('itemAdded', (e) => {
            this.handleItemAdded(e.detail);
        });
        
        // Listen for filter changes
        document.addEventListener('menuFiltered', (e) => {
            this.handleFilterChange(e.detail);
        });
        
        // Window resize handler
        window.addEventListener('resize', debounce(() => {
            this.handleResize();
        }, 250));
    }
    
    handleItemAdded(detail) {
        // Could add visual feedback or analytics here
        console.log('📋 Item added from menu:', detail.product.name);
    }
    
    handleFilterChange(detail) {
        console.log(`📋 Menu filtered: ${detail.category} (${detail.shownCount} items)`);
        
        // Clear search when filter changes
        if (this.currentSearchTerm) {
            this.clearSearch();
        }
    }
    
    handleResize() {
        // Could adjust layout or card sizes based on screen size
        const isMobile = window.innerWidth <= 768;
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            const span = button.querySelector('span');
            if (span) {
                span.style.display = isMobile ? 'none' : 'inline';
            }
        });
    }
    
    addSearchStyles() {
        if (document.getElementById('menu-search-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'menu-search-styles';
        style.textContent = `
            .menu-search-container {
                margin: 30px 0;
                max-width: 500px;
                margin-left: auto;
                margin-right: auto;
                position: relative;
                z-index: 2;
            }
            
            .search-input-wrapper {
                position: relative;
                display: flex;
                align-items: center;
            }
            
            .menu-search-input {
                width: 100%;
                padding: 15px 50px 15px 50px;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: var(--border-radius-large);
                color: var(--color-text-primary);
                font-size: 1rem;
                font-family: var(--font-primary);
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }
            
            .menu-search-input:focus {
                outline: none;
                border-color: var(--color-cta-stroke);
                box-shadow: 0 0 0 3px rgba(251, 181, 181, 0.2);
                background: rgba(255, 255, 255, 0.15);
            }
            
            .menu-search-input::placeholder {
                color: var(--color-text-secondary);
            }
            
            .search-icon {
                position: absolute;
                left: 18px;
                color: var(--color-text-secondary);
                font-size: 1.1rem;
                pointer-events: none;
            }
            
            .search-clear {
                position: absolute;
                right: 15px;
                background: none;
                border: none;
                color: var(--color-text-secondary);
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 30px;
                height: 30px;
            }
            
            .search-clear:hover {
                color: var(--color-danger);
                background: rgba(244, 67, 54, 0.1);
            }
            
            .btn-advanced-search {
                background: var(--color-cta-stroke);
                color: var(--color-background);
                border: none;
                padding: 5px 10px;
                border-radius: var(--border-radius-small);
                font-size: 0.8rem;
                margin-left: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .btn-advanced-search:hover {
                background: var(--color-white);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Public API
    getFilters() {
        return this.filters;
    }
    
    getGrid() {
        return this.grid;
    }
    
    getCurrentSearch() {
        return this.currentSearchTerm;
    }
    
    setFilter(category) {
        if (this.filters) {
            this.filters.setFilter(category);
        }
    }
    
    search(term) {
        if (this.searchInput) {
            this.searchInput.value = term;
            this.handleSearch(term);
        }
    }
    
    refresh() {
        if (this.filters) {
            this.filters.refreshCards();
        }
        if (this.grid) {
            this.grid.refreshGrid();
        }
    }
}

// Make MenuManager globally available
window.MenuManager = MenuManager;