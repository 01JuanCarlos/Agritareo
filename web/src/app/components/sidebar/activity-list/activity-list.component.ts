import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, NgModule, OnInit } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { StoreAppState } from '@app/common/interfaces/store';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { ActivityService } from '../../../services/util-services/activity.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ns-activity-list',
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.scss'],
  animations: [
    trigger('flyInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      transition('void => *', [
        style({ transform: 'translateX(-100%)' }),
        animate(200)
      ]),
      transition('* => void', [
        animate(200, style({ transform: 'translateX(100%)' }))
      ])
    ])
  ]
})

export class ActivityListComponent implements OnInit {
  isUpdating: boolean;
  actionNames = {
    POST: 'creó',
    PUT: 'actualizó',
    DELETE: 'eliminó'
  };

  constructor(
    private store: Store<StoreAppState>,
    public service: ActivityService,
    private router: Router
  ) { }

  ngOnInit() {
    this.store.select('app', 'currentLanguage').subscribe(lang => {
      moment.locale(lang);
    });
  }

  initialize() {
    console.log('Iniciar??');
  }

  loadData() {
    this.service.syncActivities();
  }

  parseTime(timeAgo: any) {
    return moment(new Date(timeAgo)).fromNow();
  }

  goToFormId(log) {
    if (log && log.type !== 'DELETE') {
      this.router.navigate([log.path], { fragment: log.id });
    }
  }
}

@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule
  ],
  declarations: [ActivityListComponent],
  providers: []
})
class ActivityListModule { }
