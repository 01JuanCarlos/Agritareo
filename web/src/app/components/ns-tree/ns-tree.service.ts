import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { DATAHANDLER_API_PATH } from '@app/common/constants';
import { Injectable } from '@angular/core';

@Injectable()
export class NsTreeService {

  constructor(private http: AppHttpClientService) { }

  getTreeData(cid: string) {
    return this.http.get(DATAHANDLER_API_PATH, { cid, tid: 2 }, {
      componentId: cid
    });
  }
}
