import { Component, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import {  MatMenuModule } from '@angular/material/menu';
import {MatListModule, MatSelectionListChange} from '@angular/material/list';
import { User } from '../../../services/authService/login.service';
import { AdminService } from '../../../services/adminService/admin.service';
import { ResponsiveService } from '../../../services/responsive.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-users',
  imports: [
    MatFormFieldModule,
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
    MatListModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit{

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['id', 'name', 'email','role'];
  dataSource = new MatTableDataSource<User>([]);
  roles =['participant', 'organizer'];
  users!: User[];
  page: number = 1;
  lastPage: number = 1;
  loading: boolean = false;
  isFilterLoading: boolean = false;
  name: string = '' ;
  email: string = '' ;
  role: string = '';

  // Responsive observables
  isHandset$: Observable<boolean>;

  constructor(
    private responsiveService: ResponsiveService,
    private adminService: AdminService,
    private _liveAnnouncer: LiveAnnouncer,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<User>([]);
    
    // Initialize responsive observables
    this.isHandset$ = this.responsiveService.isHandset$;
  }

  ngOnInit(): void {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'name': return item.name?.toLowerCase() || '';
        case 'email': return item.email?.toLowerCase() || '';
        case 'role': return item.role?.toLowerCase() || '';
        default: return (item as any)[property];
      }
    };
    this.loadUsers();
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

  loadUsers(reset = true) {
    if (reset) {
      this.page = 1;
      this.users = [];
    }
    const filters = this.buildFilters();
    this.loading = true;      
    this.adminService.getAllUsers( filters, this.page).subscribe({
      next: pag => {
        this.users = reset
          ? pag.data
          : this.users.concat(pag.data);
        this.dataSource.data = this.users;
        this.dataSource._updateChangeSubscription();
        this.lastPage = pag.last_page;
        this.loading = false;  
        this.isFilterLoading = false;        
      },
      error: () => {
        this.loading = false;
        this.isFilterLoading = false;
        this.openSnackBar('Error loading users. Please try again.');
      }
    });
  }

  nameSearch(e: Event){
    const input = e.target as HTMLInputElement;
    this.name = input.value;
  }

  emailSearch(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.email = input.value;
  }

  roleSearch(event: MatSelectChange): void {
    this.role = event.value;
  }

  onRoleChange(event: MatSelectionListChange): void {
    const selectedRole = event.options[0]?.value;
    this.role = selectedRole; 
  }

  buildFilters() {
    const f: any = {};

    if (this.name?.trim() !=='') {
      f.name = this.name;
    }
    if (this.email?.trim() !=='') {
      f.email = this.email;
    }
    if (this.role.trim() !== '') {
      f.role = this.role;
    }
    
    return f;
  }

  applyFilter(){
    this.isFilterLoading = true;
    this.loadUsers();
  }

  clearFilters() {
    this.name = '';
    this.email = '';
    this.role = '';
    this.loadUsers();
    this.openSnackBar('Filters cleared');
  }

  loadMore() {
    if (this.page < this.lastPage && !this.loading) {
      this.loading = true;
      this.page++;
      this.loadUsers(false);
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
