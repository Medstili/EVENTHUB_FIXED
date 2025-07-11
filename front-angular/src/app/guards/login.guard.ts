// src/app/auth/auth.guard.ts
import { inject }           from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/authService/login.service';

export const LoginGuard: CanActivateFn = (_, state) => {
  const auth = inject(LoginService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  return true;
};

