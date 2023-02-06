import { Injectable } from '@angular/core';
import { WSCLIENT, WSSERVER } from '@app/common/constants/websocket.constants';
import { UniqueID } from '@app/common/utils';
import { Logger } from '@app/common/utils/logger.util';
import { BehaviorSubject, Observable, ReplaySubject, Subject } from 'rxjs';

interface EventMap {
  [key: string]: ReplaySubject<any>;
  [key: number]: ReplaySubject<any>;
}

const logoutCloseCode = 3212;
const InvalidTokenCode = 3212;
const globalWsKey = 'nsWs';

@Injectable({
  providedIn: 'root'
})
export class AppWsClientService {
  protected events: EventMap = {};
  protected ws: WebSocket;

  private wsAddr = '';
  private wsOptions = {};
  private retries = 0;
  private maxRetries = Infinity;
  private connected$ = new BehaviorSubject(false);
  private connectionStatus$ = new BehaviorSubject(2);
  private onMessage$ = new Subject();
  private stackMessages = [];
  private maxStack = 100;
  private currentStack = 0;
  private invalidLogin = false;

  public isConnected = false;

  constructor() {
    this.on(WSSERVER.AUTHENTICATED).subscribe(data => {
      if (data && data.sid) {
        this.connected$.next(true);
        this.connectionStatus$.next(1);
        this.processStack();
      } else {
        this.connected$.next(false);
      }
    });

    this.on(WSSERVER.AUTHENTICATE_ERROR).subscribe(data => {
      this.invalidLogin = true;
    });

    this.connected.subscribe(isConnected => {
      this.isConnected = isConnected;
    });
  }

  private processStack() {
    if (this.stackMessages.length && this.currentStack <= this.maxStack) {
      const message = this.stackMessages.pop();
      if (message && message.opcode) {
        this.send(message.opcode, message.data, message.wstransactionId);
        this.currentStack++;
        setTimeout(() => {
          this.processStack();
        }, 200);
      }
    }
  }

  get connected() {
    return this.connected$.asObservable();
  }

  get connectionStatus() {
    return this.connectionStatus$.asObservable();
  }

  /**
   * Inicializa variables y establece la comunicación con el servidor.
   */
  init(addr: string, options: any) {
    this.wsAddr = addr;
    this.wsOptions = options;

    if (!!window[globalWsKey]) {
      window[globalWsKey].onclose = () => { };
      window[globalWsKey].close();
    }

    window[globalWsKey] = new WebSocket(`wss://${addr}/gesagricola/ws`);

    this.ws = window[globalWsKey];
    this.ws.onmessage = this.onMessage.bind(this);

    this.ws.onclose = code => {
      this.connected$.next(false);
      this.connectionStatus$.next(0);

      logoutCloseCode !== code.code && !this.invalidLogin && setTimeout(() => {
        this.retryConnection();
      }, 5e3);
    };

    this.ws.onerror = this.onError.bind(this);

    this.ws.onopen = data => {
      Logger.info('Conexión Ws establecida.');
      this.send(WSCLIENT.AUTHENTICATE, options);
    };
  }

  private onError(code: number) {
    this.connected$.next(false);
    this.connectionStatus$.next(0);
    this.ws.close();
  }

  private retryConnection() {
    this.connectionStatus$.next(2);

    if (this.retries < this.maxRetries) {
      this.init(this.wsAddr, this.wsOptions);
      this.retries++;
    }
  }

  private onMessage(data: any) {
    if (data && data.data) {
      try {
        const message = JSON.parse(`{"opcode":${data.data}}`);
        const subjectId = message.wstransactionId || message.opcode;
        const subject = this.events[subjectId];

        if (void 0 !== subjectId && subject) {
          subject.next(message.data);
          if (message.opcode === WSSERVER.TRANSACTION && void 0 !== message.wstransactionId) {
            subject.complete();
          }
        }
        this.onMessage$.next(message);
      } catch {
        console.error('Ocurrio un error formateando el mensaje de ws');
      }
    }
  }

  /**
   * Enviar tramas al servidor de websocket.
   * @param type Tipo o opcode de la petición
   * @param data Trama de datos
   */
  send(opcode: number, data?: { [key: string]: any }, wstransactionId?: string): void {
    if (opcode !== WSCLIENT.AUTHENTICATE) {
      if (!this.connected$.value) {
        this.stackMessages.push({ opcode, data, wstransactionId });
        return;
      }
    }

    try {
      const message = (JSON.stringify({ data, wstransactionId }) || '').slice(1, -1);
      if (this.ws.readyState === 1) {
        this.ws.send(opcode + (message ? ',' + message : ''));
      }
    } catch (error) {
      // El formato es invalido
    }
  }

  /**
   * Suscribirse a eventos de respuestas a las solicitudes.
   * @param type Tipo o opcode de la petición
   */
  on(opcode: number): Observable<{ [key: string]: any }> {
    if (!this.events[opcode]) {
      this.events[opcode] = new ReplaySubject(1);
    }
    return this.events[opcode].asObservable();
  }

  get(opcode: number, data?: { [key: string]: any }): Observable<any> {
    const transactionId = UniqueID();

    if (!this.events[transactionId]) {
      this.events[transactionId] = new ReplaySubject(1);
    }

    this.send(opcode, data, transactionId);

    return this.events[transactionId].asObservable();
  }

  close() {
    if (this.ws) {
      this.ws.close(logoutCloseCode);
    }
  }

}
