import { createReducer, on, Action } from '@ngrx/store';
import { initialTableState, IDataTable } from '../state/table.state';
import * as tableActions from '../actions/table.action';
import { TableState } from '@app/common/interfaces/store/table-state.interface';
import { TableHeaderColumn } from '@app/common/interfaces';

export const reducer = createReducer(
  initialTableState,
  on(tableActions.GetTables, () => initialTableState),

  on(
    tableActions.SaveDataTable,
    (state, { title, data, page, pageSize, headers }) => ({
      ...state,
      tables: [{
        title, data, page: page + 1, scroll: true, pageSize, loading: false, headers, temporalKey: ''
      }]
    })
  ),

  on(tableActions.SetDataTable, () => initialTableState),

  on(
    tableActions.EditDataTable,
    (state, { data, title, scroll }) => ({
      ...state,
      tables: [...state.tables.map(p => {
        if (data === undefined) { return p; }
        if (p.title === title) {
          p.data = p.data.concat(data);
          p.page = p.page + 1;
          p.scroll = scroll;
          p.loading = false;
        }
        return p;
      })]
    })
  ),

  on(
    tableActions.ScrollDataTable,
    (state, { title, scroll }) => ({
      ...state,
      tables: [...state.tables.map(p => {
        if (p.title === title) {
          p.scroll = scroll;
        }
        return p;
      })]
    })
  ),

  on(
    tableActions.LoadingTable,
    (state, { title, loading }) => ({
      ...state,
      tables: [{
        title, loading
      }]
    })
  ),

  on(
    tableActions.UpdateLoadingTable,
    (state, { title, loading }) => ({
      ...state,
      tables: [...state.tables.map((p: IDataTable) => {
        if (p.title === title) {
          p.loading = loading;
        }
        return p;
      })]
    })
  ),

  on(
    tableActions.FailService,
    (state, { disconnect }) => ({ ...state, disconnect })
  ),

  on(
    tableActions.UpdateHeaders,
    (state, { title, id, payload }) => ({
      ...state, tables: [...state.tables.map((p: IDataTable) => {
        if (p.title === title) {
          p.headers.map((sp: TableHeaderColumn) => {
            if (sp.description === id) {
              sp.order = payload;
            }
          });
        }
        return p
      })]
    })
  ),

  on(
    tableActions.UpdateTemporalKey,
    (state, { title, payload }) => ({
      ...state,
      tables: [...state.tables.map((p: IDataTable) => {
        if (p.title === title) {
          p.temporalKey = payload;
        }
        return p;
      })]
    })
  )
);


export function tableReducers(state: TableState | undefined, action: Action) {
  return reducer(state, action);
}
