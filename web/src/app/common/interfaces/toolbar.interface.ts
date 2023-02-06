import { ToolAction } from '@app/config/toolbar-actions';

export interface ToolSettings {
  class?: string;
  style?: { [key: string]: unknown };
  iconStyle?: { [key: string]: unknown };
  iconClass?: { [key: string]: unknown };
  hover?: {
    class: string;
  };
}

export interface Tool {
  id?: string;
  icon: string;
  title: string;
  action: ToolAction | string;
  eventName?: string;
  enabled?: boolean | (() => boolean);
  visible?: boolean | (() => boolean); // delete
  settings?: ToolSettings;
  items?: Tool[];
  toggle?: ToolAction | string;
  order?: number;
  use?: boolean;
  callback?: (...args: any[]) => void;
}

export interface ToolGroup {
  order?: number;
  enabled?: boolean;
  tools: Tool[];
}

export interface ToolSection {
  id: string;
  order?: number;
  enabled?: boolean;
  toolGroup: ToolGroup[];
  draggable?: boolean;
  maxTools?: number;
  searchable?: boolean;
}

export interface ToolBar {
  direction: 'top' | 'bottom' | 'left' | 'right';
  sections: ToolSection[];
}
