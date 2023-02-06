import { WinTabDir } from '../enums';
import { ComponentModeType } from '../types';
import { DocumentLayout } from '../decorators/document.decorator';

export type tabId = string | number;

export interface WTab {
  /** Identificador del tab */
  id: tabId;
  /** Inidica si el tab se está dibujando */
  active: boolean;
  /** Titulo personalizado del tab */
  title?: string;
  /** Icono personalizado del tab. */
  icon?: string;
  /** Data con la que inicia el tab. */
  data?: any;
  /** Dirección del slot donde se encuentra el tab */
  dir?: WinTabDir;
  /** Id del componente que se dibuja en los tabs. */
  componentId: string;
  /** Id del componente padre del tab. */
  windowId: string;
  /** Orden de los tabs */
  order: number;
  /** Estado de las variables del tab. */
  state?: any;
  /** Estado Habilitado del tab. */
  enabled?: boolean;
  /** Representa el estado que se encuentra el tab. */
  mode: ComponentModeType;
}

export interface WindowsTab {
  id: string;
  active: boolean;
  title?: string;
  icon?: string;
  tabs: WTab[];
  url: string;
  type: DocumentLayout;
}
