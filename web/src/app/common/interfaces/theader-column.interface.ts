export interface THeaderColumn {
  description?: string;
  label: string;
  data?: string;
  field: string;
  type?: keyof THeaderType;
  orderable?: boolean;
  sort?: boolean;
  searchable?: boolean;
  color?: string;
  order?: number;
  width?: number;
  visible?: boolean;
  isForm?: boolean;
  totalizable?: boolean;
  isBoolean?: boolean;
  isNumeric?: boolean;
  isString?: boolean;
  isDate?: boolean;
  isColored?: boolean;
  isFinder?: boolean;
  isMixed?: boolean;
  className?: string;
  index?: number;
  filter?: boolean;
  date?: boolean | string;
  form?: { [key: string]: unknown };
  render?: (data: any, type: string, row: any, meta?: any) => void;

  upper?: boolean;
  lower?: boolean;
  capitalize?: boolean;
  textAlign?: 'center' | 'left' | 'right';

  badge?: boolean | string;
}


export interface THeaderType {
  string: string;
  number: number;
  mixed: any;
  boolean: boolean;
  date: Date;
  color: string;
  finder: boolean;
  badge: string | boolean;
}

export interface TFormControl {
  field: string;
  cid?: string;
  path?: string;
  type?: string;
}
