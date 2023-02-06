import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class ViewEffects {
  // @Effect()
  // loadViews$ = this.actions$.pipe(
  //   ofType(EViewAction.GetRouterView),
  //   mergeMap( () => )
  // )
  constructor(private actions$: Actions) {}

}
