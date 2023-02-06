import { Injectable } from '@angular/core';
import { ACTIVIDADES, FUNDOS } from '@app/common/constants/agritareo.constants';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';

@Injectable()
export class AgritareoService {

  constructor(private http: AppHttpClientService) { }

  getFundos() {
    return this.http.get(FUNDOS);
  }

  getActividades() {
    return this.http.get(ACTIVIDADES);
  }

}
