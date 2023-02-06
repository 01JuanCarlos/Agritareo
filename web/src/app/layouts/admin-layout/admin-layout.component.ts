import { AfterViewInit, Component, ComponentFactoryResolver, ComponentRef, Injector, OnDestroy, OnInit, ViewChild, ViewContainerRef, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { MapFactory } from '@app/common/classes';
import { initToken } from '@app/common/classes/abstract-document.class';
import { TRANSACTION_UID_FIELD } from '@app/common/constants';
import { DocumentLayout } from '@app/common/decorators/document.decorator';
import { WinTabDir } from '@app/common/enums';
import { ComponentMode } from '@app/common/enums/component-mode.enum';
import { tabId, WindowsTab, WTab } from '@app/common/interfaces';
import { StoreAppState } from '@app/common/interfaces/store/store-state.interface';
import { GetMetaOptions } from '@app/common/utils/get-meta.util';
import { ModalDialogComponent } from '@app/libraries/modal/modal.component';
import { NisiraApp } from '@app/scripts/nisira.app';
import { WinTabActions } from '@app/store/actions';
import { GetActiveWindow, GetWindows } from '@app/store/selectors/wintab.selector';
import { select, Store } from '@ngrx/store';


@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class AdminLayoutComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('leftContainer', { static: true, read: ViewContainerRef })
  leftContainer: ViewContainerRef;

  @ViewChild('rightContainer', { static: true, read: ViewContainerRef })
  rightContainer: ViewContainerRef;

  @ViewChild('windowContainer', { static: true, read: ViewContainerRef })
  windowContainer: ViewContainerRef;

  @ViewChild(ModalDialogComponent, { static: true })
  private windowTab: ModalDialogComponent;

  nisiraApp: NisiraApp;
  isViewOutletActive = true;
  hasTabs = false;
  viewsData$ = this.store.pipe(select(GetWindows));

  containerActiveDir = WinTabDir.LEFT;
  currentWindowId: string;
  currentWindow: WindowsTab;

  leftWinTabs: WTab[] = [];
  rightWinTabs: WTab[] = [];
  splitted: boolean;
  activeLeftTabId: string | number;
  activeRightTabId: string | number;
  leftTabHolder: ComponentRef<any>;
  rightTabHolder: ComponentRef<any>;

  windowTabHolder: ComponentRef<any>;

  TAB_LEFT = WinTabDir.LEFT;
  TAB_RIGHT = WinTabDir.RIGHT;

  wintabIsTree = false;
  wintabType: DocumentLayout = DocumentLayout.BASIC;
  wintabTitle = '';
  splitMinSize = 25;

  // @HostListener('window:beforeunload')
  // canDeactivate() {
  //   return false;
  // }

  constructor(
    private store: Store<StoreAppState>,
    private componentFactoryResolver: ComponentFactoryResolver,
    private router: Router
  ) {
    this.nisiraApp = new NisiraApp();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.saveTabsState();
        this.isViewOutletActive = true;
        this.cleanRightContainer();
        this.cleanLeftContainer();
      }
    });
  }

  ngOnInit() {
    this.nisiraApp.initApp();
    this.nisiraApp._transitionsEnabled();

    this.store
      .pipe(select(GetActiveWindow))
      .subscribe(win => {
        if (win && win.id) {
          if (this.currentWindowId !== win.id) {
            this.cleanRightContainer();
            this.cleanLeftContainer();
          }

          this.leftWinTabs = win.tabs.filter(tab => tab.dir !== WinTabDir.RIGHT);
          this.rightWinTabs = win.tabs.filter(tab => tab.dir === WinTabDir.RIGHT);
          this.splitted = !!this.rightWinTabs.length;
          this.hasTabs = !!win.tabs.length;
          this.isViewOutletActive = !this.hasTabs || !this.leftWinTabs.some(tab => tab.active === true);
          this.currentWindowId = win.id;
          this.currentWindow = win;
          this.wintabType = win.type;
          this.wintabIsTree = this.wintabType === DocumentLayout.TREE;

          if (this.wintabIsTree) {
            this.splitted = this.wintabIsTree;
            this.cleanRightContainer();
          }

          if (this.isViewOutletActive) {
            this.cleanLeftContainer();
          }

          this.renderWinTabs();
        }
      });
  }

  ngAfterViewInit() {

  }

  getLeftTabItems() {
    const tabs = this.sortTabs(this.leftWinTabs).map(tab => {
      return {
        ...tab,
        data: undefined,
        state: undefined,
        group: tab.componentId,
        title: tab.mode !== 'CREATE' ? `${tab.title} #${tab.id}` : tab.title
      };
    });
    return [{
      label: 'Lista',
      icon: 'icon-list-numbered',
      isOutlet: true,
      active: this.isViewOutletActive,
      componentId: this.currentWindowId
    }, ...tabs];
  }

  getRightTabItems() {
    return this.sortTabs(this.rightWinTabs).map(tab => {
      return {
        ...tab,
        state: undefined,
        group: tab.componentId,
        title: tab.mode !== 'CREATE' ? `${tab.title} #${tab.id}` : tab.title,
        data: undefined
      };
    });
  }

  sortTabs(tabs: WTab[]) {
    return tabs.sort((a, b) => a.order - b.order);
  }

  cleanLeftContainer() {
    if (this.leftTabHolder) {
      this.activeLeftTabId = null;
      this.leftTabHolder.destroy();
    }
  }

  cleanRightContainer() {
    if (this.rightTabHolder) {
      this.activeRightTabId = null;
      this.rightTabHolder.destroy();
    }
  }

  renderWinTabs() {
    const activeLeftTab = this.leftWinTabs.find(e => e.active === true);
    if (activeLeftTab && !!activeLeftTab.id && activeLeftTab.id !== this.activeLeftTabId) {
      this.cleanLeftContainer();
      this.renderTab(activeLeftTab, this.leftContainer, holder => {
        this.leftTabHolder = holder;
        this.activeLeftTabId = activeLeftTab.id;
      });
    }

    if (!this.splitted) {
      this.cleanRightContainer();
    }

    const activeRightTab = this.rightWinTabs.find(e => e.active === true);
    if (activeRightTab && !!activeRightTab.id && activeRightTab.id !== this.activeRightTabId) {
      this.cleanRightContainer();
      this.renderTab(activeRightTab, this.rightContainer, holder => {
        this.rightTabHolder = holder;
        this.activeRightTabId = activeRightTab.id;
      });
    }
  }

  renderTab(tab: WTab, container: ViewContainerRef, callback?: (holder: ComponentRef<any>) => void) {
    const component: any = MapFactory.getComponent(tab.componentId || this.currentWindowId);
    if (!!component) {
      const resolver = this.componentFactoryResolver.resolveComponentFactory(component);
      const injector = Injector.create({
        providers: [
          {
            provide: initToken,
            useValue: tab.state ? void 0 : tab.data
          }
        ]
      });
      const holder: ComponentRef<any> = container.createComponent(resolver, 0, injector);
      if (holder) {
        if (holder.instance) {
          const data = tab.data || { [TRANSACTION_UID_FIELD]: '' };
          holder.instance.options = GetMetaOptions(holder.instance);
          holder.instance.windowTab = tab;
          holder.instance.isWindowTab = true;
          holder.instance.documentTitle = tab.title;
          holder.instance.formId = tab.id;
          // TODO: mover a patchFormValue
          holder.instance.changeMode(tab.mode);
          holder.instance.isEnabled = !!tab.enabled;
          holder.instance.setTitle(tab.mode === ComponentMode.CREATE ? this.currentWindow.title : `${this.currentWindow.title} #${tab.id}`);

          ComponentMode.CREATE !== tab.mode && holder.instance.setTransactionId(data[TRANSACTION_UID_FIELD]);

          if (!tab.state && tab.data && holder.instance.mode !== ComponentMode.CREATE) {
            holder.instance.patchFormValue(tab.data);
          }

          this.setTabState(holder.instance, tab.state || {});
        }

        holder.changeDetectorRef.detectChanges();
        // tslint:disable-next-line: no-unused-expression
        callback && callback(holder);
      }
    }
  }

  onItemDrop(tab: WTab, dir: WinTabDir) {
    this.store.dispatch(WinTabActions.SetDirTab({ wid: this.currentWindowId, tid: tab.id, dir }));
  }

  ngOnDestroy() {
    this.cleanLeftContainer();
    this.cleanRightContainer();
  }

  onSelectTab(tab: WTab & { isOutlet: boolean }, dir: WinTabDir) {
    this.containerActiveDir = dir;

    this.saveTabsState();

    if (tab && !tab.active && !tab.isOutlet) {
      this.store.dispatch(WinTabActions.SetActiveTab({ tid: tab.id, dir, wid: this.currentWindowId, status: true }));
    }

    if (tab && tab.isOutlet) {
      this.isViewOutletActive = true;
      this.cleanLeftContainer();
      this.store.dispatch(WinTabActions.ResetActiveTabs({ wid: this.currentWindowId, dir }));
    }
  }

  saveTabsState() {
    this.saveTabState(this.activeLeftTabId, this.leftTabHolder);
    this.saveTabState(this.activeRightTabId, this.rightTabHolder);
  }

  saveTabState(tid: tabId, holder: ComponentRef<any>) {
    const { instance } = holder || { instance: void 0 };
    if (instance && tid && 'documentId' in instance) {
      const data = this.getTabStatus(instance);
      this.store.dispatch(WinTabActions.SaveTabState({
        wid: this.currentWindowId,
        tid,
        state: data
      })); // save store
    }
  }

  getTabStatus(instance: any, maxDepth = 5, depth = 1) {
    const data = {};
    const ignoreMetaKeys = Object.keys(instance?.options ?? {}).filter(k => 'string' === typeof k);
    const ignoreKeys = [...ignoreMetaKeys, 'windowTab', 'nsUniqueId', 'documentId', 'displayedColumns', 'nsComponent'];

    if (!!instance) {
      for (const key of Object.keys(instance)) {
        if (ignoreKeys.includes(key)) {
          continue;
        }

        const descriptor = Object.getOwnPropertyDescriptor(instance, key);
        const value = descriptor.value;

        if (['string', 'number', 'boolean'].includes(typeof value) ||
          (null !== value && 'object' === typeof value && (value.constructor.name === 'Object' || value.constructor.name === 'Array'))
        ) {
          data[key] = value;
        }

        if ('object' === typeof value && value instanceof FormGroup) {
          data[key] = value.value;
        }

        if (value && 'object' === typeof value && 'nsComponent' in value && depth <= maxDepth) {
          const cdata = this.getTabStatus(value, maxDepth, depth + 1);
          data[key] = !cdata ? cdata[key] : {};
        }
      }
    }
    return data;
  }

  setTabState(instance: any, state: any) {
    const keys = Object.keys(instance);
    keys.forEach(key => {
      if (key in state) {
        if (instance[key] && 'object' === typeof instance[key] && 'nsComponent' in instance[key]) {
          this.setTabState(instance[key], state[key]);
        } else {
          if (instance[key] instanceof FormGroup) {
            instance?.patchFormValue(state[key]);
          } else {
            instance[key] = state[key];
          }
        }
      }
    });
  }

  onCloseTab(tab: WTab & { isOutlet: boolean }) {
    this.store.dispatch(WinTabActions.RemoveTab({ wid: this.currentWindowId, tid: tab.id }));
  }

  onCloseAllTabs(dir: WinTabDir) {
    this.store.dispatch(WinTabActions.RemoveAllTabs({ wid: this.currentWindowId, dir }));
  }

  onSplitTabs() {
    this.splitted = !this.splitted;
  }

  onWindowTab(dir: WinTabDir) {
    this.windowTab.hide();
    this.windowContainer.remove();

    // Mover la vista actual izquierda a una nueva ventana.
    if (dir === WinTabDir.LEFT && !!this.activeLeftTabId) {
      const activeLeftTab = this.leftWinTabs.find(e => e.id === this.activeLeftTabId);
      if (activeLeftTab) {
        this.saveTabState(this.activeLeftTabId, this.leftTabHolder);
        this.wintabTitle = `${activeLeftTab.title} #${activeLeftTab.id}`;
        this.store.dispatch(WinTabActions.RemoveTab({ wid: this.currentWindowId, tid: this.activeLeftTabId }));
        this.renderTab(activeLeftTab, this.windowContainer, holder => {
          this.windowTabHolder = holder;
        });
      }
    }

    // Mover la vista actual derecha a una nueva ventana.
    if (dir === WinTabDir.RIGHT && !!this.activeRightTabId) {
      const activeRightTab = this.rightWinTabs.find(e => e.id === this.activeRightTabId);
      if (activeRightTab) {
        this.saveTabState(this.activeRightTabId, this.rightTabHolder);
        this.wintabTitle = `${activeRightTab.title} #${activeRightTab.id}`;
        this.store.dispatch(WinTabActions.RemoveTab({ wid: this.currentWindowId, tid: this.activeRightTabId }));
        this.renderTab(activeRightTab, this.windowContainer, holder => {
          this.windowTabHolder = holder;
        });
      }
    }

    this.windowTab.show();
  }
}
