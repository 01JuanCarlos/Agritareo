import { TableState } from '@app/common/interfaces/store/table-state.interface';
import { TableHeaderColumn } from '@app/common/interfaces';

// export interface IHeaders {
//   id: string;
//   estado: number;
// }
export interface IDataTable {
  title: string;
  data: any[];
  page: number;
  scroll: boolean;
  pageSize: number;
  loading: boolean;
  cargado: boolean;
  headers: TableHeaderColumn[];
  temporalKey: string;
}

export const initialTableState: TableState = {
  tables: [],
  updateTable: 0,
  disconnect: false,
};
