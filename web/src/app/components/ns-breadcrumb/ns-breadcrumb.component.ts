import { Component } from '@angular/core';
import { StoreAppState } from '@app/common/interfaces/store';
import { selectComponentByPath } from '@app/store/selectors/app.selector';
import { select, Store } from '@ngrx/store';
import { flatMap } from 'rxjs/operators';

@Component({
  selector: 'ns-breadcrumb',
  templateUrl: './ns-breadcrumb.component.html',
  styleUrls: ['./ns-breadcrumb.component.scss']
})

export class NsBreadcrumbComponent {
  breadcrumbs$


  constructor(private store: Store<StoreAppState>) { }

  ngOnInit() {
      this.breadcrumbs$ = this.store.pipe(
      select('router', 'state', 'url'),
      flatMap(url => this.store.pipe(select(selectComponentByPath(url.split('/')))))
    );
  }
}
