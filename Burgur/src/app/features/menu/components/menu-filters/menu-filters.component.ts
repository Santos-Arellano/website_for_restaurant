// ==========================================
// BURGER CLUB - ANGULAR MENU FILTERS COMPONENT
// ==========================================

import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HelpersUtil } from '../../../../shared/utils/helpers.util';
import { MENU_CONFIG, ANIMATION_DURATIONS } from '../../../../shared/constants/app.constants';

export interface MenuFilter {
  id: string;
  label: string;
  count?: number;
  active?: boolean;
}

export interface SearchSuggestion {
  text: string;
  type: 'product' | 'category' | 'recent';
  count?: number;
}

export interface FilterChangeEvent {
  searchQuery: string;
  activeFilter: string;
}

@Component({
  selector: 'app-menu-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="menu-filters-container">
      <!-- Search Section -->
      <div class="menu-search-container" [class.focused]="isSearchFocused">
        <form class="menu-search-form" (ngSubmit)="onSearchSubmit($event)">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            
            <input type="text"
                   class="menu-search-input"
                   [(ngModel)]="searchQuery"
                   name="search"
                   placeholder="Buscar productos..."
                   autocomplete="off"
                   (focus)="onSearchFocus()"
                   (blur)="onSearchBlur()"
                   (keydown)="onSearchKeydown($event)"
                   #searchInput>
            
            <button *ngIf="searchQuery" 
                    type="button"
                    class="search-clear"
                    (click)="clearSearch()"
                    aria-label="Limpiar búsqueda">
              <i class="fas fa-times"></i>
            </button>
            
            <div *ngIf="isSearching" class="search-loading">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
          </div>
        </form>
        
        <!-- Search Suggestions -->
        <div *ngIf="showSuggestions && (suggestions.length > 0 || recentSearches.length > 0)" 
             class="search-suggestions"
             #suggestionsContainer>
          
          <!-- Product Suggestions -->
          <div *ngIf="suggestions.length > 0" class="suggestions-section">
            <h4 class="suggestions-title">
              <i class="fas fa-search"></i>
              Sugerencias
            </h4>
            <ul class="suggestions-list">
              <li *ngFor="let suggestion of suggestions; trackBy: trackBySuggestionText"
                  class="suggestion-item"
                  [class.highlighted]="suggestion === highlightedSuggestion"
                  (click)="selectSuggestion(suggestion)"
                  (mouseenter)="highlightedSuggestion = suggestion">
                <i [class]="getSuggestionIcon(suggestion.type)"></i>
                <span [innerHTML]="highlightMatch(suggestion.text, searchQuery)"></span>
                <span *ngIf="suggestion.count" class="suggestion-count">{{ suggestion.count }}</span>
              </li>
            </ul>
          </div>
          
          <!-- Recent Searches -->
          <div *ngIf="recentSearches.length > 0 && !searchQuery" class="suggestions-section">
            <h4 class="suggestions-title">
              <i class="fas fa-history"></i>
              Búsquedas recientes
            </h4>
            <ul class="suggestions-list">
              <li *ngFor="let recent of recentSearches; trackBy: trackByRecentText"
                  class="suggestion-item recent"
                  (click)="selectRecentSearch(recent)">
                <i class="fas fa-history"></i>
                <span>{{ recent }}</span>
                <button class="remove-recent" 
                        (click)="removeRecentSearch(recent, $event)"
                        aria-label="Eliminar de recientes">
                  <i class="fas fa-times"></i>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Filter Buttons -->
      <div class="menu-filters" *ngIf="filters.length > 0">
        <button *ngFor="let filter of filters; trackBy: trackByFilterId"
                class="filter-btn"
                [class.active]="filter.active"
                [class.loading]="filter.id === loadingFilter"
                (click)="selectFilter(filter)"
                (mouseenter)="onFilterHover(filter)"
                type="button">
          
          <span class="filter-label">{{ filter.label }}</span>
          
          <span *ngIf="filter.count !== undefined" 
                class="filter-count">{{ filter.count }}</span>
          
          <div *ngIf="filter.id === loadingFilter" class="filter-loading">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
        </button>
      </div>

      <!-- Active Filters Display -->
      <div *ngIf="hasActiveFilters()" class="active-filters">
        <span class="active-filters-label">Filtros activos:</span>
        
        <div class="active-filter-tags">
          <span *ngIf="searchQuery" class="filter-tag search-tag">
            <i class="fas fa-search"></i>
            "{{ searchQuery }}"
            <button (click)="clearSearch()" aria-label="Eliminar filtro de búsqueda">
              <i class="fas fa-times"></i>
            </button>
          </span>
          
          <span *ngFor="let filter of getActiveFilters()" class="filter-tag category-tag">
            <i class="fas fa-tag"></i>
            {{ filter.label }}
            <button (click)="clearFilter(filter)" aria-label="Eliminar filtro de categoría">
              <i class="fas fa-times"></i>
            </button>
          </span>
        </div>
        
        <button class="clear-all-filters" 
                (click)="clearAllFilters()"
                type="button">
          <i class="fas fa-times-circle"></i>
          Limpiar todo
        </button>
      </div>
    </div>
  `,
  styles: [`
    .menu-filters-container {
      margin-bottom: 2rem;
    }

    .menu-search-container {
      position: relative;
      margin-bottom: 1.5rem;
      transition: all 0.3s ease;
    }

    .menu-search-container.focused {
      transform: translateY(-2px);
    }

    .menu-search-form {
      position: relative;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 25px;
      padding: 0.75rem 1rem;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .menu-search-container.focused .search-input-wrapper {
      border-color: #d4a574;
      box-shadow: 0 4px 12px rgba(212, 165, 116, 0.2);
    }

    .search-icon {
      color: #666;
      margin-right: 0.75rem;
      font-size: 1.1rem;
    }

    .menu-search-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 1rem;
      background: transparent;
      color: #333;
    }

    .menu-search-input::placeholder {
      color: #999;
    }

    .search-clear,
    .search-loading {
      margin-left: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .search-clear {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .search-clear:hover {
      background: #f8f9fa;
      color: #333;
    }

    .search-loading {
      color: #d4a574;
    }

    .search-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      z-index: 100;
      max-height: 300px;
      overflow-y: auto;
      margin-top: 0.5rem;
    }

    .suggestions-section {
      padding: 0.75rem 0;
    }

    .suggestions-section:not(:last-child) {
      border-bottom: 1px solid #f8f9fa;
    }

    .suggestions-title {
      margin: 0 0 0.5rem 0;
      padding: 0 1rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #666;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .suggestions-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .suggestion-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      gap: 0.75rem;
    }

    .suggestion-item:hover,
    .suggestion-item.highlighted {
      background: #f8f9fa;
    }

    .suggestion-item i {
      color: #666;
      width: 16px;
      text-align: center;
    }

    .suggestion-item span {
      flex: 1;
    }

    .suggestion-count {
      background: #e9ecef;
      color: #666;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .remove-recent {
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .remove-recent:hover {
      background: #e9ecef;
      color: #666;
    }

    .menu-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .filter-btn {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 25px;
      color: #666;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .filter-btn:hover {
      border-color: #d4a574;
      color: #d4a574;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .filter-btn.active {
      background: #d4a574;
      border-color: #d4a574;
      color: white;
    }

    .filter-btn.loading {
      pointer-events: none;
    }

    .filter-count {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .filter-btn:not(.active) .filter-count {
      background: #e9ecef;
      color: #666;
    }

    .filter-loading {
      position: absolute;
      right: 0.75rem;
    }

    .active-filters {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 12px;
      margin-bottom: 1rem;
    }

    .active-filters-label {
      font-weight: 600;
      color: #666;
      white-space: nowrap;
    }

    .active-filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      flex: 1;
    }

    .filter-tag {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 20px;
      font-size: 0.85rem;
      color: #333;
    }

    .filter-tag button {
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .filter-tag button:hover {
      background: #f8f9fa;
      color: #666;
    }

    .search-tag {
      border-color: #d4a574;
      background: #fef9f3;
    }

    .category-tag {
      border-color: #28a745;
      background: #f8fff9;
    }

    .clear-all-filters {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .clear-all-filters:hover {
      background: #c82333;
    }

    @media (max-width: 768px) {
      .menu-filters {
        justify-content: center;
      }

      .filter-btn {
        flex: 1;
        min-width: 120px;
        justify-content: center;
      }

      .active-filters {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .active-filter-tags {
        justify-content: center;
      }
    }
  `]
})
export class MenuFiltersComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput', { static: false }) searchInputRef!: ElementRef;
  @ViewChild('suggestionsContainer', { static: false }) suggestionsRef!: ElementRef;

  @Input() filters: MenuFilter[] = [];
  @Input() suggestions: SearchSuggestion[] = [];
  @Output() filterChange = new EventEmitter<FilterChangeEvent>();

  searchQuery = '';
  isSearchFocused = false;
  isSearching = false;
  showSuggestions = false;
  loadingFilter = '';
  highlightedSuggestion?: SearchSuggestion;
  recentSearches: string[] = [];

  private searchSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];

  constructor(private helpersUtil: HelpersUtil) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadSearchHistory();
    this.setupClickOutsideListener();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onSearchSubmit(event: Event): void {
    event.preventDefault();
    this.performSearch();
  }

  onSearchFocus(): void {
    this.isSearchFocused = true;
    this.showSuggestions = true;
  }

  onSearchBlur(): void {
    // Delay to allow suggestion clicks
    setTimeout(() => {
      this.isSearchFocused = false;
      this.showSuggestions = false;
      this.highlightedSuggestion = undefined;
    }, 200);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (!this.showSuggestions) return;

    const allSuggestions = [...this.suggestions, ...this.recentSearches.map(r => ({ text: r, type: 'recent' as const }))];

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateSuggestions(allSuggestions, 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateSuggestions(allSuggestions, -1);
        break;
      case 'Enter':
        if (this.highlightedSuggestion) {
          event.preventDefault();
          this.selectSuggestion(this.highlightedSuggestion);
        }
        break;
      case 'Escape':
        this.showSuggestions = false;
        this.searchInputRef.nativeElement.blur();
        break;
    }
  }

  selectFilter(filter: MenuFilter): void {
    // Toggle filter active state
    filter.active = !filter.active;
    
    // Update other filters if needed (single selection mode)
    if (filter.active && filter.id !== 'all') {
      this.filters.forEach(f => {
        if (f.id !== filter.id) {
          f.active = false;
        }
      });
    }

    this.emitFilterChange();
    this.createRippleEffect(event?.target as HTMLElement);
  }

  selectSuggestion(suggestion: SearchSuggestion): void {
    this.searchQuery = suggestion.text;
    this.showSuggestions = false;
    this.saveToSearchHistory(suggestion.text);
    this.performSearch();
  }

  selectRecentSearch(searchText: string): void {
    this.searchQuery = searchText;
    this.showSuggestions = false;
    this.performSearch();
  }

  removeRecentSearch(searchText: string, event: Event): void {
    event.stopPropagation();
    this.recentSearches = this.recentSearches.filter(s => s !== searchText);
    this.saveSearchHistory();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.showSuggestions = false;
    this.emitFilterChange();
    this.searchInputRef?.nativeElement.focus();
  }

  clearFilter(filter: MenuFilter): void {
    filter.active = false;
    this.emitFilterChange();
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    this.filters.forEach(f => f.active = false);
    this.emitFilterChange();
  }

  onFilterHover(filter: MenuFilter): void {
    // Add hover effects or tooltips if needed
  }

  hasActiveFilters(): boolean {
    return !!this.searchQuery || this.filters.some(f => f.active);
  }

  getActiveFilters(): MenuFilter[] {
    return this.filters.filter(f => f.active);
  }

  trackByFilterId(index: number, filter: MenuFilter): string {
    return filter.id;
  }

  trackBySuggestionText(index: number, suggestion: SearchSuggestion): string {
    return suggestion.text;
  }

  trackByRecentText(index: number, recent: string): string {
    return recent;
  }

  getSuggestionIcon(type: string): string {
    switch (type) {
      case 'product': return 'fas fa-utensils';
      case 'category': return 'fas fa-tag';
      case 'recent': return 'fas fa-history';
      default: return 'fas fa-search';
    }
  }

  highlightMatch(text: string, query: string): string {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
  }

  private setupSearchDebounce(): void {
    this.subscriptions.push(
      this.searchSubject.pipe(
        debounceTime(MENU_CONFIG.searchDebounceDelay),
        distinctUntilChanged()
      ).subscribe(query => {
        this.performSearch();
      })
    );

    // Watch for search input changes
    this.subscriptions.push(
      this.searchSubject.subscribe(query => {
        this.searchQuery = query;
      })
    );
  }

  private performSearch(): void {
    if (this.searchQuery.trim()) {
      this.saveToSearchHistory(this.searchQuery.trim());
    }
    
    this.isSearching = true;
    this.showSuggestions = false;
    
    // Simulate search delay
    setTimeout(() => {
      this.isSearching = false;
      this.emitFilterChange();
    }, 300);
  }

  private navigateSuggestions(suggestions: SearchSuggestion[], direction: number): void {
    if (suggestions.length === 0) return;

    const currentIndex = this.highlightedSuggestion 
      ? suggestions.findIndex(s => s === this.highlightedSuggestion)
      : -1;

    let newIndex = currentIndex + direction;

    if (newIndex < 0) {
      newIndex = suggestions.length - 1;
    } else if (newIndex >= suggestions.length) {
      newIndex = 0;
    }

    this.highlightedSuggestion = suggestions[newIndex];
  }

  private emitFilterChange(): void {
    const activeFilter = this.filters.find(f => f.active)?.id || 'all';
    
    this.filterChange.emit({
      searchQuery: this.searchQuery,
      activeFilter
    });
  }

  private saveToSearchHistory(query: string): void {
    if (!query || query.length < 2) return;

    // Remove if already exists
    this.recentSearches = this.recentSearches.filter(s => s !== query);
    
    // Add to beginning
    this.recentSearches.unshift(query);
    
    // Keep only last 5
    this.recentSearches = this.recentSearches.slice(0, 5);
    
    this.saveSearchHistory();
  }

  private saveSearchHistory(): void {
    try {
      localStorage.setItem('burgerclub_search_history', JSON.stringify(this.recentSearches));
    } catch (error) {
      console.warn('Could not save search history:', error);
    }
  }

  private loadSearchHistory(): void {
    try {
      const saved = localStorage.getItem('burgerclub_search_history');
      if (saved) {
        this.recentSearches = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Could not load search history:', error);
      this.recentSearches = [];
    }
  }

  private setupClickOutsideListener(): void {
    const handleClickOutside = (event: Event) => {
      const target = event.target as HTMLElement;
      const searchContainer = target.closest('.menu-search-container');
      
      if (!searchContainer) {
        this.showSuggestions = false;
      }
    };

    document.addEventListener('click', handleClickOutside);
    
    this.subscriptions.push({
      unsubscribe: () => document.removeEventListener('click', handleClickOutside)
    } as Subscription);
  }

  private createRippleEffect(element: HTMLElement): void {
    if (!element) return;

    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (rect.width / 2 - size / 2) + 'px';
    ripple.style.top = (rect.height / 2 - size / 2) + 'px';
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, ANIMATION_DURATIONS.normal);
  }
}