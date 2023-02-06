import { Component, OnInit } from '@angular/core';
import { APP_URL } from '@app/common/constants';
import { StoreAppState } from '@app/common/interfaces/store/store-state.interface';
import { AppWsClientService } from '@app/services/util-services/app-ws-client.service';
import { selectCompanyConfigurationKey } from '@app/store/selectors/app.selector';
import { select, Store } from '@ngrx/store';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  APP_URL = APP_URL;
  businessName$
  connectionStatus = 2;

  constructor(
    private store: Store<StoreAppState>,
    private wss: AppWsClientService) { }

    ngOnInit() {
    this.businessName$ = this.store.pipe(select(selectCompanyConfigurationKey('business_name')));
    this.wss.connectionStatus.subscribe(status => {
      this.connectionStatus = status;
    });
  }

  update() {
    return Math.random().toString();
  }
}
