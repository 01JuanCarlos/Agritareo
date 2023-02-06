
export interface TableHeaderTypes {
  string: string;
  number: number;
  mixed: any;
  boolean: boolean;
}

export interface TableHeaderColumn {
  description: string;
  data: string;
  type?: keyof TableHeaderTypes;
  orderable?: boolean;
  searchable?: boolean;
  color?: string;
  order: number;
  width?: number;
  visible: boolean;
  totalizable?: boolean;
}
