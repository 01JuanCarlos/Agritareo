import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LOGIN_API_PATH, CORPORATION_ID_HEADER } from '@app/common/constants';
import { AppService } from '@app/services/app.service';
import { includes } from 'lodash-es';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private app: AppService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.app.user.userToken; // Obtener el token de usuario.
    const authReq = req.clone({
      setHeaders: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(this.app.user?.corporationId ? { [CORPORATION_ID_HEADER]: this.app.user.corporationId } : {})
      },
    });

    return next.handle(authReq).pipe(tap((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        if (event && includes(event.url, LOGIN_API_PATH) && event.body && !event.body.error) {
          const { data } = event.body;
          // Verificar si el login es válido.
          if (data && data.token) {
            this.app.user.login(data);
            this.app.user.initialize();
            // Cargar configuración inicial del usuario.
            this.app.loadInitialSettings();
          }
        }
      }
      return event;
    }));
  }
}
