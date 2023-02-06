import { Injectable } from '@angular/core';
import { CLIMAS, FUNDOS } from '@app/common/constants/agritareo.constants';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';

@Injectable()
export class WeatherService {

  constructor(private http: AppHttpClientService) { }

  // Centros de costo
  getClima(idfundo: number) {
    return this.http.get(FUNDOS + `/${idfundo}/` + CLIMAS);
  }

}
