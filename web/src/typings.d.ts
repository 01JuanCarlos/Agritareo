interface JQuery {
  uniform(options?: any): any;
  DataTable(options: any): any;
  tooltip(options?: any): any;
  modal(options?: any): any;
  perfectScrollbar(options?: any): any;
  bootstrapResponsiveTabs(options?: any): any;
  select2(options?: any): any;
  popover(options?: any): any;
  nestable(...args: any[]): any;
  bootstrapSwitch(...args: any[]): any;
  reportBro(...args: any[]): any;
  spectrum(...args: any[]): any;
  NsReportBro(...args: any[]): any;
  sessionTimeout(...args: any[]): any;
  tokenfield(...args: any[]): any;
  dropdown(...args: any[]): any;
  daterangepicker(...args: any[]): any;
}

interface JQueryStatic {
  sessionTimeout(...args: any[]): any;
}

interface IViewMap {
  title: string;
  icon?: string;
  component: object;
}
interface BtnOption {
  description: string;
  icon?: string;
  isSeparator?: boolean;
  shortcut?: string;
}

interface InputAddon {
  text?: string;
  icon?: string;
  class?: string;
  click?: Function;
  isBtn?: boolean;
  prepend?: boolean;
  append?: boolean;
}

declare module 'chart.js';
declare module 'google';
