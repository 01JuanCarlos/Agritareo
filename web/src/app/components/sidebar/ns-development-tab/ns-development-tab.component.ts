import { Component, NgModule, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PKEY } from '@app/common/constants/persistence.constants';
import { FormControlsModule } from '@app/components/form-controls/form-controls.module';
import { PersistenceService } from '@app/services/util-services/persistence.service';
import { CommonModule } from '@angular/common';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';

@Component({
  selector: 'ns-development-tab',
  templateUrl: './ns-development-tab.component.html',
  styleUrls: ['./ns-development-tab.component.scss']
})
export class DevelopmentTabComponent implements OnInit {
  privileges

  constructor(private persistence: PersistenceService, private http: AppHttpClientService) { }

  ngOnInit() {
    this.privileges = this.persistence.get(PKEY.PRIVIGELES);
  }

  initialize() { }

  updatePrivileges(value: boolean) {
    this.persistence.set(PKEY.PRIVIGELES, value);
  }

  sync() {
    this.http.get('/test').subscribe();
  }

}

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormControlsModule
  ],
  providers: [],
  declarations: [DevelopmentTabComponent]
})
class DevelopmentTabModule { }
