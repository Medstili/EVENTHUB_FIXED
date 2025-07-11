import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EventService, Event as MyEvent } from '../services/eventService/event.service';
import { EventCardComponent } from '../event-card/event-card.component';
import { CategoryComponent } from './filter/category/category.component';
import { Category, CategoryService } from '../services/categoryService/category.service';
import { IsPublicOrNotComponent } from './filter/is-public-or-not/is-public-or-not.component';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { ResponsiveService } from '../services/responsive.service';
import { AnimationService } from '../services/animation.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    EventCardComponent,
    IsPublicOrNotComponent,
    CategoryComponent,
    MatButtonModule,
    MatProgressSpinner,
    MatIconModule,
    MatDivider,
    MatMenuModule
],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    AnimationService.fadeInUp,
    AnimationService.staggerFadeIn,
    AnimationService.cardHover,
    AnimationService.slideInLeft,
    AnimationService.slideInRight,
    AnimationService.imageHover,
    AnimationService.buttonPress
  ]
})
export class HomeComponent implements OnInit {
  featuredEvents: MyEvent[] = [];
  categories: Category[] = [];
  selectedCategory = signal<Category | null>(null);
  publicOnly = signal<boolean | null>(null);
  page = 1;
  lastPage = 1;
  loading = false;
  loadingMore = false;
  
  // Latest event for hero section
  latestEvent: MyEvent | null = null;
  loadingLatestEvent = false;
  
  // Hero image hover state
  heroImageHoverState: 'normal' | 'hovered' = 'normal';
  
  // Responsive observables
  isMobile$: Observable<boolean>;
  isTablet$: Observable<boolean>;
  isDesktop$: Observable<boolean>;

  // Hover states for feature cards
  hoveredCardIndex: number | null = null;

  // Button state for animations
  buttonState: 'normal' | 'pressed' = 'normal';

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService,
    private responsiveService: ResponsiveService,
    private router: Router
  ) {
    this.isMobile$ = this.responsiveService.isMobile$;
    this.isTablet$ = this.responsiveService.isTablet$;
    this.isDesktop$ = this.responsiveService.isDesktop$;
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadEvents(true);
    this.loadLatestEvent();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe(cats => this.categories = cats);
  }

  loadLatestEvent(): void {
    this.loadingLatestEvent = true;
    this.eventService.getLatestEvent().subscribe({
      next: (event) => {
        this.latestEvent = event;
        this.loadingLatestEvent = false;
      },
      error: () => {
        this.loadingLatestEvent = false;
      }
    });
  }

  buildFilters(): Record<string, any> {
    const filters: Record<string, any> = {};
    if (this.selectedCategory()) {
      filters['category'] = this.selectedCategory()!.id;
    }
    if (this.publicOnly() !== null) {
      filters['is_public'] = this.publicOnly()! ? 1 : 0;
    }
    return filters;
  }

  loadEvents(reset = true): void {
    if (reset) {
      this.page = 1;
      this.featuredEvents = [];
      this.loading = true;
    } else {
      this.loadingMore = true;
    }
    
    const filters = this.buildFilters();

    this.eventService.getAll(filters, this.page).subscribe({
      next: pag => {
        this.featuredEvents = reset
          ? pag.data
          : this.featuredEvents.concat(pag.data);
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

  onCategorySelected(cat: Category): void {
    this.selectedCategory.set(
      this.selectedCategory()?.id === cat.id ? null : cat
    );
    this.loadEvents(true);
  }

  onPublicFilter(val: boolean | null): void {
    this.publicOnly.set(val);
    this.loadEvents(true);
  }

  loadMore(): void {
    if (this.page < this.lastPage && !this.loading && !this.loadingMore) {
      this.page++;
      this.loadEvents(false);
    }
  }

  // Animation state helpers
  getCardHoverState(index: number): string {
    return this.hoveredCardIndex === index ? 'hovered' : 'normal';
  }

  onCardMouseEnter(index: number): void {
    this.hoveredCardIndex = index;
  }

  onCardMouseLeave(): void {
    this.hoveredCardIndex = null;
  }

  onHeroImageMouseEnter(): void {
    this.heroImageHoverState = 'hovered';
  }

  onHeroImageMouseLeave(): void {
    this.heroImageHoverState = 'normal';
  }

  goToDetails(): void {
    this.router.navigate(['/events', this.latestEvent?.id]);
  }

  scrollToEvents(): void {
    const eventsSection = document.getElementById('events-section');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}



