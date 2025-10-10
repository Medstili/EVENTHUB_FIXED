import { Component, OnInit }          from '@angular/core';
import { CommonModule }               from '@angular/common';
import { FormBuilder,FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule , Router, ActivatedRoute}               from '@angular/router';
import { MatCardModule }              from '@angular/material/card';
import { MatFormFieldModule }         from '@angular/material/form-field';
import { MatInputModule }             from '@angular/material/input';
import { MatButtonModule }            from '@angular/material/button';
import { LoginService } from '../../services/authService/login.service';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule }   from '@angular/material/progress-spinner';
import { BreakpointObserver , Breakpoints} from '@angular/cdk/layout';
import { firstValueFrom, map, Observable, tap } from 'rxjs';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
    MatIcon,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    AnimationService.fadeInUp,
    AnimationService.slideInRight
  ]
})

export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  returnUrl = '/home';
  loading = false;
  isHandset$: Observable<boolean>
  
  // New properties for modern login form
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private auth: LoginService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private breakPointsObserve: BreakpointObserver
  ) {
    this.isHandset$= this.breakPointsObserve.observe([Breakpoints.Handset])
     .pipe(map(result => result.matches))
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  // New methods for modern login form
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (field.errors['minlength']) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }


  async onSubmit() {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginForm.disable();
    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    try {
      await firstValueFrom(
        this.auth.login(email, password)
        .pipe(
          tap(() => console.log('Login API call successful in login component'))
        )
      )
      console.log('Attempting to fetch current user to confirm session...');
      await this.auth.fetchCurrentUser({ skipCsrfRefresh: true }); 
      
      const user = this.auth.user();
      console.log('onSubmit: User state after fetchCurrentUser:', user);
      if (!user) {
        console.error('Login seemed successful, but session confirmation via fetchCurrentUser failed.');
        this.errorMessage = 'Login confirmation failed. Please try again.';
        this.router.navigateByUrl('/login'); 
        this.isLoading = false;
        return;
      }
      

      const guardUrl = this.route.snapshot.queryParams['returnUrl'];
      if (guardUrl) {
        this.router.navigateByUrl(guardUrl);
        this.isLoading = false;
        return;
      } else {
        const roleRedirectMap: { [key: string]: string } = {
          organizer: '/organizer-profile',
          participant: '/participant-profile',
          admin: '/admin-profile'
        };
        const userRole = user.role; 

        console.log('User role for navigation:', userRole);
        if (userRole && roleRedirectMap[userRole]) {
          this.router.navigateByUrl(roleRedirectMap[userRole]);
          this.isLoading = false;
          return;
        } else {
          console.log('User role not found or invalid, navigating to home.');
          this.router.navigateByUrl('/home');
          this.isLoading = false;
          this.loginForm.enable();
          return;
        }
      }
    } catch (err: any) {
      
      this.loginForm.enable();
      console.error('Login process failed:', err);
      let errorMessage = 'Invalid email or password';
      if (err && err.error && err.error.message) {
        errorMessage = err.error.message;
      } else if (err && err.message) {
        errorMessage = err.message;
      }
      this.errorMessage = errorMessage;
      this.loginForm.setErrors({ invalidLogin: true });
    } finally {
      this.isLoading = false;
      this.loading = this.isLoading; // Keep backward compatibility
      this.loginForm.enable();
    }
  }

  openSnackBar(msg: string = '') {
    this.snackBar.open(msg, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    })
  }

  get email()    { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}