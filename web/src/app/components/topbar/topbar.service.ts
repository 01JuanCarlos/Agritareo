import { Injectable } from '@angular/core';
import { SEARCH_TOP_BAR } from '@app/common/constants';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';

@Injectable()
export class TopbarService {

  constructor(private http: AppHttpClientService) { }

  searchByText(text: string) {
    return this.http.get(SEARCH_TOP_BAR, text);
  }
}
