import { Injectable } from '@angular/core';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';

@Injectable()
export class ReportesService {

  constructor(private http: AppHttpClientService) { }

  getZona() {
    return this.http.get('/report-zona');
  }
  getCultivos() {
    return this.http.get('/gdata');
  }

  getFitosanidadDetalle(idSiembra: string | number) {
    return this.http.get('/evaluation', idSiembra);
  }

  imagenes(idevaluacion: string | number) {
    return this.http.get('/images?id=' + idevaluacion + '&idn=1');
  }


  getMaquinaria(i: string, f: string) {
    return this.http.get('/machinery', { i, f });
  }

  getDetallesDeMaquinaria(idLote: string | number) {
    return this.http.get('/machinery', idLote);
  }


  getRiego(i: string, f: string) {
    return this.http.get('/irrigation-report', { i, f });
  }

  getCosecha(id: number, i: string, f: string) {
    return this.http.get('/harvest', { id, i, f });
  }

  getDetallesDeRiego(idLote: string | number) {
    return this.http.get('/irrigation', idLote);
  }

  getFertilizacion(i: string, f: string) {
    return this.http.get('/fertilization', { i, f });
  }

  getDetallesDeFertilizacion(idLote: string | number) {
    return this.http.get('/fertilization', idLote);
  }

  getDetallesDeLabor(idLote: string | number) {
    return this.http.get('/labor', idLote);
  }

  getDetallesDeLaborCost(idLote: string | number) {
    return this.http.get('/labor-cost', idLote);
  }

}
