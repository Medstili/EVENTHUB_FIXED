import { Component, OnInit, Signal, computed } from '@angular/core';
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
import { finalize, takeUntil } from 'rxjs';
import { ResponsiveService } from '../../../services/responsive.service';
import { AnimationService } from '../../../services/animation.service';
import { OrganizerService } from '../../../services/organizerServer/organizer.service';

@Component({
  selector: 'app-edit-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './edit-account.component.html',
  styleUrl: './edit-account.component.scss',
  animations: [
    AnimationService.fadeInUp,
    AnimationService.scaleIn
  ]
})
export class EditAccountComponent implements OnInit {
  user: Signal<User | null>;
  isHandset$: any;

  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: LoginService,
    private organizerservice: OrganizerService,
    private router: Router,
    private snackBar: MatSnackBar,
    private location: Location,
    public responsiveService: ResponsiveService
  ) {
    this.isHandset$ = this.responsiveService.isHandset$;
    this.user = computed(() => this.auth.user());
    
    this.accountForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(8)]],
      password_confirmation: [''],
    }, { validators: this.passwordsMatchValidator });
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

  accountForm: any;

  ngOnInit() {
    const currentUser = this.user();
    if (currentUser) {
      this.accountForm.patchValue({
        name: currentUser.name,
        email: currentUser.email
      });
    }

    // Watch for password changes to trigger validation
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

    formData.append('_method', 'PATCH');

    this.organizerservice.updateAccount(formData)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
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
          this.auth.fetchCurrentUser({ skipCsrfRefresh: true }).then(() => {
            this.goBack();
          });
        },
        error: () => {
          this.openSnackBar('Update failed. Please try again.');
        }
      });
  }

  onCancel() {
    this.router.navigate(['/organizer-profile/account']);
  }

  openSnackBar(msg: string = '') {
    this.snackBar.open(msg, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  goBack() {
    this.location.back();
  }

  get name() { return this.accountForm.get('name')!; }
  get email() { return this.accountForm.get('email')!; }
}
