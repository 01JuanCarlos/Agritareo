import { THeaderType } from './theader-column.interface';

export interface ApiTableHeaderColumn {
  index: number;
  type: keyof THeaderType;
  data: string;
  field: string;
  orderable: boolean;
  searchable: boolean;

  isBoolean: boolean;
  isNumeric: boolean;
  isString: boolean;
}