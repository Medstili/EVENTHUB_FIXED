import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule, MatSelectionListChange } from '@angular/material/list';
import { Ticket } from '../../../services/ticketService/tickets.service';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../../services/adminService/admin.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ResponsiveService } from '../../../services/responsive.service';
import { AnimationService } from '../../../services/animation.service';

@Component({
  selector: 'app-tickets',
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
    MatProgressSpinnerModule,
    MatIconModule,
    MatMenuModule,
    MatListModule,
    RouterModule,
    MatTooltipModule
  ],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.scss',
  animations: [
    AnimationService.fadeInUp,
    AnimationService.cardHover,
    AnimationService.buttonPress,
    AnimationService.pageTransition,
    AnimationService.slideInUp
  ]
})
export class TicketsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;
  @ViewChild('dateInput') dateInput!: ElementRef<HTMLInputElement>;
  
  displayedColumns: string[] = ['id', 'event', 'participant', 'status', 'price', 'created_at', 'actions'];
  dataSource = new MatTableDataSource<Ticket>([]);
  tickets!: Ticket[];
  page: number = 1;
  lastPage: number = 1;
  loading: boolean = false;
  isFilterLoading: boolean = false;
  title: string = '';
  date = signal<string | null>(null);
  
  // Filter variables that are applied when button is clicked
  appliedTitle: string = '';
  appliedDate: string | null = null;
  appliedStatus: string | null = null;
  
  // Status options for filtering
  statusOptions = [
    { value: null, label: 'All Statuses' },
    { value: 'valide', label: 'Valide' },
    { value: 'invalide', label: 'Invalide' }
  ];
  
  selectedStatus: string | null = null;
  
  // Responsive observables
  isHandset$: Observable<boolean>;



  constructor(
    private adminService: AdminService,
    private _liveAnnouncer: LiveAnnouncer,
    private responsiveService: ResponsiveService,
    private route: Router,
    private snackBar: MatSnackBar,
  ) {
    this.dataSource = new MatTableDataSource<Ticket>([]);
  
    // Initialize responsive observables
    this.isHandset$ = this.responsiveService.isHandset$;
  }

  ngOnInit(): void {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'price': 
          return item.price;
        case 'created_at':
          return new Date(item.created_at).getTime(); 
        case 'participant': 
          return item.user?.name || '';
        case 'event': 
          return item.event?.title || '';
        case 'status':
          return item.status || '';
        default:
          return (item as any)[property]; 
      }
    };
    this.loadTickets();
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

  loadTickets(reset = true) {
    if (reset) {
      this.page = 1;
      this.tickets = [];
    }
    const filters = this.buildFilters();
    this.loading = true;      
    this.adminService.getAllTickets(filters, this.page).subscribe({
      next: pag => {
        this.tickets = reset
          ? pag.data
          : this.tickets.concat(pag.data);
        this.dataSource.data = this.tickets;
        this.dataSource._updateChangeSubscription();
        this.lastPage = pag.last_page;
        this.loading = false;  
        this.isFilterLoading = false;        
      },
      error: () => {
        this.loading = false;
        this.isFilterLoading = false;
        this.openSnackBar('Error loading tickets. Please try again.');
      }
    });
  }

  loadMore() {
    if (this.page < this.lastPage && !this.loading) {
      this.loading = true;
      this.page++;
      this.loadTickets(false);
    }
  }
 
  buildFilters() {
    const f: any = {};

    if (this.appliedTitle?.trim() !== '') {
      f.title = this.appliedTitle.trim();
    }
    if (this.appliedDate !== null) {
      f.date = this.appliedDate;
    }
    if (this.appliedStatus !== null) {
      f.status = this.appliedStatus;
    }
    
    return f;
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

  onStatusChange(event: MatSelectionListChange): void {
    const selectedStatus = event.options[0]?.value;
    this.selectedStatus = selectedStatus;
  }

  applyFilter() {
    this.isFilterLoading = true;
    
    // Copy current filter values to applied values
    this.appliedTitle = this.title;
    this.appliedDate = this.date();
    this.appliedStatus = this.selectedStatus;
    
    this.loadTickets();
  }

  clearFilters() {
    this.title = '';
    this.date.set(null);
    this.selectedStatus = null;
    
    // Reset applied filters
    this.appliedTitle = '';
    this.appliedDate = null;
    this.appliedStatus = null;
    
    // Clear the input fields
    if (this.titleInput) {
      this.titleInput.nativeElement.value = '';
    }
    if (this.dateInput) {
      this.dateInput.nativeElement.value = '';
    }
    this.loadTickets();
    this.openSnackBar('Filters cleared');
  }

  goTicketDetails(id: number) {
    this.route.navigate(['/admin-profile/admin-tickets/admin-ticket-details', id]);
  }

  cancelTicket(id: number) {
    if (confirm('Are you sure you want to cancel this ticket? This action cannot be undone.')) {
      this.adminService.cancelTicket(id).subscribe({
        next: () => {
          this.loadTickets();
          this.openSnackBar('Ticket cancelled successfully');
        },
        error: (err) => {
          this.openSnackBar('Error cancelling ticket. Please try again.');
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'valide':
        return 'status-confirmed';
      case 'invalide':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  getStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'valide':
        return 'check_circle';
      case 'invalide':
        return 'cancel';
      default:
        return 'help';
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
