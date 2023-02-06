import { Injectable } from '@angular/core';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';

export interface Bitacora {
  id: number;
	idtipo_registro: number;
	idevaluador: number;
	evaluador: string;
	fecha: Date;
	idcentro_costo: number;
	parcela: string;
	idsiembra: number;
	idcultivo: number;
  cultivo: string;
  variedad: string;
  area_sembrada: number;
  ruta: string;
  idbitacora_agricola_sanitaria: number;
  organo_afectado: string;
  valor_encontrado: string;
  glosa: string;
  descripcion_campania: string;
  dia_crecimiento: string;
  semana_crecimiento: string;
  fenologia_variedad: string;
  codigo_campania: number;
  concepto_agricola: string;
  metodo_evaluacion: string;
  unidad_medida: string;
}

@Injectable()
export class MntListarBitacoraService {

  constructor(private http: AppHttpClientService) { }

  getBinnacle(){
    return this.http.get<Bitacora>('/binnacleTable');
  }
}
