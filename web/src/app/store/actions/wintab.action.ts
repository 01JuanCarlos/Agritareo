import { createAction, props } from '@ngrx/store';
import { tabId, WTab } from '@app/common/interfaces';
import { WinTabDir } from '@app/common/enums';
import { WintabOptions } from '@app/common/classes';
import { ComponentModeType } from '@app/common/types';
import { DocumentLayout } from '@app/common/decorators/document.decorator';

/**
 * Registrar una nueva ventana contenedora de tabs.
 */
export const RegisterWindow = createAction(
  '[WinTab] Register window',
  props<{ id: string, url: string, title: string | undefined, layout?: DocumentLayout, icon?: string | undefined }>()
);

/**
 * Añade un nuevo tab a la ventana.
 */
export const AddTab = createAction(
  '[WinTab] Add new tab',
  props<{ wid: string, cid?: string, options?: WintabOptions }>()
);

/**
 * Establece si un tab está Activo/Inactivo para visualización
 */
export const SetActiveTab = createAction(
  '[WinTab] Change tab status',
  props<{ wid: string, tid: tabId, dir: WinTabDir, status: boolean }>()
);

/**
 * Establece en que dirección se muestra el tab
 */
export const SetDirTab = createAction(
  '[WinTab] Change tab dir',
  props<{ wid: string, tid: tabId, dir: WinTabDir }>()
);

/**
 * Establece un valor a todos los tabs.
 */
export const ResetActiveTabs = createAction(
  '[WinTab] Reset tab active status',
  props<{ wid: string, dir: WinTabDir }>()
);

/**
 * Quita un tab de la ventana
 */
export const RemoveTab = createAction(
  '[WinTab] Remove tab',
  props<{ wid: string, tid: tabId }>()
);
/**
 * Quita todos los tabs de la ventana si no se especifica la dirección.
 */
export const RemoveAllTabs = createAction(
  '[WinTab] Remove all tabs',
  props<{ wid: string, dir: WinTabDir }>()
);

/**
 * Guarda el estado de la información de un tab
 */
export const SaveTabState = createAction(
  '[WinTab] Save tab state',
  props<{ wid: string, tid: tabId, state: any }>()
);

/**
 * Actualiza el modo que se muestra el tab.
 */
export const UpdateTabMode = createAction(
  '[WinTab] Update tab mode',
  props<{ wid: string, tid: tabId, mode: ComponentModeType }>()
);

/**
 * Actualiza la información del tab.
 */
export const UpdateTab = createAction(
  '[WinTab] Update tab',
  props<{ wid: string, tid: tabId, tab: Partial<WTab> }>()
);
