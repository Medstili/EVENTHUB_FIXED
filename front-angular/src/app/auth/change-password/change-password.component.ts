import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../services/authService/login.service';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { ResponsiveService } from '../../services/responsive.service';
import { AnimationService } from '../../services/animation.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ 
    CommonModule, 
    ReactiveFormsModule, 
    MatInputModule, 
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  animations: [
    AnimationService.pageTransition,
    AnimationService.fadeInUp,
    AnimationService.fadeInLeft,
    AnimationService.fadeInRight,
    AnimationService.buttonPress,
    AnimationService.spin
  ]
})
export class ChangePasswordComponent implements OnInit {
  form: FormGroup = new FormGroup({});
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  buttonState: 'normal' | 'pressed' = 'normal';

  // Responsive observables
  isHandset$: Observable<boolean>;


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private auth: LoginService,
    private router: Router,
    private snackBar: MatSnackBar,
    private responsiveService: ResponsiveService
  ) {
    // Initialize responsive observables
    this.isHandset$ = this.responsiveService.isHandset$;

  }

  ngOnInit() {
    this.form = this.fb.group({
      token: [''],                  
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', [Validators.required]],
    }, { validators: this.matchPasswords });

    this.route.queryParamMap.subscribe((params: { get: (arg0: string) => any; }) => {
      const tk = params.get('token');
      if (!tk) {
        this.router.navigate(['/login']);
      }
      this.form.get('token')!.setValue(tk);
    });
  }

  matchPasswords(group: FormGroup) {
    return group.get('password')!.value === group.get('confirm')!.value
      ? null : { mismatch: true };
  }

  togglePasswordVisibility(field: 'password' | 'confirm') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  submit() {
    if (this.form.invalid) return;
    
    this.isLoading = true;
    const { token, password, confirm } = this.form.value;
    
    this.auth.resetPassword(token, password, confirm).subscribe({
      next: () => {
        this.isLoading = false;
        this.openSnackBar('Password changed successfully');
        this.router.navigate(['/login']);
      },
      error: (err: { error: { message: any; }; }) => {
        this.isLoading = false;
        console.error('Reset failed', err.error?.message);
        this.openSnackBar('Failed to reset password. Please try again.');
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

