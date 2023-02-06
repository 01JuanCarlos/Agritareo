import { WindowsTab, tabId, WTab } from '../interfaces';
import { WinTabDir } from '../enums';
import { ComponentModeType } from '../types';
import { ComponentMode } from '../enums/component-mode.enum';
import { DocumentLayout } from '../decorators/document.decorator';

export interface WintabOptions {
  /** Titulo personalizado del tab */
  title?: string;
  /** Icono personalizado del tab */
  icon?: string;
  /** Estado del tab */
  enabled?: boolean;
  /** Permite solo una instancia por componente */
  unique?: boolean;
  /** Data incial del row */
  data?: any;
  /** Identitifcador unico del tab */
  id?: tabId;
  /** Modo que se muestra el tab */
  mode?: ComponentModeType;
  /** Slot donde se muestra el tab */
  dir?: WinTabDir;
  /** Id del la ventana padre original. */
  windowId?: string;
  /** Id del componente que se va a pintar. */
  componentId?: string;
  /** Componente que se va a pintar. */
  component?: unknown;
}

export const initialOptions: WintabOptions = {
  enabled: true,
  mode: ComponentMode.CREATE,
  dir: WinTabDir.LEFT
};

/**
 * Gestion de ventanas internas.
 */
export class WinTab {
  /** Mapa de ventanas */
  private windowsTabs: { [key: string]: WindowsTab };
  /** Número de actualizaciones de ventana o tabs. */
  private updateWinTab = 0;

  constructor(state: any) {
    this.updateWinTab = state.updateWinTab;
    this.windowsTabs = state.winTab;
  }

  /**
   * Verificar si la ventana actual tiene tabs
   * @param wid Id de la ventana
   */
  hasTabs(wid: string): boolean {
    return !!this.windowTabs(wid).length;
  }

  /**
   * Obtiene los tabs de una ventana.
   * @param wid Id de la ventana
   */
  windowTabs(wid: string, dir?: WinTabDir) {
    const tabs = this.windowExists(wid) ? this.getWindow(wid).tabs : [];
    return tabs.filter(tab => {
      return undefined === dir ? !0 : dir === tab.dir;
    });
  }

  /**
   * Obtiene la ventana actual
   * @param wid Id de la ventana
   */
  getWindow(wid: string) {
    return this.windowsTabs[wid];
  }

  /**
   * Obtiene un tab de una ventana
   * @param wid Id de la ventana
   * @param tid Id del tab
   */
  getTab(wid: string, tid: tabId) {
    return this.windowTabs(wid).find(tab => tab.id === tid);
  }

  /** Obtiene la ventana activa. */
  get activeWindow() {
    for (const id in this.windowsTabs) {
      if (this.windowsTabs.hasOwnProperty(id) && this.windowsTabs[id].active) {
        return this.windowsTabs[id];
      }
    }
  }
  /**
   * Verificar si una ventana existe.
   * @param wid Id de la ventana
   */
  windowExists(wid: string) {
    return !!this.windowsTabs[wid];
  }

  /**
   * Verifica si un tab existe en una vetana
   * @param wid Id de la ventana
   * @param tid Id del tab
   */
  tabExists(wid: string, tid: tabId): boolean {
    return this.windowTabs(wid).some(tab => tab.id === tid);
  }

  /**
   * Registrar una nueva ventana
   * @param wid Id de la ventana
   * @param title Titutlo de la ventana
   * @param icon Icono de la ventana
   */
  registerWindow(wid: string, url: string, type: DocumentLayout, title: string, icon: string) {
    this.windowsTabs[wid] = {
      id: wid,
      active: true,
      title,
      icon,
      tabs: [],
      url,
      type
    };
  }

  updateWindow(wid: string, title: string, icon: string) {
    if (this.windowExists(wid)) {
      const w = this.windowsTabs[wid];
      this.windowsTabs[wid] = {
        ...w,
        title: title || w.title,
        icon: icon || w.icon
      };
    }
  }

  resetWindowStatus(status = false) {
    for (const k of Object.keys(this.windowsTabs)) {
      const w = this.windowsTabs[k];
      this.updateWindowStatus(w.id, status);
    }
  }

  updateWindowStatus(wid: string, status: boolean) {
    if (this.windowExists(wid)) {
      this.windowsTabs[wid] = {
        ...this.windowsTabs[wid],
        active: status
      };
    }
  }

  addTab(wid: string, cid: string, options: WintabOptions = initialOptions) {
    if (this.windowExists(wid)) {
      if (null === options.id || undefined === options.id) {
        options.id = Math.random().toString(16).slice(2);
      }

      if (this.tabExists(wid, options.id)) {
        const tab = this.getTab(wid, options.id);
        if (ComponentMode.PREVIEW === tab.mode && (ComponentMode.VIEW === options.mode || ComponentMode.EDIT === options.mode)) {
          this.updateTabMode(wid, options.id, options.mode);
        }
      }


      if (!this.tabExists(wid, options.id)) {
        if ('function' === typeof options.data) {
          options.data = options.data();
        }

        if (undefined === options.enabled) {
          options.enabled = true;
        }

        if (options.unique) {
          options.id = options.id + wid;
        }

        const wTab = this.getWindow(wid);

        if (!wTab.tabs) {
          wTab.tabs = [];
        }

        // FIXME: Remover por uso doble en el reducer
        this.resetTabs(wid, wTab.type === DocumentLayout.TREE ? WinTabDir.RIGHT : WinTabDir.LEFT);

        if (ComponentMode.PREVIEW === options.mode) {
          wTab.tabs = wTab.tabs.filter(tb => ComponentMode.PREVIEW !== tb.mode);
        }

        // Reset tabs...
        // TODO: Añadir soporte para identificar el modulo del tab.
        const tab: WTab = {
          active: true,
          icon: options.icon || this.getIconFromMode(options.mode),
          title: options.title || wTab.title,
          id: options.id,
          data: options.data,
          dir: wTab.type === DocumentLayout.TREE ? WinTabDir.RIGHT : options.dir || WinTabDir.LEFT,
          componentId: cid || wid,
          order: this.getTabOrder(wid, wTab.type === DocumentLayout.TREE ? WinTabDir.RIGHT : WinTabDir.LEFT),
          enabled: options.enabled,
          mode: options.mode,
          windowId: '' // TODO: Identificar al modulo que pertenece.
        };

        wTab.tabs.push(tab);
      }

      this.changeActiveTab(wid, options.id, true);
    }
  }

