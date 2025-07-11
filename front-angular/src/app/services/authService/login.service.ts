import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { firstValueFrom,Observable, of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';


export interface User {
  id: number;
  name: string;
  email: string;
  role: 'participant' | 'organizer' | 'admin';
  created_at: string;
  updated_at: string;
}

// ********************** //

@Injectable({ providedIn: 'root' })
export class LoginService {
  private apiUrl = 'http://localhost:8000/api';
  private csrfTokenUrl= 'http://localhost:8000/sanctum/csrf-cookie'
  user = signal<User | null>(null);
  constructor(private http: HttpClient, private router: Router, private snackBar: MatSnackBar) {}
  getCsrfCookie(): Observable<any> {
    return this.http.get(this.csrfTokenUrl, { withCredentials: true }).pipe(
      catchError(err => {
        console.error('LoginService: Failed to get CSRF cookie.', err);
        return throwError(() => new Error('CSRF cookie acquisition failed.'));
      })
    );
  }
  async fetchCurrentUser(options: { skipCsrfRefresh?: boolean } = {}): Promise<void> {
    let stream$: Observable<User | null>;

    if (options.skipCsrfRefresh) {
      stream$ = this.http.get<User>(`${this.apiUrl}/current-user`, { withCredentials: true });
    } else {
      stream$ = this.getCsrfCookie().pipe(
        switchMap(() => {
          return this.http.get<User>(`${this.apiUrl}/current-user`, { withCredentials: true });
        })
      );
    }

    await firstValueFrom(
      stream$.pipe(
        tap(u => {
          this.user.set(u);
        }),
        catchError((error) => {
          console.error('fetchCurrentUser: Error fetching user, setting user signal to null.', error);
          this.user.set(null);
          return of(null); 
        })
      )
    );
  }
  isLoggedIn(): boolean {
    
    return this.user() !== null;
  }
  login(email: string, password: string) {
    return this.getCsrfCookie()
      .pipe(
        switchMap(() => {
          return this.http.post<{ user: User }>(
            `${this.apiUrl}/login`,
            { email, password },
            { withCredentials: true }
          )
        }),
        tap(response => {
          if (response && response.user) {
            this.user.set(response.user);
          } else {
            console.error('LoginService: Login response missing user data.');
            this.user.set(null); 
            throw new Error('Login response invalid'); 
          }
        }),
        catchError(error => {
          console.error('LoginService: Login pipeline error:', error);
          this.user.set(null); 
          return throwError(() => error); 
        })
      );
  }
  logout() {
    return this.getCsrfCookie().pipe(
      switchMap(() =>
        this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      ),
      tap(() => {
        this.user.set(null);
        this.router.navigate(['/home']);
        this.openSnackBar('Logged out successfully');
      }),
    );
  }
  register(
      name: string,
      email: string,
      password: string,
      role: 'participant' | 'organizer'
  ): Observable<User> {
    return this.getCsrfCookie()
      .pipe(
        switchMap(() => {
          return this.http.post<User>(
            `${this.apiUrl}/register`,
            { name, email, password, role },
            { withCredentials: true }
          );
        }),
        tap(user => {
          this.user.set(user);
        }),
        catchError(error => {
          console.error('LoginService: Registration pipeline error:', error);
          this.user.set(null); 
          return throwError(() => error);
        })
    );
  }
  forgotPassword(email: string) {
    return this.getCsrfCookie().pipe(
      switchMap(() => {
        return this.http.post<{ message: string }>(
          `${this.apiUrl}/forgot-password`,
          { email }
        );
      }),
      catchError(error => {
        console.error('LoginService: Forgot password error:', error);
        return throwError(() => error);
      })
    );
  }
  resetPassword(token: string, password: string, confirm: string) {
    return this.getCsrfCookie().pipe(
      switchMap(() => {
        return this.http.patch<{ message: string }>(
          `${this.apiUrl}/reset-password`,
          { token, password, password_confirmation: confirm },
          { withCredentials: true }
        );
      }),
      catchError(error => {
        console.error('LoginService: Reset password error:', error);
        return throwError(() => error);
      })
    );
  }
  openSnackBar(msg: string = '') {
    this.snackBar.open(msg, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    })
  }


}