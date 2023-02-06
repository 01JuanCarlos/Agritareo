export interface DataGridColumn {
  field: string;
  label: string;

  visible?: boolean;
  isBoolean?: boolean;

  editable?: boolean;
  resizable?: boolean;
  sortable?: boolean;
  focusable?: boolean;
  dropdown?: boolean;

  width?: number;
  format?: (value?: any) => any;
}
