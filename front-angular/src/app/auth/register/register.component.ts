// src/app/auth/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { LoginService } from '../../services/authService/login.service';
import { MatIcon } from '@angular/material/icon';
import { AnimationService } from '../../services/animation.service';

export const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const pw = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { passwordsMismatch: true } : null;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatSelectModule,
    MatIcon,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  animations: [
    AnimationService.fadeInUp,
    AnimationService.slideInLeft,
    AnimationService.staggerFadeIn
  ]
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: LoginService,
    private router: Router
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  get fullName() { return this.registerForm.get('full_name')!; }
  get email() { return this.registerForm.get('email')!; }
  get password() { return this.registerForm.get('password')!; }
  get confirm() { return this.registerForm.get('confirmPassword')!; }
  get role() { return this.registerForm.get('role')!; }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.registerForm.disable();
      const { full_name, email, password, role } = this.registerForm.value;
      
      this.auth.register(full_name, email, password, role)
        .subscribe({
          next: () => {
            this.router.navigate(['/home']);
            this.isLoading = false;
            this.registerForm.enable();

          },
          error: (err) => {
            this.isLoading = false;
            this.registerForm.enable();
            if (err.status === 422 && err.error.email_errors && err.error.email_errors.length > 0) {
              console.log(err.error.email_errors);
              this.email.setErrors({ serverError: err.error.email_errors[0] });
            } else {
              console.error('Registration failed', err);
            }
          }
        });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