  private getIconFromMode(mode: ComponentModeType) {
    return mode === ComponentMode.CREATE ? 'icon-file-empty' : ComponentMode.VIEW === mode ? 'icon-eye' : 'icon-pencil7';
  }

  getTabOrder(wid: string, dir: WinTabDir): number {
    const tabs = this.windowTabs(wid, dir);
    return tabs.length;
  }

  sortTabs(wid: string, dir: WinTabDir) {
    this.windowTabs(wid, dir).forEach((tab: WTab, index: number) => {
      tab.order = index;
    });
  }

  /**
   * Restablece el valor del estado activo a todos los tabs de una ventana
   * @param wid Id de la ventana
   * @param status Estado
   */
  resetTabs(wid: string, dir?: WinTabDir) {
    this.windowTabs(wid).forEach(tab => {
      tab.active = dir !== undefined ? ((undefined === tab.dir ? dir === WinTabDir.LEFT : dir === tab.dir) ? !1 : tab.active) : !1;
    });
  }

  /**
   * Eliminar un tab de una ventana
   * @param wid Id de la ventana
   * @param tid Id del Tab
   */
  removeTab(wid: string, tid: tabId) {
    if (this.windowExists(wid) && this.tabExists(wid, tid)) {
      const tab = this.getTab(wid, tid);
      const fromDir = tab.dir;
      const tabs: WTab[] = this.windowTabs(wid);

      this.setNextTabActive(wid, tid);
      this.windowsTabs[wid].tabs = tabs.filter(e => e.id !== tid);
      this.sortTabs(wid, fromDir);
    }
  }
  /**
   * Cierra los tabs de alguna posición y deja los tabs en modo creación
   * @param wid Id de la ventana
   * @param dir Dirección de los tabs
   */
  removeAllTabs(wid: string, dir?: WinTabDir) {
    this.windowTabs(wid, dir).forEach(tab => {
      if (tab.mode !== ComponentMode.CREATE) {
        this.removeTab(wid, tab.id);
      }
    });
  }

  changeActiveTab(wid: string, tid: tabId, status: boolean) {
    if (this.hasTabs(wid)) {
      const ctab = this.getTab(wid, tid);
      this.windowTabs(wid).forEach(tab => {
        tab.active = tid === tab.id ? status : (undefined === tab.dir || ctab.dir === tab.dir ? false : tab.active);
      });
    }
  }

  changeTabDir(wid: string, tid: tabId, dir: WinTabDir) {
    if (this.hasTabs(wid) && this.tabExists(wid, tid)) {
      const tab = this.getTab(wid, tid);
      const fromDir = tab.dir || WinTabDir.LEFT;
      if (fromDir !== dir) {
        this.windowTabs(wid).forEach(tb => {
          if (tb.id === tab.id) {
            this.setNextTabActive(wid, tb.id);
            tb.dir = dir;
            tb.order = this.getTabOrder(wid, tb.dir);
            this.resetTabs(wid, dir);
            tb.active = true;
            this.sortTabs(wid, fromDir);
          }
        });
      }
    }
  }

  setNextTabActive(wid: string, tid: tabId) {
    const tabs = this.windowTabs(wid);
    if (!tabs.some(tab => tab.active)) {
      const lastTab = tabs[tabs.length - 1];
      if (!!lastTab) {
        return this.changeActiveTab(wid, lastTab.id, true);
      }
    }

    if (this.hasActiveTab(wid, tid)) {
      const index = tabs.findIndex(tab => tab.id === tid);
      const nextIndex = !!tabs[index + 1] ? index + 1 : !!tabs[index - 1] ? index - 1 : 0;
      if (-1 !== nextIndex && tabs[nextIndex]) {
        this.changeActiveTab(wid, tabs[nextIndex].id, true);
      }
    }
  }

  hasActiveTab(wid: string, tid: tabId) {
    return this.tabExists(wid, tid) && this.getTab(wid, tid).active;
  }

  saveTabState(wid: string, tid: tabId, state: any) {
    if (this.tabExists(wid, tid)) {
      this.windowTabs(wid).forEach(tab => {
        if (tid === tab.id) {
          tab.state = Object.assign({}, tab.state, state);
        }
      });
    }
  }

  updateTabMode(wid: string, tid: tabId, mode: ComponentModeType) {
    if (this.tabExists(wid, tid)) {
      const tab = this.getTab(wid, tid);
      tab.mode = mode;
      tab.icon = this.getIconFromMode(mode);
    }
  }

  updateTab(wid: string, tid: tabId, data: Partial<WTab>) {
    this.windowTabs(wid).forEach(tab => {
      if (tab.id === tid) {
        // Merge properties..
        Object.assign(tab, data);
        // Set aditional properties
        tab.icon = this.getIconFromMode(tab.mode);
      }
    });
  }

  update() {
    return {
      winTab: this.windowsTabs,
      updateWinTab: this.updateWinTab + 1
    };
  }
}
