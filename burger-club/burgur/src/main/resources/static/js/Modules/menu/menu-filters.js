// ==========================================
// BURGER CLUB - MENU FILTERS MODULE
// ==========================================

import { MENU_CONFIG } from '../../utils/constants.js';

export class MenuFilters {
    constructor() {
        this.currentFilter = 'all';
        this.filterButtons = [];
        this.menuCards = [];
        
        this.init();
    }
    
    init() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.menuCards = document.querySelectorAll('.menu-card');
        
        if (this.filterButtons.length === 0) return;
        
        this.bindEvents();
        this.filterMenuItems('all'); // Show all items initially
        
        console.log('🔽 Menu Filters initialized');
    }
    
    bindEvents() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.handleFilterClick(button);
            });
            
            // Add hover effects
            button.addEventListener('mouseenter', () => {
                if (!button.classList.contains('active')) {
                    button.style.transform = 'translateY(-3px)';
                }
            });
            
            button.addEventListener('mouseleave', () => {
                if (!button.classList.contains('active')) {
                    button.style.transform = 'translateY(0)';
                }
            });
        });
    }
    
    handleFilterClick(button) {
        const category = (button.dataset.category || 'all').toLowerCase();
        
        // Update active state
        this.updateActiveFilter(button);
        
        // Filter items
        this.filterMenuItems(category);
        
        // Add click animation
        this.addClickAnimation(button);
        
        // Update current filter
        this.currentFilter = category;
        
        console.log(`🔽 Filtering by: ${category}`);
    }
    
    updateActiveFilter(activeButton) {
        this.filterButtons.forEach(button => {
            button.classList.remove('active');
        });
        activeButton.classList.add('active');
    }
    
    filterMenuItems(category = 'all') {
        const grid = document.getElementById('menuGrid');
        if (!grid) return;
        
        // Re-query cards in case they've been updated
        this.menuCards = grid.querySelectorAll('.menu-card');
        const isAll = category === 'all';
        let shownCount = 0;
        
        this.menuCards.forEach((card, index) => {
            const itemCategory = (card.getAttribute('data-category') || '').toLowerCase();
            const shouldShow = isAll || itemCategory === category;
            
            if (shouldShow) {
                shownCount++;
                this.showCard(card, index);
            } else {
                this.hideCard(card);
            }
        });
        
        // Update empty state
        this.updateEmptyState(shownCount);
        
        // Dispatch filter event
        document.dispatchEvent(new CustomEvent('menuFiltered', {
            detail: { 
                category, 
                shownCount,
                totalCards: this.menuCards.length 
            }
        }));
    }
    
    showCard(card, index) {
        card.style.display = 'block';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        // Staggered animation
        setTimeout(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    }
    
    hideCard(card) {
        card.style.transition = 'all 0.2s ease';
        card.style.opacity = '0';
        card.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            card.style.display = 'none';
        }, 200);
    }
    
    updateEmptyState(shownCount) {
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.style.display = shownCount === 0 ? 'block' : 'none';
        }
    }
    
    addClickAnimation(button) {
        button.classList.add('animate-pulse');
        setTimeout(() => {
            button.classList.remove('animate-pulse');
        }, 300);
    }
    
    // Public methods
    getCurrentFilter() {
        return this.currentFilter;
    }
    
    setFilter(category) {
        const targetButton = Array.from(this.filterButtons)
            .find(btn => btn.dataset.category === category);
        
        if (targetButton) {
            this.handleFilterClick(targetButton);
        }
    }
    
    getVisibleCards() {
        return Array.from(this.menuCards)
            .filter(card => card.style.display !== 'none' && card.style.opacity !== '0');
    }
    
    refreshCards() {
        // Re-query cards and apply current filter
        this.menuCards = document.querySelectorAll('.menu-card');
        this.filterMenuItems(this.currentFilter);
    }
    
    // Filter by search term while maintaining category filter
    filterBySearch(searchTerm) {
        const normalizedTerm = searchTerm.toLowerCase().trim();
        const isAll = this.currentFilter === 'all';
        let shownCount = 0;
        
        this.menuCards.forEach((card, index) => {
            const itemCategory = (card.getAttribute('data-category') || '').toLowerCase();
            const itemName = (card.dataset.name || 
                card.querySelector('.menu-card-name')?.textContent || '').toLowerCase();
            const itemDesc = (card.dataset.desc || 
                card.querySelector('.menu-card-description')?.textContent || '').toLowerCase();
            const itemIngredients = (card.dataset.ingredients || '').toLowerCase();
            
            // Check category filter
            const passesCategory = isAll || itemCategory === this.currentFilter;
            
            // Check search filter
            const passesSearch = !normalizedTerm || 
                itemName.includes(normalizedTerm) || 
                itemDesc.includes(normalizedTerm) || 
                itemIngredients.includes(normalizedTerm);
            
            const shouldShow = passesCategory && passesSearch;
            
            if (shouldShow) {
                shownCount++;
                this.showCard(card, index);
            } else {
                this.hideCard(card);
            }
        });
        
        this.updateEmptyState(shownCount);
        
        return shownCount;
    }
    
    // Get filter statistics
    getFilterStats() {
        const stats = {};
        
        this.menuCards.forEach(card => {
            const category = card.getAttribute('data-category') || 'other';
            stats[category] = (stats[category] || 0) + 1;
        });
        
        return stats;
    }
    
    // Update filter button counts (optional feature)
    updateFilterCounts() {
        const stats = this.getFilterStats();
        
        this.filterButtons.forEach(button => {
            const category = button.dataset.category;
            const count = category === 'all' 
                ? Object.values(stats).reduce((sum, count) => sum + count, 0)
                : stats[category] || 0;
            
            const span = button.querySelector('span');
            if (span && count > 0) {
                span.textContent = `${span.textContent.split('(')[0]} (${count})`;
            }
        });
    }
}