import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SidebarStatus } from '@app/common/enums';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  public isOpen: boolean;
  public selectedTabIndex: number;

  private status$ = new BehaviorSubject<{ status: SidebarStatus, data?: unknown }>({
    status: SidebarStatus.INIT
  });

  constructor() { }

  onTab(index: number) {
    this.selectedTabIndex = index;
    this.status$.next({
      status: SidebarStatus.TAB,
      data: {
        index: this.selectedTabIndex
      }
    });
  }

  get onStatus() {
    return this.status$.asObservable();
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.status$.next({ status: SidebarStatus.OPEN });
  }

  close() {
    this.isOpen = false;
    this.status$.next({ status: SidebarStatus.CLOSE });
  }
}
