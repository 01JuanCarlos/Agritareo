import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { StoreAppState } from '@app/common/interfaces/store';
import { AppActions } from '@app/store/actions';
import { selectCompanyModules } from '@app/store/selectors/app.selector';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable()
export class ModuleResolver implements Resolve<any> {
  constructor(
    private store: Store<StoreAppState>
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return new Observable(subject => {
      this.store
        .pipe(
          select(selectCompanyModules),
          filter(modules => modules.length > 0),
          map(modules => {
            return modules.find(module => module.path === (route.routeConfig.path || '/'));
          })
        ).subscribe(module => {
          this.store.dispatch(AppActions.SetCurrentModule({ module }));
          subject.next(module);
          subject.complete();
        });
    });
  }

}
