import { Injectable } from '@angular/core';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';

@Injectable()
export class TableSimpleService {
  currentPage = 0;
  items = 15;

  setCurrentPage(currentPage: number) {
    this.currentPage = currentPage;
  }

  setItems(items: number) {
    this.items = items;
  }

  constructor(private http: AppHttpClientService) { }

  controllerService(controller: string, query) {
    return this.http.get(controller, { ...query, page: this.currentPage, items: this.items });
  }
}
