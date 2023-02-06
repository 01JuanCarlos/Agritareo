import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, RouterStateSnapshot } from '@angular/router';
import { CompanyComponent } from '@app/common/interfaces';
import { StoreAppState } from '@app/common/interfaces/store/store-state.interface';
import { GetMetaOptions } from '@app/common/utils/get-meta.util';
import { WinTabActions } from '@app/store/actions';
import { selectCompanyComponents } from '@app/store/selectors/app.selector';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root'
})
export class TabsRouteGuard implements CanActivateChild {
  constructor(private store: Store<StoreAppState>) { }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (route.component) {
      const options = GetMetaOptions(route.component, true);
      if (route && options.id && options.isDocument) {
        this.store.select(selectCompanyComponents).subscribe(data => {
          const nscomponent = data.find(c => c.fullPath === state.url) || {} as CompanyComponent;
          this.store.dispatch(WinTabActions.RegisterWindow({
            id: options.id,
            url: state.url,
            title: options.title || nscomponent.label || route.routeConfig.path,
            icon: options.icon || nscomponent.icon,
            layout: options.layout
          }));
        });
      }
    }
    return true;
  }
}
