import { Injectable } from '@angular/core';
import { DOCSERIE_API_PATH } from '@app/common/constants';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';

@Injectable()
export class NsSerieNumeroService {

  constructor(private http: AppHttpClientService) { }

  getDocument(componentId: string) {
    return this.ajax(componentId);
  }

  getSerie(documentId: string) {
    return this.ajax(void 0, documentId);
  }

  getCorr(documentId: string, serieId: string) {
    return this.ajax(void 0, documentId, serieId);
  }

  getSerieNumero(componentId: string, idDocumento: string) {
    return this.ajax(componentId, void 0, void 0, idDocumento);
  }

  ajax(c?: string, d?: string, s?: string, id?: string) {
    return this.http.get(DOCSERIE_API_PATH, { c, d, s, id });
  }

}
