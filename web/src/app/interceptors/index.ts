import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ActivityInterceptor } from './activity.interceptor';
import { AuthInterceptor } from './auth.interceptor';
import { HttpConfig } from './http-config.interceptor';

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpConfig, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ActivityInterceptor, multi: true }
];
