import { ElementRef, EventEmitter, Injector } from '@angular/core';
import { ModalService } from '@app/components/ns-modal/ns-modal.service';
import { NsComponentService } from '@app/services/component.service';
import { WinTabActions } from '@app/store/actions';
import { Store } from '@ngrx/store';
import { NsDocumentOptions } from '../decorators/document.decorator';
import { ComponentMode } from '../enums/component-mode.enum';
import { ComponentSyncStatus } from '../enums/component-sync-status.enum';
import { WTab } from '../interfaces';
import { StoreAppState } from '../interfaces/store';
import { ComponentModeType } from '../types';
import { UniqueID } from '../utils';
import { GetMetaOptions } from '../utils/get-meta.util';
import { WintabOptions } from './wintabs.class';

export abstract class AbstractComponent {
  public nsComponent = true;
  public nsUniqueId = UniqueID();
  public element: HTMLElement;

  protected elRef: ElementRef;
  protected inModal: boolean;
  protected inWizard: boolean;
  protected store: Store<StoreAppState>;
  protected service: NsComponentService;
  protected options: NsDocumentOptions;
  protected modal: ModalService;

  public isEnabled: boolean;
  public isDeactivatable = true;
  public isLoading = false;

  public mode: ComponentModeType = ComponentMode.CREATE;
  public isViewMode: boolean;
  public isEditMode: boolean;
  public isCreateMode: boolean;
  public componentId: string;

  public onChangeMode = new EventEmitter<ComponentModeType>();

  public onSyncStatus = new EventEmitter<ComponentSyncStatus>();

  public nsLabels: { key: string, value: unknown }[] = [];

  constructor(injector: Injector) {
    this.elRef = injector.get(ElementRef);
    this.element = this.elRef.nativeElement;
    this.store = injector.get<Store<StoreAppState>>(Store);
    this.service = injector.get(NsComponentService);
    this.modal = injector.get(ModalService);
    this.options = { ...this.options, ...GetMetaOptions(this) };
    this.componentId = this.options.viewComponentId;
    this.isActive = true;
  }

  get isActive() {
    return this.service.isActive(this.nsUniqueId);
  }

  set isActive(value: boolean) {
    if (true === value) {
      this.service.setActive(this.nsUniqueId);
    }
  }

  /**
   * Cambiar el modo de presentación de un componente.
   * @param mode Modo
   */
  changeMode(mode: ComponentModeType) {
    this.mode = mode;
    this.isViewMode = ComponentMode.VIEW === mode;
    this.isEditMode = ComponentMode.EDIT === mode;
    this.isCreateMode = ComponentMode.CREATE === mode;
    this.onChangeMode.emit(this.mode);
  }

  /**
   * Abrir un nuevo tab dentro del layout.
   * @param mode Modo de presentación que inicia el componente.
   * @param wid Id del componente o vista contenedor del tab.
   * @param options Opciones adicionales del tab.
   */
  openWinTab(mode: ComponentModeType, wid: string, options = {} as WintabOptions): void {
    options || (options = {});

    let cid = options.componentId;
    let title = options.title;
    let icon = options.icon;
    // FIXME: Corregir y obtener propiedadades directamente.
    if (!cid && 'function' === typeof options.component) {
      // cid = GetSecureProperty({ ...options.component }, MetaKey.ID);
      // title = GetSecureProperty({ ...options.component }, MetaKey.TITLE);
      // icon = GetSecureProperty({ ...options.component }, MetaKey.ICON);
    }

    if (ComponentMode.CREATE !== mode) {
      if (undefined === options.enabled && options.data) {
        options.enabled = options.data.enabled;
      }

      if (undefined === options.id && options.data) {
        options.id = options.data.id;
      }
    }

    if (void 0 !== wid) {
      this.store.dispatch(WinTabActions.AddTab({ wid, cid, options: { mode, title, icon, ...options } }));
    }
  }

  // TODO: IMPLENTAR....
  resetWinTab() {

  }

  /**
   * Actualiza las propiedades de un tab.
   * @param wid Id de componente o vista contenedor de tab
   * @param tid Identificador del tab
   * @param tab La información que se desea alterar en el tab
   */
  updateWinTab(wid: string, tid: string | number, tab: Partial<WTab>) {
    this.store.dispatch(WinTabActions.UpdateTab({ wid, tid, tab }));
  }

  /**
   * Cierra un tab del layout
   * @param wid Id de componente o vista contenedor de tab
   * @param tid Identificador del tab
   */
  closeWinTab(wid: string, tid: string | number) {
    this.store.dispatch(WinTabActions.RemoveTab({ wid, tid }));
  }

  loadComponentLabels() {
    this.service.syncComponentLabels(this.componentId).subscribe(data => {
      this.nsLabels = data;
      this.onSyncStatus.emit(ComponentSyncStatus.LABEL_LOADED);
    });
  }

  resetComponentLabels(cid: string) {
    return this.service.resetComponentLabels(cid);
  }
}
