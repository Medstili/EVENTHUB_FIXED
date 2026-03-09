import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService, Event } from '../../services/eventService/event.service';
import { CategoryService, Category } from '../../services/categoryService/category.service';
import { EventCardComponent } from '../../event-card/event-card.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-all-events',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    EventCardComponent,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './all-events.component.html',
  styleUrls: ['./all-events.component.scss'],
  animations: [
    AnimationService.fadeInUp,
    AnimationService.staggerFadeIn
  ]
})
export class AllEventsComponent implements OnInit {
  events: Event[] = [];
  categories: Category[] = [];
  loading = false;
  loadingMore = false;
  page = 1;
  lastPage = 1;
  
  // Filters
  searchQuery = '';
  selectedCategory = signal<number | null>(null);
  selectedDate = '';
  maxPrice: number | null = null;

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.applyFilters();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe(cats => this.categories = cats);
  }

  applyFilters(): void {
    this.loading = true;
    this.page = 1;
    this.events = [];
    this.fetchEvents();
  }

  fetchEvents(): void {
    const filters: any = { show_all: true };
    if (this.selectedCategory()) filters.category = this.selectedCategory();
    if (this.searchQuery) filters.search = this.searchQuery;
    
    this.eventService.getAll(filters, this.page).subscribe({
      next: (pag) => {
        let filtered = pag.data;
        
        // Client-side filtering for date and price
        if (this.selectedDate) {
          filtered = filtered.filter(e => e.date === this.selectedDate);
        }
        if (this.maxPrice !== null) {
          filtered = filtered.filter(e => parseFloat(e.price) <= this.maxPrice!);
        }
        
        if (this.page === 1) {
          this.events = filtered;
        } else {
          this.events = [...this.events, ...filtered];
        }

        this.lastPage = pag.last_page;
        this.loading = false;
        this.loadingMore = false;
      },
      error: () => {
        this.loading = false;
        this.loadingMore = false;
      }
    });
  }

  loadMore(): void {
    if (this.page < this.lastPage && !this.loadingMore) {
      this.page++;
      this.loadingMore = true;
      this.fetchEvents();
    }
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory.set(null);
    this.selectedDate = '';
    this.maxPrice = null;
    this.applyFilters();
  }
}
