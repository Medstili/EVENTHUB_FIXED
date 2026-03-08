import { APP_INITIALIZER, ApplicationConfig} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { LoginService } from './services/authService/login.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNgxStripe } from 'ngx-stripe';
import { routes } from './app.routes';
import { xsrfInterceptor } from './interceptor/http-interceptor.service';
import {provideNativeDateAdapter} from '@angular/material/core';
import { environment } from '../environments/environment.development';


export const appConfig: ApplicationConfig = {
  providers: [
    provideNgxStripe(environment.stripePublicKey),
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





