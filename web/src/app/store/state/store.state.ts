import { StoreAppState } from '@app/common/interfaces/store/store-state.interface';
import { initialTableState } from './table.state';
import { initialAppState } from './app.state';
import { initialWinTabState } from './wintab.state';
import { initialReportState } from './report.state';
// FIXME: eliminar esta parte y usar solo los reducers para evitar escribir de más
export const initialStoreState: StoreAppState = {
  tables: initialTableState,
  app: initialAppState,
  winTabs: initialWinTabState,
  report: initialReportState
};

export function getInitialState(): StoreAppState {
  return initialStoreState;
}
