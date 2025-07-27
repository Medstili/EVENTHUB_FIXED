import { Component, computed, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { LoginService, User } from '../../../services/authService/login.service';
import { RouterModule, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { ParticipantService } from '../../../services/participantServer/participant.service';
import { ResponsiveService } from '../../../services/responsive.service';
import { AnimationService } from '../../../services/animation.service';

@Component({
  selector: 'app-participant-account',
  imports: [
    RouterModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule
  ],
  animations: [
    AnimationService.pageTransition,
    AnimationService.fadeInUp,
    AnimationService.cardHover,
    AnimationService.buttonPress
  ],
  templateUrl: './participant-account.component.html',
  styleUrl: './participant-account.component.scss'
})
export class ParticipantAccountComponent implements OnInit {
  user: Signal<(User & { created_at: string }) | null>;

  // Responsive observables
  isHandset$: Observable<boolean>;

  constructor(
    private auth: LoginService,
    private ptService: ParticipantService,
    private router: Router,
    private snackBar: MatSnackBar,
    private responsiveService: ResponsiveService
  ) {
    // Initialize responsive observables
    this.isHandset$ = this.responsiveService.isHandset$;

    this.user = computed(() => {
      const u = this.auth.user();
      if (u) {
        return { ...u, created_at: u['created_at'] || new Date().toISOString() };
      }
      return null;
    });
  }

  ngOnInit() {
    const currentUserSnapshot = this.user();
    if (!currentUserSnapshot) {
      this.auth.fetchCurrentUser().then(() => {
        const fetchedUser = this.auth.user();
        if (!fetchedUser) {
          this.openSnackBar('Could not load user details. Please try logging in again.');
          this.router.navigate(['/login']);
        }
      }).catch((error) => {
        console.error(`${this.constructor.name}: Error fetching current user (ngOnInit):`, error);
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
      this.ptService.deleteAccount().subscribe({
        next: () => {
          this.auth.user.set(null);
          this.router.navigate(['/home']);
          this.openSnackBar('Account deleted successfully');
        },
        error: (err) => {
          console.error('ParticipantAccountComponent: Error deleting account from service:', err);
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
