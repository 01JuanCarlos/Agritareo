import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TRANSACTION_HEADER } from '@app/common/constants';
import { NotificationService } from '@app/services/util-services/notifications.service';
import { SweetAlertService } from '@app/services/util-services/sweet-alert.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export enum HttpStatusCode {
  OK = 200,
  CREATED,
  ACCEPTED,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED,
  PAYMENT_REQUIRED,
  FORBIDDEN,
  NOT_FOUND,
  INTERNAL_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

@Injectable()
export class HttpConfig implements HttpInterceptor {
  constructor(
    private notification: NotificationService,
    private alert: SweetAlertService,
  ) {
    // FIXME: Corregir por que se usa en la tabla scrollable
    // this.store.dispatch(new FailService(false));
  }


  intercept(rq: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(rq).pipe(tap((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        if (event.headers.has(TRANSACTION_HEADER) && [HttpStatusCode.OK, HttpStatusCode.CREATED, HttpStatusCode.NO_CONTENT].includes(event.status)) {
          if ('error' in (event.body || {})) {
            const error = event.body.error;
            const notiFn = (error.level === 1 ? this.notification.warn : this.notification.error).bind(this.notification);

            if (error?.data?.length) {

              let message = '';
              console.log('aca', error.data);

              error.data.forEach(row => {
                message = message + `${row.formName}: (${row.nRegistros}) REGISTRO${row.nRegistros !== 1 ? 'S' : ''} <br>`;
              });

              notiFn(`${message || event.body.error.message}`, message ? 'Está referenciado en:' : void 0);
            } else {

              let text = `${error.message}`;

              if (error.fields && error.fields.length) {
                text += '<br>';
                text += '<ol>';
                for (const field of error.fields) {
                  text += `<li><b>${field.name}:</b> ${field.tag}</li>`;
                }
                text += '</ol>';
              }

              notiFn(text);
            }
          } else {
            this.notification.success('Operación realizada con éxito');
          }
        }
      }
      return event;
    }, err => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === HttpStatusCode.UNAUTHORIZED || err.status === HttpStatusCode.FORBIDDEN) {
          this.alert.warn('No tiene suficientes privilegios para usar este recurso.');
          // Limpiar sesion de usuario, solo si es la carga inicial ?
          // this.authService.clearUserSession();
        }
        // else {
        //   this.notification.error(err.statusText);
        // }

        // if (HttpStatusCode.NOT_FOUND === err.status) {
        //   this.alert.error('Estás solicitando un recurso que no existe en este servicio.');
        // }

        // FIXME:  Eliminar xd
        // let data = {};
        // switch (err.status) {
        //     case 404:
        //         data = {
        //             status: err.status,
        //             message: err.message,
        //         };
        //         console.log('Error:', data);
        //         break;
        //     default:
        //         this.store.dispatch(new FailService(true));
        //         data = {
        //             status: err.status,
        //             message: err.message,
        //         };
        //         console.log('Error: ', data);
        //         return;
        // }
      }
    })
    );
  }
}
