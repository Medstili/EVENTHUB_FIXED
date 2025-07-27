import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoginService, User } from '../../../services/authService/login.service';
import { RouterModule, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, takeUntil, Subject, Observable } from 'rxjs';
import { ParticipantService } from '../../../services/participantServer/participant.service';
import { ResponsiveService } from '../../../services/responsive.service';
import { AnimationService } from '../../../services/animation.service';

@Component({
  selector: 'app-participant-edit-account',
  imports: [
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CommonModule
  ],
  animations: [
    AnimationService.pageTransition,
    AnimationService.fadeInUp,
    AnimationService.slideInRight,
    AnimationService.buttonPress
  ],
  templateUrl: './participant-edit-account.component.html',
  styleUrl: './participant-edit-account.component.scss'
})
export class ParticipantEditAccountComponent implements OnInit {

  private fb = inject(FormBuilder);
  private auth = inject(LoginService);
  private ptService = inject(ParticipantService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private location = inject(Location);
  private responsiveService = inject(ResponsiveService);

  user!: User | null;
  private destroy$ = new Subject<void>();
  loading = false;

  // Responsive observables
  isHandset$: Observable<boolean>;


  constructor() {
    // Initialize responsive observables
    this.isHandset$ = this.responsiveService.isHandset$;

  }

  passwordsMatchValidator = (group: AbstractControl): { [key: string]: boolean } | null => {
    const passwordControl = group.get('password');
    const confirmControl = group.get('password_confirmation');

    if (!passwordControl || !confirmControl) {
      return null;
    }

    if (passwordControl.value !== confirmControl.value) {
      confirmControl.setErrors({ passwordsMismatch: true });
      return { passwordsMismatch: true };
    } else {
      if (confirmControl.hasError('passwordsMismatch')) {
        confirmControl.setErrors(null);
      }
      return null;
    }
  };

  accountForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(8)]],
    password_confirmation: [''],
  }, { validator: this.passwordsMatchValidator });

  get name() { return this.accountForm.get('name')!; }
  get email() { return this.accountForm.get('email')!; }

  ngOnInit() {
    const u = this.auth.user();
  
    if (u) {
      this.user = u;
      this.accountForm.patchValue({
        name: u.name,
        email: u.email
      });
    }

    this.accountForm.get('password')?.valueChanges.subscribe(() => {
      this.accountForm.updateValueAndValidity();
    });

    this.accountForm.get('password_confirmation')?.valueChanges.subscribe(() => {
      this.accountForm.updateValueAndValidity();
    });
  }

  onSubmit() {
    if (this.accountForm.invalid) {
      if (this.accountForm.errors?.['passwordsMismatch']) {
        this.openSnackBar('Passwords do not match');
      }
      return;
    }
    this.loading = true;
    const data = this.accountForm.value;
    
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      formData.append(key, val as any);
    });

    formData.append('_method', 'patch');   

    this.ptService.updateUser(formData)
      .pipe(
        finalize(() => {
          this.loading = false; 
        }),
        takeUntil(this.destroy$) 
      )
      .subscribe({
        next: () => {
          if (this.accountForm.get('password')?.value) {  
            this.openSnackBar('Password updated successfully.');       
          } else {
            this.openSnackBar('Profile updated successfully');
            this.accountForm.get('password')?.reset();
            this.accountForm.get('password_confirmation')?.reset();
          }
          this.auth.fetchCurrentUser({ skipCsrfRefresh: true }).then(() => this.user = this.auth.user())
            .then(() => {
              this.goBack();    
            });
        },
        error: (error) => {
          console.error('Update failed:', error);
          this.openSnackBar('Update failed. Please try again.');
        }
      });
  }

  onCancel() {
    this.router.navigate(['/participant-profile/participant-account']);
  }
  
  openSnackBar(msg: string = '') {
    this.snackBar.open(msg, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack() {
    this.location.back();
  }
}
