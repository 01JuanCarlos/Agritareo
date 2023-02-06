import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { COMPONENT_ID_HEADER, DATAHANDLER_API_PATH, PARAM_PROC_ID, TRANSACTION_HEADER, TRANSACTION_UID_FIELD } from '@app/common/constants';
import { UniqueID } from '@app/common/utils';
import { SerializeQuery } from '@app/common/utils/serialize-query.util';
import { startsWith } from 'lodash-es';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export function appHttpClientCreator(http: HttpClient) {
  // tslint:disable-next-line: no-use-before-declare
  return new AppHttpClientService(http);
}

export interface IRequestOptions {
  body?: any;
  params?: HttpParams;
  headers?: { [param: string]: string };
  observe?: 'body' | 'events' | 'response';
  reportProgress?: boolean;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  withCredentials?: boolean;
  isTransaction?: boolean;
  fullResponse?: boolean;
  componentId?: string | number;
  transactionId?: string;
  moduleId?: string | number;
  cacheable?: boolean;
  method?: HttpMethods;
  url?: string;
}

export enum HttpMethods {
  GET, POST, PUT, PATCH, DELETE, OPTIONS
}

@Injectable()
export class AppHttpClientService {

  private cachePaths: { [key: string]: { time?: number, data?: any } } = {};

  constructor(private service: HttpClient) { }

  http<T>(endpoint: string, id: any, body: any, options?: IRequestOptions): Observable<any> {
    if (!endpoint) {
      return throwError('AppHttpClientService: No se ha especificado la dirección url');
    }

    if (!(/http.?:\/\//.test(endpoint))) {
      endpoint = endpoint.slice(+startsWith(endpoint, '/'));
      endpoint = `http${environment.useHttps ? 's' : ''}://${environment.apiBaseAddr}/${environment.apiVersion}/${endpoint}`;
    }

    if (id || (body && ('string' === typeof body || 'number' === typeof body))) {
      endpoint = `${endpoint}/${id || body}`;
      if (body && 'string' === typeof body) {
        body = null;
      }
    }
    options = options || {} as IRequestOptions;
    options.method = options.method || HttpMethods.GET;

    // serializar en caso de error de parametros.
    if (body && HttpMethods.GET === options.method) {
      options.params = new HttpParams({ fromString: SerializeQuery(body) });
    }

    if (HttpMethods.GET !== options.method && !(body instanceof FormData)) {

      let transactionUid = options.transactionId ?? UniqueID().toUpperCase();

      if (options.isTransaction) {

        if (body && HttpMethods.POST !== options.method) {
          transactionUid = body[TRANSACTION_UID_FIELD] || transactionUid;
        }

        options.headers = {
          ...options.headers,
          [TRANSACTION_HEADER]: transactionUid
        };
      }

      if (!!body) {
        options.body = { ...body };

        if (HttpMethods.POST === options.method) {
          options.body[TRANSACTION_UID_FIELD] = transactionUid;
          // options.body[COMPANY_ID_FIELD] =
        }

        // id: body.id || void 0,
        // [TRANSACTION_UID_FIELD]: transactionUid
      }
    }

    if (body instanceof FormData) {
      options.body = body;
    }

    if (options.componentId) {
      options.headers = {
        ...options.headers,
        [COMPONENT_ID_HEADER]: `${options.componentId}`
      };
    }

    options.withCredentials = true;

    // TODO: tiempo local del registro, implementar UTC

    return this.service.request<T>(HttpMethods[options.method], endpoint, options as any).pipe(
      map((response: any) => {
        // Si es un arrayBuffer
        if (response instanceof ArrayBuffer || response instanceof Blob) {
          return response;
        }

        // Si la respuesta en de tipo JSON.
        const { error, data, meta } = response || {} as any;

        if (!!error) {
          throw error;
        }

        return options.fullResponse || !!meta ? response : undefined === data ? response : data || null;
      }),
      catchError(err => {
        if (err.error && err.error instanceof ArrayBuffer) {
          err.error = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(err.error)));
        }
        return throwError(err.error ? err.error : err);
      })
    );
  }

  get<T>(endpoint: string, queryOrId?: any, options?: IRequestOptions) {
    return this.http<T>(endpoint, null, queryOrId, {
      method: HttpMethods.GET,
      ...options
    });
  }

  post<T>(endpoint: string, data?: any, options?: IRequestOptions) {
    return this.http<T>(endpoint, null, data, {
      method: HttpMethods.POST,
      ...options
    });
  }

  put<T>(endpoint: string, id: any, data: any, options?: IRequestOptions) {
    return this.http<T>(endpoint, id, data, {
      method: HttpMethods.PUT,
      ...options
    });
  }

  patch<T>(endpoint: string, id: any, data: any, options?: IRequestOptions) {
    return this.http<T>(endpoint, id, data, {
      method: HttpMethods.PATCH,
      ...options
    });
  }

  delete<T>(endpoint: string, id: any, options?: IRequestOptions) {
    return this.http<T>(endpoint, id, null, {
      method: HttpMethods.DELETE,
      ...options
    });
  }

  dataHandler(procId: string, data?: any, options: IRequestOptions = {}) {
    const method = options.method || HttpMethods.GET;
    const id = 'string' === typeof data || 'number' === typeof data ? data : null;

    options.params = new HttpParams({
      fromString: SerializeQuery({
        [PARAM_PROC_ID]: procId || '',
        ...('string' === typeof data || 'number' === typeof data ? {} : data)
      })
    });

    return this.http(
      DATAHANDLER_API_PATH,
      id,
      null,
      {
        method,
        ...options
      }
    );
  }
}
