import { Injectable } from '@angular/core';
import { SUGGEST_API_PATH } from '@app/common/constants';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';

@Injectable()
export class AutoCompleteService {
  constructor(private http: AppHttpClientService) { }

  search(id: string, query: string, max = 10, filter?: string) {
    return this.http.get(SUGGEST_API_PATH, { id, q: query, l: max, f: filter || '' });
  }
}
