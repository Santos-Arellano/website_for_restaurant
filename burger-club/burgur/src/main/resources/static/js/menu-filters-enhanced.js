/**
 * Enhanced Menu Filters Manager
 * Handles advanced filtering, search suggestions, animations, and user experience improvements
 */

class MenuFiltersManager {
    constructor() {
        this.searchInput = null;
        this.searchForm = null;
        this.filterButtons = [];
        this.menuCards = [];
        this.searchTimeout = null;
        this.searchDelay = 400;
        this.suggestions = [];
        this.currentFilter = 'all';
        this.isSearching = false;
        
        this.init();
    }
    
    init() {
        this.bindElements();
        if (this.searchInput) {
            this.setupSearch();
            this.setupFilters();
            this.setupSuggestions();
            this.setupKeyboardNavigation();
            this.loadSearchHistory();
            this.animateOnLoad();
        }
    }
    
    bindElements() {
        this.searchInput = document.querySelector('.menu-search-input');
        this.searchForm = document.querySelector('.menu-search-form');
        this.searchClear = document.querySelector('.search-clear');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.menuCards = document.querySelectorAll('.menu-card');
        this.searchContainer = document.querySelector('.menu-search-container');
        this.filtersContainer = document.querySelector('.menu-filters');
    }
    
    setupSearch() {
        if (!this.searchInput) return;
        
        // Enhanced search with debounce
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            this.handleSearchInput(query);
        });
        
        // Handle enter key
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch();
            }
        });
        
        // Focus and blur effects
        this.searchInput.addEventListener('focus', () => {
            this.onSearchFocus();
        });
        
        this.searchInput.addEventListener('blur', () => {
            setTimeout(() => this.onSearchBlur(), 150);
        });
        
        // Clear search functionality
        if (this.searchClear) {
            this.searchClear.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearSearch();
            });
        }
    }
    
    setupFilters() {
        this.filterButtons.forEach((btn, index) => {
            // Add loading state capability
            btn.addEventListener('click', (e) => {
                if (btn.href && !btn.classList.contains('active')) {
                    this.showFilterLoading(btn);
                }
            });
            
            // Add hover effects
            btn.addEventListener('mouseenter', () => {
                this.onFilterHover(btn);
            });
            
            // Add animation delay for staggered entrance
            btn.style.animationDelay = `${index * 0.1}s`;
            btn.classList.add('filter-entrance');
        });
        
        // Update filter counters
        this.updateFilterCounters();
    }
    
    setupSuggestions() {
        // Create suggestions container
        this.createSuggestionsContainer();
        
        // Load common search terms
        this.suggestions = [
            { text: 'hamburguesa', icon: 'fas fa-hamburger', category: 'hamburguesa' },
            { text: 'papas fritas', icon: 'fas fa-utensils', category: 'acompañamiento' },
            { text: 'perro caliente', icon: 'fas fa-hotdog', category: 'perro caliente' },
            { text: 'coca cola', icon: 'fas fa-glass-whiskey', category: 'bebida' },
            { text: 'helado', icon: 'fas fa-ice-cream', category: 'postre' },
            { text: 'pollo', icon: 'fas fa-drumstick-bite', category: 'hamburguesa' },
            { text: 'queso', icon: 'fas fa-cheese', category: 'hamburguesa' },
            { text: 'bacon', icon: 'fas fa-bacon', category: 'hamburguesa' }
        ];
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
            
            // Escape to clear search
            if (e.key === 'Escape') {
                if (this.searchInput === document.activeElement) {
                    this.clearSearch();
                } else {
                    this.hideSuggestions();
                }
            }
        });
    }
    
    handleSearchInput(query) {
        clearTimeout(this.searchTimeout);
        
        if (query.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        if (query.length >= 2) {
            this.searchTimeout = setTimeout(() => {
                this.showSuggestions(query);
            }, 200);
        }
        
        // Auto-search after delay
        this.searchTimeout = setTimeout(() => {
            if (query.length >= 2 || query.length === 0) {
                this.performSearch();
            }
        }, this.searchDelay);
    }
    
    performSearch() {
        if (this.isSearching) return;
        
        this.isSearching = true;
        this.showSearchLoading();
        
        // Save to search history
        const query = this.searchInput.value.trim();
        if (query) {
            this.saveToSearchHistory(query);
        }
        
        // Submit form
        if (this.searchForm) {
            this.searchForm.submit();
        }
    }
    
    clearSearch() {
        this.searchInput.value = '';
        this.hideSuggestions();
        this.hideSearchLoading();
        
        // Animate clear action
        this.searchInput.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.searchInput.style.transform = 'scale(1)';
        }, 150);
        
        // Redirect to menu without search
        window.location.href = '/menu';
    }
    
    focusSearch() {
        if (this.searchInput) {
            this.searchInput.focus();
            this.searchInput.select();
        }
    }
    
    onSearchFocus() {
        this.searchContainer?.classList.add('search-focused');
        
        // Show recent searches if input is empty
        if (!this.searchInput.value.trim()) {
            this.showRecentSearches();
        }
    }
    
    onSearchBlur() {
        this.searchContainer?.classList.remove('search-focused');
        this.hideSuggestions();
    }
    
    onFilterHover(btn) {
        // Ripple effect removed to prevent button enlargement
        // this.createRippleEffect(btn);
    }
    
    createSuggestionsContainer() {
        if (document.querySelector('.search-suggestions')) return;
        
        const container = document.createElement('div');
        container.className = 'search-suggestions';
        container.innerHTML = '<div class="suggestions-list"></div>';
        
        if (this.searchContainer) {
            this.searchContainer.appendChild(container);
        }
        
        this.suggestionsContainer = container;
        this.suggestionsList = container.querySelector('.suggestions-list');
    }
    
    showSuggestions(query) {
        if (!this.suggestionsContainer || !this.suggestionsList) return;
        
        const filteredSuggestions = this.suggestions.filter(suggestion =>
            suggestion.text.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 6);
        
        if (filteredSuggestions.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        this.suggestionsList.innerHTML = filteredSuggestions.map(suggestion => `
            <div class="suggestion-item" data-text="${suggestion.text}" data-category="${suggestion.category}">
                <i class="suggestion-icon ${suggestion.icon}"></i>
                <span>${this.highlightMatch(suggestion.text, query)}</span>
            </div>
        `).join('');
        
        // Add click handlers
        this.suggestionsList.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const text = item.dataset.text;
                this.searchInput.value = text;
                this.hideSuggestions();
                this.performSearch();
            });
        });
        
        this.suggestionsContainer.classList.add('show');
    }
    
    showRecentSearches() {
        const recentSearches = this.getSearchHistory();
        if (recentSearches.length === 0) return;
        
        if (!this.suggestionsContainer || !this.suggestionsList) return;
        
        this.suggestionsList.innerHTML = recentSearches.map(search => `
            <div class="suggestion-item" data-text="${search}">
                <i class="suggestion-icon fas fa-history"></i>
                <span>${search}</span>
            </div>
        `).join('');
        
        // Add click handlers
        this.suggestionsList.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const text = item.dataset.text;
                this.searchInput.value = text;
                this.hideSuggestions();
                this.performSearch();
            });
        });
        
        this.suggestionsContainer.classList.add('show');
    }
    
    hideSuggestions() {
        if (this.suggestionsContainer) {
            this.suggestionsContainer.classList.remove('show');
        }
    }
    
    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }
    
    showSearchLoading() {
        if (this.searchContainer) {
            this.searchContainer.classList.add('search-loading');
        }
    }
    
    hideSearchLoading() {
        if (this.searchContainer) {
            this.searchContainer.classList.remove('search-loading');
        }
        this.isSearching = false;
    }
    
    showFilterLoading(btn) {
        btn.classList.add('filter-loading');
        
        // Remove loading state after navigation
        setTimeout(() => {
            btn.classList.remove('filter-loading');
        }, 2000);
    }
    
    async updateFilterCounters() {
        try {
            // Fetch real data from the server
            const response = await fetch('/api/menu/category-counts');
            if (!response.ok) {
                console.warn('Failed to fetch category counts');
                return;
            }
            
            const counters = await response.json();
            
            this.filterButtons.forEach(btn => {
                const href = btn.getAttribute('href');
                if (href && href.includes('categoria=')) {
                    const category = href.split('categoria=')[1].split(')')[0];
                    const count = counters[category];
                    
                    // Remove existing counter if present
                    const existingCounter = btn.querySelector('.filter-counter');
                    if (existingCounter) {
                        existingCounter.remove();
                    }
                    
                    // Add new counter if count > 0
                    if (count && count > 0) {
                        const counter = document.createElement('span');
                        counter.className = 'filter-counter';
                        counter.textContent = count;
                        btn.appendChild(counter);
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching category counts:', error);
        }
    }
    
    createRippleEffect(element) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (rect.width / 2 - size / 2) + 'px';
        ripple.style.top = (rect.height / 2 - size / 2) + 'px';
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    saveToSearchHistory(query) {
        let history = this.getSearchHistory();
        
        // Remove if already exists
        history = history.filter(item => item !== query);
        
        // Add to beginning
        history.unshift(query);
        
        // Keep only last 5 searches
        history = history.slice(0, 5);
        
        localStorage.setItem('menuSearchHistory', JSON.stringify(history));
    }
    
    getSearchHistory() {
        try {
            return JSON.parse(localStorage.getItem('menuSearchHistory') || '[]');
        } catch {
            return [];
        }
    }
    
    loadSearchHistory() {
        // This method can be used to preload search history if needed
        const history = this.getSearchHistory();
        console.log('Loaded search history:', history);
    }
    
    animateOnLoad() {
        // Usar requestIdleCallback para animaciones no críticas
        const performAnimations = () => {
            // Animate search container con menos delay
            if (this.searchContainer) {
                this.searchContainer.style.opacity = '0';
                this.searchContainer.style.transform = 'translateY(-10px)';
                
                requestAnimationFrame(() => {
                    this.searchContainer.style.transition = 'all 0.3s ease';
                    this.searchContainer.style.opacity = '1';
                    this.searchContainer.style.transform = 'translateY(0)';
                });
            }
            
            // Animate filter buttons con menos stagger
            this.filterButtons.forEach((btn, index) => {
                btn.style.opacity = '0';
                btn.style.transform = 'translateY(10px)';
                
                setTimeout(() => {
                    btn.style.transition = 'all 0.3s ease';
                    btn.style.opacity = '1';
                    btn.style.transform = 'translateY(0)';
                }, index * 50); // Reducido de 100ms a 50ms
            });
        };
        
        // Usar requestIdleCallback si está disponible
        if (window.requestIdleCallback) {
            requestIdleCallback(performAnimations, { timeout: 500 });
        } else {
            setTimeout(performAnimations, 50);
        }
    }
    
    destroy() {
        clearTimeout(this.searchTimeout);
        
        // Remove event listeners
        if (this.searchInput) {
            this.searchInput.removeEventListener('input', this.handleSearchInput);
            this.searchInput.removeEventListener('keypress', this.performSearch);
            this.searchInput.removeEventListener('focus', this.onSearchFocus);
            this.searchInput.removeEventListener('blur', this.onSearchBlur);
        }
        
        if (this.searchClear) {
            this.searchClear.removeEventListener('click', this.clearSearch);
        }
    }
}

// Optimized initialization - defer until idle
const initializeMenuFilters = () => {
    if (document.querySelector('.menu-search-input')) {
        new MenuFiltersManager();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Use requestIdleCallback to defer initialization
        if (window.requestIdleCallback) {
            requestIdleCallback(initializeMenuFilters, { timeout: 2000 });
        } else {
            setTimeout(initializeMenuFilters, 200);
        }
    });
} else {
    // Page already loaded, defer initialization
    if (window.requestIdleCallback) {
        requestIdleCallback(initializeMenuFilters, { timeout: 1000 });
    } else {
        setTimeout(initializeMenuFilters, 100);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MenuFiltersManager;
}

// Export removed to avoid syntax conflicts