import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';

@Injectable()
export class AppThemeEffect {
  constructor(private actions$: Actions) { }

  // @Effect()
  // public changeAppTheme$ = createEffect(() => this.actions$.pipe())
}
