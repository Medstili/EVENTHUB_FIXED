import { APP_INITIALIZER, ApplicationConfig} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { LoginService } from './services/authService/login.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNgxStripe } from 'ngx-stripe';
import { routes } from './app.routes';
import { xsrfInterceptor } from './interceptor/http-interceptor.service';
import {provideNativeDateAdapter} from '@angular/material/core';


export const appConfig: ApplicationConfig = {
  providers: [
    provideNgxStripe('pk_test_51RLlQpPs2SHkVzVrns5s7yEcKrQ3cnTDjUAwanju53MP5PO8siSq1DWOWB2VKTKXXoyHBOeCbA3wENbp1rmuu06f00w5eKykk7'),
    provideAnimations(),
    provideNativeDateAdapter(),
    provideHttpClient(
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
      withInterceptors([xsrfInterceptor])
    ),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: LoginService) => () => auth.fetchCurrentUser(),
      deps: [LoginService],
      multi: true
    },
  ]
};





