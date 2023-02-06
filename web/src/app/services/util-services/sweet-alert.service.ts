import { Injectable } from '@angular/core';
import swal from '@static/js/plugins/notifications/sweet_alert.min.js';

interface SweetAlertOptions {
  callback?: (result: boolean) => void;
  title?: string;
  titleText?: string;
  text?: string;
  html?: string;
  footer?: string;
  type?: string;
  toast?: boolean;
  customClass?: string;
  target?: string;
  backdrop?: boolean;
  animation?: boolean;
  allowOutsideClick?: boolean;
  allowEscapeKey?: boolean;
  allowEnterKey?: boolean;
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  preConfirm?: any;
  confirmButtonText?: string;
  confirmButtonAriaLabel?: string;
  confirmButtonColor?: string;
  confirmButtonClass?: string;
  cancelButtonText?: string;
  cancelButtonAriaLabel?: string;
  cancelButtonColor?: string;
  cancelButtonClass?: string;
  buttonsStyling?: boolean;
  reverseButtons?: boolean;
  focusConfirm?: boolean;
  focusCancel?: boolean;
  showCloseButton?: boolean;
  closeButtonAriaLabel?: boolean;
  showLoaderOnConfirm?: boolean;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  imageClass?: string;
  timer?: number;
  width?: string | number;
  padding?: number;
  background?: string;
  input?: string;
  inputPlaceholder?: string;
  inputValue?: string;
  inputOptions?: any;
  inputAutoTrim?: boolean;
  inputClass?: string;
  inputAttributes?: any;
  inputValidator?: any;
  grow?: boolean;
  position?: 'top' | 'top-left' | 'top-right' | 'center-left' | 'center-right' | 'bottom' | 'bottom-left' | 'button-right';
  progressSteps?: any[];
  currentProgressStep?: number;
  progressStepsDistance?: number;
  onBeforeOpen?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
  useRejections?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SweetAlertService {
  constructor() {
    swal.setDefaults({
      buttonsStyling: false,
      confirmButtonClass: 'btn btn-primary',
      cancelButtonClass: 'btn btn-light',
      padding: 10,
      width: '35%'
    } as SweetAlertOptions);
  }

  public async show(text: string, title?: string, options: SweetAlertOptions = {}): Promise<boolean> {
    const callback = options.callback;

    if (!!callback) {
      delete options.callback;
    }

    const result = await swal({
      title, // : await this.translate.get(title).toPromise(),
      text, // : await this.translate.get(text).toPromise(),
      ...options
    });

    const resultValue = !!result.value;

    if (callback && 'function' === typeof callback) {
      callback(resultValue);
    }
    return resultValue;
  }

  // Contextual alerts
  public success(text: string, title = '¡Buen trabajo!', options?: SweetAlertOptions) {
    return this.show(text, title, { type: 'success', ...options });
  }

  public warn(text: string, title = '¿Estás seguro?', options?: SweetAlertOptions) {
    return this.show(text, title, {
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: '¡Sí!',
      ...options
    });
  }

  public error(text: string, title = 'Ups...', options?: SweetAlertOptions) {
    return this.show(text, title, { type: 'error', ...options });
  }

  public info(text: string, title = 'Para tu información', options?: SweetAlertOptions) {
    return this.show(text, title, { type: 'info', ...options });
  }

  public question(text: string, title = '¿Tienes una pregunta?', options?: SweetAlertOptions) {
    return this.show(text, title, { type: 'question', ...options });
  }

  public confirmDelete(text?: string, title?: string, options?: SweetAlertOptions) {
    return this.warn(text || 'You won\'t be able to revert this!', void 0, {
      showCancelButton: true,
      confirmButtonText: '¡Si, eliminar!',
      cancelButtonText: '¡No, cancelar!',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false,
      ...options
    });
  }
}
