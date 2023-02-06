import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { StoreAppState } from '@app/common/interfaces/store/store-state.interface';

@Injectable({
  providedIn: 'root'
})
export class DeactivateViewGuard implements CanDeactivate<any> {
  constructor(private store: Store<StoreAppState>) { }

  canDeactivate(view: any, currentRoute: ActivatedRouteSnapshot) {
    if (view && view.__isComponent) {
      // console.log('view: ', view);
      // console.log('currentRoute: ', currentRoute);
    }
    return true;
  }
}
