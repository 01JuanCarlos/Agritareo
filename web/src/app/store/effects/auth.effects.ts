import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LOGIN_PATH, SECURE_PATH, LOGOUT_API_PATH } from '@app/common/constants';
import { AuthService } from '@app/services/auth-services/auth.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, tap } from 'rxjs/operators';
import { AppActions } from '../actions';
import { PermissionService } from '@app/services/auth-services/permission.service';
import { AppWsClientService } from '@app/services/util-services/app-ws-client.service';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';

@Injectable()
export class AuthEffects {

  toLoginPath$ = createEffect(() => this.actions$.pipe(
    ofType(AppActions.ToLoginPath),
    tap(() => {
      this.router.navigate([LOGIN_PATH]);
    })
  ), { dispatch: false });

  toSecurePath$ = createEffect(() => this.actions$.pipe(
    ofType(AppActions.ToSecurePath),
    tap(() => {
      this.router.navigate([SECURE_PATH]);
    })
  ), { dispatch: false });

  logout$ = createEffect(() => this.actions$.pipe(
    ofType(AppActions.Logout),
    tap(() => {
      this.auth.clearUserSession();
      this.permission.cleanPermissions();
      this.http.get(LOGOUT_API_PATH).subscribe();
      this.ws.close();
      this.router.navigate([LOGIN_PATH]);
    }),
    map(() => AppActions.ClearApp())
  ));

  // , { dispatch: false }


  login$ = createEffect(() => this.actions$.pipe(
    ofType(AppActions.Login),
    tap(() => {
      this.router.navigate([SECURE_PATH]);
    })
  ), { dispatch: false });

  constructor(
    private actions$: Actions,
    private auth: AuthService,
    private router: Router,
    private permission: PermissionService,
    private ws: AppWsClientService,
    private http: AppHttpClientService
  ) { }
}
