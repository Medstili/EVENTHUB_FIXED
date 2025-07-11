import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { Event as MyEvent } from '../../../services/eventService/event.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { CategoryService } from '../../../services/categoryService/category.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import {  MatMenuModule } from '@angular/material/menu';
import {MatListModule, MatSelectionListChange} from '@angular/material/list';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../services/adminService/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResponsiveService } from '../../../services/responsive.service';

@Component({
  selector: 'app-events',
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    MatSelectModule,
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinner,
    MatIconModule,
    MatMenuModule,
    MatListModule,
    RouterModule,
    MatTooltipModule
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  displayedColumns = ['id', 'title', 'location', 'date', 'capacity', 'public', 'price', 'actions'];	
  dataSource: MatTableDataSource<MyEvent>;
  events!: MyEvent[];
  page: number = 1;
  lastPage: number = 1;
  loading: boolean = false;
  isFilterLoading: boolean = false;
  categories: any[] = [];
  
  isPublicOptions = [
    { value: null, label: 'All Events' },
    { value: true, label: 'Public Only' },
    { value: false, label: 'Private Only' }
  ];
  
  selectedCategory: number | null = null;
  publicOnly: boolean | null = null;
  title: string = '';
  date = signal<string | null>(null);
  
  // Responsive observables
  isHandset$: Observable<boolean>;
  isTablet$: Observable<boolean>;
  isMobile$: Observable<boolean>;
  isSmallScreen$: Observable<boolean>;
  filterGridColumns$: Observable<string>;
  containerPadding$: Observable<string>;
  tableMinWidth$: Observable<string>;
  headerLayout$: Observable<'row' | 'column'>;
  filterActionsVisible$: Observable<boolean>;

  constructor(
    private adminService: AdminService,
    private categoryService: CategoryService,
    private _liveAnnouncer: LiveAnnouncer,
    private responsiveService: ResponsiveService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<MyEvent>([]);
    
    // Initialize responsive observables
    this.isHandset$ = this.responsiveService.isHandset$;
    this.isTablet$ = this.responsiveService.isTablet$;
    this.isMobile$ = this.responsiveService.isMobile$;
    this.isSmallScreen$ = this.responsiveService.isSmallScreen$;
    this.filterGridColumns$ = this.responsiveService.getFilterGridColumns();
    this.containerPadding$ = this.responsiveService.getContainerPadding();
    this.tableMinWidth$ = this.responsiveService.getTableMinWidth();
    this.headerLayout$ = this.responsiveService.getHeaderLayout();
    this.filterActionsVisible$ = this.responsiveService.getFilterActionsVisible();
  }

  ngOnInit(): void {    
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'capacity': return item.capacity;
        case 'date': return new Date(item.date).getTime();
        case 'price': return parseFloat(item.price);
        case 'location': return item.location?.toLowerCase() || '';
        case 'public': return item.is_public ? 1 : 0;
        case 'title': return item.title?.toLowerCase() || '';
        default: return (item as any)[property];
      }
    };
    this.loadEvents();  
    this.loadCategories();    
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.paginator.page.subscribe(() => {
      if (this.paginator.pageIndex + 1 === this.paginator.getNumberOfPages()) {
        this.loadMore(); 
      }
    });
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: (err) => {
        this.openSnackBar('Error loading categories');
      }
    });
  }

  loadEvents(reset = true) {
    if (reset) {
      this.page = 1;
      this.events = [];
    }
    
    const filters = this.buildFilters();
    this.loading = true;      
    
    this.adminService.getAllEvents(filters, this.page).subscribe({
      next: (pag) => {
        this.events = reset
          ? pag.data
          : this.events.concat(pag.data);
        this.dataSource.data = this.events;
        this.dataSource._updateChangeSubscription();
        this.lastPage = pag.last_page;
        this.loading = false;  
        this.isFilterLoading = false;  
      },
      error: (err) => {
        this.loading = false;
        this.isFilterLoading = false;
        this.openSnackBar('Error loading events. Please try again.');
      }
    });
  }

  loadMore() {
    if (this.page < this.lastPage && !this.loading) {
      this.loading = true;
      this.page++;
      this.loadEvents(false);
    }
  }

  buildFilters() {
    const filters: any = {};
    
    if (this.selectedCategory) {
      filters.category = this.selectedCategory;
    }
    
    if (this.publicOnly !== null) {
      filters.is_public = this.publicOnly ? 1 : 0;
    } 
    
    if (this.title?.trim() !== '') {
      filters.title = this.title.trim();
    }
    
    if (this.date() !== null) {
      filters.date = this.date();
    }
    
    return filters;
  }

  titleSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.title = input.value;
  }

  dateSelected(event: MatDatepickerInputEvent<Date> | null) {
    if (event && event.value) {
      const d = event.value;
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const yy = String(d.getFullYear());
      const formatted = `${yy}-${mm}-${dd}`;
      this.date.set(formatted);
    } else {
      this.date.set(null);
    }
  }

  applyFilter() {
    this.isFilterLoading = true;
    this.loadEvents();
  }

  clearFilters() {
    this.selectedCategory = null;
    this.publicOnly = null;
    this.title = '';
    this.date.set(null);
    this.loadEvents();
    this.openSnackBar('Filters cleared');
  }

  onCategoryChange(event: MatSelectionListChange): void {
    const selectedCategoryId = event.options[0]?.value;
    this.selectedCategory = selectedCategoryId; 
  }

  onPrivacyChange(event: MatSelectionListChange): void {
    const publicOnlyValue = event.options[0]?.value;
    this.publicOnly = publicOnlyValue; 
  }

  goEventDetails(id: number) {
    this.route.navigate(['admin-event-details', id], { relativeTo: this.activatedRoute });
  }

  addEvent() {
    this.route.navigateByUrl('admin-profile/admin-events/admin-add-event');
  }

  deleteEvent(id: number) {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {      
      this.adminService.deleteEvent(id).subscribe({
        next: () => {
          this.loadEvents();
          this.openSnackBar('Event deleted successfully');
        },
        error: (err) => {
          this.openSnackBar('Error deleting event. Please try again.');
        }
      });
    }
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
