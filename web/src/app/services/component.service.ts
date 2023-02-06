import { EventEmitter, Injectable } from '@angular/core';
import { AppWsClientService } from './util-services/app-ws-client.service';
import { WSCLIENT } from '@app/common/constants';

/**
 * Servicio orquestador de los distintos componentes que heredan de AbstractComponent
 */
@Injectable({
  providedIn: 'root'
})
export class NsComponentService {
  /* Id del componente activo */
  private cmpActiveId: string;
  /* Evento para indicar el id del componente activo */
  public onActive = new EventEmitter<string>();

  public labelLoaded = new EventEmitter<string>();

  constructor(
    private ws: AppWsClientService
  ) {

  }

  resetComponentLabels(cid: string) {
    return this.ws.get(WSCLIENT.RESET_CUSTOM_LABELS, { cid });
  }

  syncComponentLabels(cid: string) {
    return this.ws.get(WSCLIENT.GET_CUSTOM_LABELS, { cid });
  }

  public setActive(activeId: string) {
    this.cmpActiveId = activeId;
    this.onActive.emit(this.cmpActiveId);
  }

  public isActive(activeId: string) {
    return this.cmpActiveId === activeId;
  }
}
