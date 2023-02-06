import { RouterReducerState } from '@ngrx/router-store';
import { AppState } from './app-state.interface';
import { ReportState } from './report-state.interface';
import { TableState } from './table-state.interface';
import { WinTabState } from './wintab.state.interface';

export interface StoreAppState {
  router?: RouterReducerState;
  tables: TableState;
  app: AppState;
  winTabs: WinTabState;
  report: ReportState;
}
