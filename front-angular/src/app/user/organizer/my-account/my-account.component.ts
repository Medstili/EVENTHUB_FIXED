import { Component, OnInit, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { LoginService, User } from '../../../services/authService/login.service';
import { RouterModule, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizerService } from '../../../services/organizerServer/organizer.service';
import { ResponsiveService } from '../../../services/responsive.service';
import { AnimationService } from '../../../services/animation.service';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.scss',
  animations: [
    AnimationService.fadeInUp,
    AnimationService.scaleIn
  ]
})
export class MyAccountComponent implements OnInit {
  user: Signal<(User & { created_at: string }) | null>;
  isHandset$: any;
  isTablet$: any;
  isDesktop$: any;

  constructor(
    private auth: LoginService,
    private organizerservice: OrganizerService,
    private router: Router,
    private snackBar: MatSnackBar,
    public responsiveService: ResponsiveService
  ) {
    this.isHandset$ = this.responsiveService.isHandset$;
    this.isTablet$ = this.responsiveService.isTablet$;
    this.isDesktop$ = this.responsiveService.isDesktop$;
    this.user = computed(() => {
      const u = this.auth.user();
      if (u) {
        return { ...u, created_at: u.created_at || new Date().toISOString() };
      }
      return null;
    });
  }

  ngOnInit() {
    if (!this.auth.user()) {
      this.auth.fetchCurrentUser().then(() => {
        const fetchedUser = this.auth.user();
        if (!fetchedUser) {
          this.openSnackBar('Could not load user details. Please try logging in again.');
          this.router.navigate(['/login']);
        }
      }).catch(() => {
        this.openSnackBar('Session expired or invalid. Please log in.');
        this.router.navigate(['/login']);
      });
    }
  }

  onDeleteAccount() {
    const currentUserSnapshot = this.user();
    if (!currentUserSnapshot) {
      this.openSnackBar('User data not available. Cannot delete account.');
      return;
    }
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      this.organizerservice.deleteAccount().subscribe({
        next: () => {
          this.auth.user.set(null);
          this.router.navigate(['/home']);
          this.openSnackBar('Account deleted successfully. You have been logged out.');
        },
        error: () => {
          this.openSnackBar('Error deleting account, try again later');
        }
      });
    }
  }

  openSnackBar(msg: string = '') {
    this.snackBar.open(msg, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
