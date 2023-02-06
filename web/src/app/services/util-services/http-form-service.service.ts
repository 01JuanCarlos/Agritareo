import { Injectable } from '@angular/core';
import { DATAHANDLER_API_PATH } from '@app/common/constants';
import { delay } from 'rxjs/operators';
import { AppHttpClientService, IRequestOptions } from './app-http-client.service';

@Injectable({
  providedIn: 'root'
})
export class HttpFormServiceService {

  constructor(private http: AppHttpClientService) { }

  create(endpoint: string, data: any, options?: IRequestOptions) {
    return this.http.post(endpoint, data, { isTransaction: true, ...options });
  }

  replace(endpoint: string, id: any, data: any, options?: IRequestOptions) {
    return this.http.put(endpoint, id, data, { isTransaction: true, ...options });
  }

  update(endpoint: string, id: any, data: any, options?: IRequestOptions) {
    return this.http.patch(endpoint, id, data, { isTransaction: true, ...options });
  }

  delete(endpoint: string, id: any, options?: IRequestOptions) {
    return this.http.delete(endpoint, id, { isTransaction: true, ...options });
  }

  load(endpoint: string, data?: any) {
    return this.http.get(endpoint, data, { cacheable: true }).pipe(
      delay(100)
    );
  }

  dataHandler(data: any, options?: any) {
    return this.http.get(DATAHANDLER_API_PATH, data, { ...options });
  }
}
