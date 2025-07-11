// src/app/interceptors/xsrf.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandler } from '@angular/common/http';
import { Observable } from 'rxjs';

export const xsrfInterceptor: HttpInterceptorFn =
  (req: HttpRequest<unknown>, next: (req: HttpRequest<unknown>) => Observable<any>): Observable<any> => {
    const rawCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];

    if (rawCookie) {
      const token = decodeURIComponent(rawCookie);
      const cloned = req.clone({
        headers: req.headers.set('X-XSRF-TOKEN', token),
        withCredentials: true
      });
      return next(cloned);
    }
    const clonedNoToken = req.clone({
      withCredentials: true
    });
    return next(clonedNoToken);
  };

