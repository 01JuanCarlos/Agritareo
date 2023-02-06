import {
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
  OnChanges
} from '@angular/core';
import { Id } from '@app/common/decorators';
import { ShowFloatingWindow, HideFloatingWindow } from '@app/common/utils';
import { Closest } from '@app/common/utils/dom/closest.util';

export interface SplitTab {
  label: string;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
  closeable?: boolean;
  data?: unknown;
}

@Component({
  selector: 'ns-split-tabs',
  templateUrl: './ns-split-tabs.component.html',
  styleUrls: ['./ns-split-tabs.component.scss']
})
export class NsSplitTabsComponent implements OnInit, DoCheck, OnChanges {
  @Input() @Id id: string;
  @Input() items = [];
  @Input() activeTab = 0;

  @ViewChild('menu', { static: true }) menuTemplate: ElementRef;
  @ViewChild('btnMenu', { static: true }) btnMenuTemplate: ElementRef;

  @Output() changeTab = new EventEmitter<any>();
  @Output() closeTab = new EventEmitter<any>();
  @Output() closeAllTab = new EventEmitter<any>();
  @Output() dropTab = new EventEmitter<any>();
  @Output() selectTab = new EventEmitter<any>();
  @Output() clickBtnSplit = new EventEmitter<any>();
  @Output() clickBtnWindow = new EventEmitter<any>();

  @Input() showSplitBtn = true;
  @Input() showPopupBtn = true;

  @Input() showTopOptions = true;
  private showMenu = false;

  public colors: { [key: string]: string } = {};

  @HostListener('document:click', ['$event.target'])
  onclick(el: HTMLElement) {
    // if (!(this.btnMenuTemplate.nativeElement as HTMLElement).contains(el)) {
    //   this.hideMenu();
    // }
  }

  @HostListener('window:resize', ['$event']) onResize(event) {
    this.update();
  }

  // @HostListener('documentgo:keyup.alt.w', ['$event'])
  // onCloseTab() {
  //   if (this.showTopOptions) {
  //     this.items.forEach(tab => {
  //       if (tab.active) {
  //         this.closeTab.emit(tab);
  //       }
  //     });

  //   }
  // }

  // @HostListener('document:keyup.alt', ['$event'])
  // onShowKeysTab() {

  // }

  constructor() { }

  ngOnInit(): void { }

  ngOnChanges(updates: any) {
    // FIXME: Optimizar las llamadas múltiples.
    // console.log({ updates, id: this.id });
  }

  ngDoCheck() {
    // console.log({ id: this.id });
    // if (this.items && this.items.length) {
    //   this.colors = this.items.reduce((a, b) => {
    //     const color = `#${Math.random().toString(16).substr(2, 6)}40`;
    //     if (b.group && !!a[b.group]) {
    //       return a;
    //     }
    //     return Object.assign(a, b.group ? { [b.group]: color } : {});
    //   }, this.colors);
    // }
  }

  update() {
    this.hideMenu();
  }

  closeAll() {
    this.closeAllTab.emit();
  }

  hideMenu() {
    // tslint:disable-next-line: no-unused-expression
    this.showMenu && this.onToggleMenu();
  }

  onToggleMenu(event?: MouseEvent) {
    this.showMenu = !this.showMenu;

    if (!this.showMenu) {
      HideFloatingWindow(this.menuTemplate.nativeElement);
    }

    console.log({ show: this.showMenu });

    if (!!event && this.showMenu) {
      const parent = Closest(event.target, 'button');
      if (null !== parent) {
        const { top, left } = parent.getBoundingClientRect();
        console.log({ parent, top, left });
        ShowFloatingWindow(this.menuTemplate.nativeElement, left - 5, top, {
          dir: 'left'
        });
      }
    }
  }

  trackByFn(index: number, tab: any) {
    return tab.id;
  }

  onSelectTab(it: any) {
    if (it.active !== true) {
      this.changeTab.emit(it);
    }
    this.selectTab.emit(it);
  }
}
