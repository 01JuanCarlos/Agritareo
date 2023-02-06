import { Injectable } from '@angular/core';
import { UPDATE_COMPONENT_PATH } from '@app/common/constants';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service.ts';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class ComponentBuilderService {

  constructor(
    private http: AppHttpClientService
  ) { }

  updateComponent(id: string, component: any) {
    const subject = new BehaviorSubject<boolean>(true);
    return this.http.put(UPDATE_COMPONENT_PATH, id, component, { isTransaction: true });
  }
}
