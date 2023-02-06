import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum BlockUIType {
  ERROR,
  LOADING,
  WARNING,
}

export interface BlockUIMessage {
  message: string;
  icon?: string;
  type?: BlockUIType;
}

@Injectable({
  providedIn: 'root'
})
export class BlockUIService {
  private loader$ = new BehaviorSubject(false);
  private loaderMessage$ = new BehaviorSubject<BlockUIMessage>({
    message: 'Please wait',
    type: BlockUIType.LOADING,
    icon: 'icon-spinner4 spinner'
  });

  constructor() { }

  get loader() {
    return this.loader$.asObservable();
  }

  get messages() {
    return this.loaderMessage$.asObservable();
  }

  setMessage(message: string, type?: BlockUIType, icon?: string) {
    type = undefined === type ? BlockUIType.LOADING : type;
    icon = icon || (BlockUIType.ERROR === type ? 'icon-cancel-circle2' : (BlockUIType.WARNING === type ? 'icon-warning' : 'icon-spinner4 spinner'));
    this.loaderMessage$.next({ message, type, icon });
  }

  show(message?: string) {
    if ('string' === typeof message) {
      this.setMessage(message);
    }
    this.loader$.next(!0);
  }

  hide() {
    this.loader$.next(!1);
  }
}
