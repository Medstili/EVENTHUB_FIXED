import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginService } from '../../services/authService/login.service';
import { ResponsiveService } from '../../services/responsive.service';
import { Observable } from 'rxjs';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule,
    MatIconModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  animations: [
    AnimationService.fadeInUp,
    AnimationService.slideInLeft,
    AnimationService.staggerFadeIn
  ]
})
export class ForgotPasswordComponent implements OnInit {
  forgetPasswordForm!: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Responsive properties
  isHandset$: Observable<boolean>;
  isMobile$: Observable<boolean>;
  // isDesktop$: Observable<boolean>;

  constructor(
    private auth: LoginService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private responsiveService: ResponsiveService
  ) {
    // Initialize responsive observables
    this.isHandset$ = this.responsiveService.isHandset$;
    this.isMobile$ = this.responsiveService.isMobile$;
    // this.isDesktop$ = this.responsiveService.isDesktop$;
  }

  ngOnInit(): void {
    this.forgetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit(formValue: any) {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.auth.forgotPassword(formValue.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Reset password link sent successfully to your email';
        this.openSnackBar('Reset password link email sent successfully');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: err => {
        this.isLoading = false;
        console.error('Reset password failed:', err.error?.message || err);
        this.errorMessage = err.error?.message || 'Failed to send reset link. Please try again.';
        this.openSnackBar('Reset password failed');
      }
    });
  }

  openSnackBar(msg: string = '') {
    this.snackBar.open(msg, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
