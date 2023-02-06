import { Injectable } from '@angular/core';
import { ACTIVITY_API_PATH, LOG_API_PATH } from '@app/common/constants';
import { WSCLIENT } from '@app/common/constants/websocket.constants';
import { StoreAppState } from '@app/common/interfaces/store';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { selectCompanyComponents } from '@app/store/selectors/app.selector';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AppWsClientService } from './app-ws-client.service';
import * as moment from 'moment';

export interface Activity {
  time: number;
  componentid: string;
  id: unknown;
  path?: string;
  type: string;
  transaction_id: string;
  userid: number | string;
  componentName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  currentPage = 0;
  pageLength = 10;

  private behaviorIsLoading = new BehaviorSubject(false);
  private behaviorActivities = new BehaviorSubject([]);

  public isLoading = this.behaviorIsLoading.asObservable();
  public activities = this.behaviorActivities.asObservable();

  constructor(
    private ws: AppWsClientService,
    private http: AppHttpClientService,
    private store: Store<StoreAppState>
  ) { }

  parseTime(timeAgo: any) {
    return moment(new Date(timeAgo)).fromNow();
  }

  addActivity(activity: Activity) {
    const activities = this.behaviorActivities.getValue();

    this.store
      .pipe(select(selectCompanyComponents))
      .subscribe(components => {
        const component = components.find(cmp => cmp.uuid === activity.componentid);
        if (component) {
          activity.componentName = component.label || activity.componentid;
          activity.path = component.fullPath;
        }
        this.behaviorActivities.next([activity, ...activities]);
      }, err => {
        console.log('Error ', err);
      });

  }

  syncActivities() {
    this.ws.get(WSCLIENT.GET_ACTIVITY).subscribe(data => {
      this.store
        .pipe(select(selectCompanyComponents))
        .subscribe(components => {
          data = data.map(it => {
            const component = components.find(cmp => cmp.uuid === it.componentId);
            if (component) {
              it.componentName = component.label || it.componentId;
              it.path = component.fullPath;
            }
            return it;
          });
          this.behaviorActivities.next(data.sort((a: Activity, b: Activity) => a.time - b.time));
        });
    });
    // this.loadActivities()
    //   .pipe(
    //     map(arr => {
    //       console.log({ arr });
    //       return arr;
    //     })
    //   )
    //   .subscribe(data => {
    //     this.behaviorActivities.next(data.sort((a: Activity, b: Activity) => a.time - b.time));
    //   });
  }

  loadActivities() {
    this.behaviorIsLoading.next(true);
    return this.http.get(ACTIVITY_API_PATH)
      .pipe(
        finalize(() => this.behaviorIsLoading.next(false))
      );
  }

  getLog(id: string) {
    return this.http.get(LOG_API_PATH, id);
  }
}
