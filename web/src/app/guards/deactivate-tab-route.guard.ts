import { Injectable } from '@angular/core';
import { CanDeactivate, RouterStateSnapshot, ActivatedRouteSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { GetMetaOptions } from '@app/common/utils/get-meta.util';
import { Store, select } from '@ngrx/store';
import { StoreAppState } from '@app/common/interfaces/store';
import { GetWindowTabs } from '@app/store/selectors/wintab.selector';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DeactivateTabRouteGuard implements CanDeactivate<Observable<unknown>> {
  constructor(private store: Store<StoreAppState>) { }

  canDeactivate(
    component: any,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    // const options = GetMetaOptions(currentRoute.component, true);
    // console.log('se llama el metodo');
    return new Promise((resolve) => {
      this.store
        .pipe(
          select(GetWindowTabs),
          take(1)
        )
        .subscribe(val => {
          const redirect = val.some(it => it.active && (it.mode === 'CREATE'));
          let confirmation = true;
          if (redirect) {
            confirmation = window.confirm('Se encuentra modificando datos, ¿Desea irse?');
          }
          resolve(confirmation);
        });
    });
  }

}
