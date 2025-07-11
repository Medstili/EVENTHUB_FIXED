import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoginService, User } from '../../../services/authService/login.service';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { ResponsiveService } from '../../../services/responsive.service';
import { AnimationService } from '../../../services/animation.service';

@Component({
  selector: 'app-account',
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule
  ],
  animations: [
    AnimationService.pageTransition,
    AnimationService.fadeInUp,
    AnimationService.cardHover,
    AnimationService.buttonPress
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {

  user!: User & { created_at: string };
  
  // Responsive observables
  isMobile$: Observable<boolean>;
  isTablet$: Observable<boolean>;
  isSmallScreen$: Observable<boolean>;
  containerPadding$: Observable<string>;
  headerLayout$: Observable<'row' | 'column'>;
  responsiveSpacing$: Observable<string>;
  responsiveFontSize$: Observable<string>;
  cardLayout$: Observable<'compact' | 'comfortable'>;

  constructor(
    private auth: LoginService,
    private snackBar: MatSnackBar,
    private responsiveService: ResponsiveService,
    private router: Router
  ) {
    // Initialize responsive observables
    this.isMobile$ = this.responsiveService.isMobile$;
    this.isTablet$ = this.responsiveService.isTablet$;
    this.isSmallScreen$ = this.responsiveService.isSmallScreen$;
    this.containerPadding$ = this.responsiveService.getContainerPadding();
    this.headerLayout$ = this.responsiveService.getHeaderLayout();
    this.responsiveSpacing$ = this.responsiveService.getResponsiveSpacing();
    this.responsiveFontSize$ = this.responsiveService.getResponsiveFontSize();
    this.cardLayout$ = this.responsiveService.getCardLayout();
  }

  ngOnInit() {
    const currentUserSnapshot = this.auth.user();
    if (!currentUserSnapshot) {
      this.auth.fetchCurrentUser({ skipCsrfRefresh: true }).then(() => {
        const fetchedUser = this.auth.user();
        if (fetchedUser) {
          this.user = { ...fetchedUser, created_at: fetchedUser.created_at || new Date().toISOString() };
        } else {
          console.error(`${this.constructor.name}: Failed to fetch user after attempting. User is null.`);
          this.openSnackBar('Could not load user details. Please try logging in again.');
          this.router.navigate(['/login']);
        }
      }).catch((error) => {
        console.error(`${this.constructor.name}: Error fetching current user:`, error);
        this.openSnackBar('Session expired or invalid. Please log in.');
        this.router.navigate(['/login']);
      });
    } else {
      this.user = { ...currentUserSnapshot, created_at: currentUserSnapshot.created_at || new Date().toISOString() };
    }
  }
  
  openSnackBar(msg: string = '') {
    this.snackBar.open(msg, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  onDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.openSnackBar('Account deletion feature not implemented yet.');
    }
  }

  onCardHover(event: any, state: 'normal' | 'hovered') {
    // Card hover animation handled by @cardHover trigger
  }
}
