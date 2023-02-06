import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { COMPONENT_ID_HEADER, ID_FIELD, TRANSACTION_HEADER } from '@app/common/constants';
import { UserService } from '@app/services/user.service';
import { Activity, ActivityService } from '@app/services/util-services/activity.service';
import { HttpMethods } from '@app/services/util-services/app-http-client.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpStatusCode } from './http-config.interceptor';

@Injectable()
export class ActivityInterceptor implements HttpInterceptor {

  transactions = new Map<string, Activity>();

  constructor(
    private activities: ActivityService,
    private user: UserService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.headers.has(TRANSACTION_HEADER)) {
      const body = req.body || {};
      const transactionUid = req.headers.get(TRANSACTION_HEADER);
      const componentid = req.headers.get(COMPONENT_ID_HEADER);

      if (req.method !== HttpMethods[HttpMethods.POST]) {
        const urlSplit = req.url.split('/');
        const id = urlSplit[urlSplit.length - 1];
        // body[ID_FIELD] = id;
      }

      this.transactions.set(req.headers.get(TRANSACTION_HEADER), {
        type: req.method,
        time: Date.now(),
        id: body[ID_FIELD],
        transaction_id: transactionUid,
        componentid,
        userid: this.user.userId
      });
    }

    return next.handle(req).pipe(tap((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse && event.headers.has(TRANSACTION_HEADER)) {
        const transactionId = req.headers.get(TRANSACTION_HEADER);
        const eventBody = event.body || {};

        if (event.status === HttpStatusCode.NO_CONTENT || (
          (event.status === HttpStatusCode.OK || event.status === HttpStatusCode.CREATED) && !eventBody.error
        )) {
          if (this.transactions.has(transactionId)) {
            const body = this.transactions.get(transactionId);
            if (!body.id) {
              body.id = eventBody.data ? ('object' === typeof eventBody.data ? eventBody.data.id : eventBody.data) : void 0;
            }

            this.activities.addActivity(body);
          }
        }
        this.transactions.delete(transactionId);
      }
      return event;
    }));
  }
}
