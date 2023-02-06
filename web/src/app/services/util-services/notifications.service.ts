import { Injectable } from '@angular/core';
import PNotify from '@static/js/plugins/notifications/pnotify.min.js';
export enum NotificationType {
  INFO = 1, SUCCESS, WARNING, ERROR
}

export interface NotificationOptions {
  type?: NotificationType;
  icon?: string;
  title?: string;
  text?: string;
  addclass?: string;
  stack?: { [key: string]: string };
  hide?: boolean;
  buttons?: {
    closer: boolean;
    sticker: boolean;
  };
  opacity?: number;
  width?: string;
}

const typeClassList = {
  [NotificationType.INFO]: 'info',
  [NotificationType.SUCCESS]: 'success',
  [NotificationType.WARNING]: 'warning',
  [NotificationType.ERROR]: 'error'
};

const typeTitleList = {
  [NotificationType.INFO]: 'Información',
  [NotificationType.SUCCESS]: 'Éxito',
  [NotificationType.WARNING]: 'Advertencia!',
  [NotificationType.ERROR]: 'Error!'
};

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  loaderNotify = null;

  constructor() { }

  private notify(text: string, title?: string | NotificationOptions, options: NotificationOptions = {} as NotificationOptions) {
    if (typeof PNotify === 'undefined') {
      return console.warn('Warning - pnotify.min.js is not loaded.');
    }

    if ('object' === typeof title) {
      options = title;
      title = undefined;
    }

    const type = options.type || NotificationType.INFO;

    if (options) {
      delete options.type;
    }

    return new PNotify({
      title: title || typeTitleList[type],
      text: text || '',
      // alert alert-styled-left
      // addclass: `alert bg-${typeClassList[type]} alert-styled-left border-${typeClassList[type]} stack-bottom-right`,
      type: typeClassList[type],
      ...options,
    });
  }

  success(text: string, title?: string, options?: NotificationOptions) {
    return this.notify(text, title, {
      ...options,
      type: NotificationType.SUCCESS,
    });
  }

  error(text: string, title?: string, options?: NotificationOptions) {
    return this.notify(text, title, {
      ...options,
      type: NotificationType.ERROR
    });
  }

  warn(text: string, title?: string, options?: NotificationOptions) {
    return this.notify(text, title, {
      ...options,
      type: NotificationType.WARNING
    });
  }

  info(text: string, title?: string, options?: NotificationOptions) {
    return this.notify(text, title, {
      ...options,
      type: NotificationType.INFO
    });
  }

  message(text: string, title?: string, options?: NotificationOptions) {
    return this.info(text, title, options);
  }

  loader(text: string, title?: string, options?: NotificationOptions) {
    const type = (options ? options.type : '') || NotificationType.INFO;
    return this.notify(text, title, {
      ...options,
      type,
      icon: 'icon-spinner4 spinner',
      stack: { dir1: 'right', dir2: 'down', push: 'top' },
      hide: false,
      addclass: 'alert p-1 bg-warning border-warning',
      buttons: {
        sticker: false,
        closer: false
      },
      width: '150px',
      opacity: .9
    });
  }

  hideLoader(notify: any, options?: NotificationOptions) {
    options = {
      title: 'Done!',
      text: '',
      type: NotificationType.SUCCESS,
      hide: true,
      addclass: 'bg-success border-success',
      buttons: {
        closer: true,
        sticker: true
      },
      icon: 'icon-checkmark3',
      opacity: 1,
      ...options
    };

    if (!!notify && notify.update && notify.remove) {
      notify.update(options);
      setTimeout(() => {
        notify.remove();
      }, 2e3);
    }
  }
}
