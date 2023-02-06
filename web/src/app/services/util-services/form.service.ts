import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PARAM_ID } from '@app/common/constants';
import { Base64Encode } from '@app/common/utils';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppHttpClientService, HttpMethods, IRequestOptions } from './app-http-client.service';

export const enum FormRequest {
  CREATED,
  DELETED,
  UPDATED,
  PATCHED,
  ENABLED,
  DISABLED,
  LOADING,
  DONE,
  ERROR,
  FETCH_LOADING,
  FETCH_DONE,
  FETCH_ERROR
}

const FormStatusFromMethod = {
  [HttpMethods.POST]: FormRequest.CREATED,
  [HttpMethods.PUT]: FormRequest.UPDATED,
  [HttpMethods.DELETE]: FormRequest.DELETED,
  [HttpMethods.PATCH]: FormRequest.PATCHED
};

@Injectable()
export class FormService {
  /** Path del servicio para manejar las peticiones http  */
  public controllerId: string;
  /** Id de la vista del contenido del formulario */
  public viewComponentId: string;
  /** Id del formulario o documento */
  public formId: string | number;
  /** Alias de formId */
  public documentId: string | number;
  /** Id de la transacción del formulario actual. */
  public transactionId: string;
  /** Estado actual del formulario */
  public formStatus = new Subject<{ status: FormRequest, data?: any }>();

  private lastError = null;
  private lastResult = null;

  constructor(private http: AppHttpClientService) { }

  /**
   * Establecer el Path del servicio
   * @param controllerId Path http
   */
  setControllerId(controllerId: string) {
    this.controllerId = controllerId;
  }

  /**
   * Establecer el Id de la vista o ventana.
   * @param viewComponentId Id de la vista donde está contenido el formulario.
   */
  setViewComponentId(viewComponentId: string) {
    this.viewComponentId = viewComponentId;
  }

  /**
   * Establecer el Id del documento o formulario.
   * @param formId Id del documento
   */
  setFormId(formId: string | number) {
    this.formId = formId;
    this.documentId = formId;
  }

  /**
   * Alias de setFormId
   * @param documentId Id del documento
   */
  setDocumentId(documentId: string | number) {
    this.setFormId(documentId);
  }

  /**
   * Establece el id de la transacción del documento actual.
   * @param transactionId Id de la transacción del documento.
   */
  setTransactionId(transactionId: string) {
    this.transactionId = transactionId;
  }

  public fetch(path: string, data?: unknown, options?: IRequestOptions) {
    return this.request(HttpMethods.GET, null, data, { url: path, ...options });
  }

  private getHttpDefaultParams(options: IRequestOptions = {}) {
    let params = options.params || new HttpParams();
    params = params.append(PARAM_ID, this.viewComponentId);
    return params;
  }

  request(type: HttpMethods, id: any, data: any, options?: IRequestOptions) {
    // Start request loading
    this.formStatus.next({ status: FormRequest.LOADING, data: !0 });

    options = {
      method: type,
      ...options,
      params: this.getHttpDefaultParams(options)
    };

    this.viewComponentId && (options.componentId = this.viewComponentId);
    if (HttpMethods.GET !== type) {
      options.isTransaction = true;
      options.transactionId = this.transactionId;
    }

    return this.http
      .http(options.url ?? this.controllerId, id, data, options).pipe(
        tap(
          result => {
            this.lastResult = result;
            this.formStatus.next({ status: FormRequest.DONE, data: result });
          },
          err => {
            this.lastError = err;
            this.formStatus.next({ status: FormRequest.ERROR, data: this.lastError });
          },
          () => {
            this.formStatus.next({ status: FormRequest.LOADING, data: !1 });
            this.formStatus.next({ status: FormStatusFromMethod[type], data: this.lastResult });
          }
        )
      );
  }

  /**
   * Crear/Guardar contenido de un documento
   * @param id Id del documento
   * @param options Opciones adicionales del formulario
   */
  get(id = null, options?: IRequestOptions) {
    return this.request(HttpMethods.GET, id, null, options);
  }

  /**
   * Crear/Guardar contenido de un documento
   * @param data Cuerpo del contenido del documento
   * @param options Opciones adicionales del formulario
   */
  create(data: any, options?: IRequestOptions) {
    return this.request(HttpMethods.POST, null, data, options);
  }

  /**
   * Actualizar/Guardar contenido de un documento
   * @param id Id del documento
   * @param data Cuerpo contenido del documento
   * @param options Opciones adicionales del formulario
   */
  update(id: unknown, data: any, options?: IRequestOptions) {
    return this.request(HttpMethods.PUT, id, data, options);
  }

  /**
   * Eliminar un documento
   * @param id Id del documento
   * @param options Opciones adicionales del formulario
   */
  delete(id: unknown, options?: IRequestOptions) {
    return this.request(HttpMethods.DELETE, id, null, options);
  }

  /**
   * Reemplaza parcialmente al documento.
   * @param id Id del documento
   * @param options Opciones adicionales del formulario
   */
  patch(id: unknown, data: any, options?: IRequestOptions) {
    return this.request(HttpMethods.PATCH, id, data, options);
  }

  /**
   * Cambia el estado a anulado en un registro del formulario.
   * @param id Id del formulario
   */
  disableForm(id: unknown, options?: IRequestOptions) {
    return this.patch(id, null, options);
  }

  print(componentId: string, formatId: string | number, obj: any) {
    return this.http.get('print', { c: componentId, f: formatId, o: Base64Encode(obj) }, { responseType: 'arraybuffer' });
  }

}
