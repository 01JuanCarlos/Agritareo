import { Injectable } from '@angular/core';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';

@Injectable()
export class AutoComplete2Service {
  constructor(private http: AppHttpClientService) { }

  search(id: string, query: string, max = 10, idCultivo: number) {
    return this.http.get('/suggestagritareo', { id, q: query, l: max, c: idCultivo});
  }
}
