import { Injectable } from '@angular/core';
import { PKEY } from '@app/common/constants';
import { StoreAppState } from '@app/common/interfaces/store';
import { PersistenceService } from '@app/services/util-services/persistence.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { concatMap, tap, withLatestFrom } from 'rxjs/operators';
import { AppActions } from '../actions';

@Injectable()
export class AppEffects {

  module$ = createEffect(() => this.actions$.pipe(
    ofType(AppActions.SetCurrentModule),
    concatMap(action => of(action).pipe(
      withLatestFrom(this.store.select('app'))
    )),
    tap(([, app]) => {
      const module = app.currentModule || { id: undefined };
      this.persistence.set(PKEY.CURRENT_MODULE, module);
      this.persistence.set(PKEY.MODULE_ID, module.id);
    })
  ), { dispatch: false });


  // Loading module effects
  // loadingModuleStart$ = createEffect(() => this.actions$.pipe(
  //   ofType(AppActions.ShowLoadingModule),
  //   tap(action => {
  //     if (action.status) {
  //       this.blockui.show();
  //     } else {
  //       this.blockui.hide();
  //     }
  //   })
  // ), { dispatch: false });

  // LoadingModuleMessage$ = createEffect(() => this.actions$.pipe(
  //   ofType(AppActions.LoadingModuleMessage),
  //   tap(action => {
  //     this.blockui.setMessage(action.message, action.type, action.icon);
  //   })
  // ), { dispatch: false });


  UpdateLanguage$ = createEffect(() => this.actions$.pipe(
    ofType(AppActions.SetCurrentLanguage),
    tap(action => {
      this.persistence.set(PKEY.LANGUAGE, action.language);
      this.translate.use(action.language);
    })
  ), { dispatch: false });




  constructor(
    private actions$: Actions,
    // private blockui: BlockUIService,
    private persistence: PersistenceService,
    private store: Store<StoreAppState>,
    private translate: TranslateService
  ) { }
}
