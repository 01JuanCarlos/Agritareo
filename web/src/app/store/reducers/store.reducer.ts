import { routerReducer } from '@ngrx/router-store';
import { ActionReducerMap } from '@ngrx/store';
import { tableReducers } from './table.reducer';
import { StoreAppState } from '@app/common/interfaces/store/store-state.interface';
import { appReducers } from './app.reducer';
import { winTabsReducers } from './wintab.reducer';
import { reportReducers } from './report.reducer';

export const storeReducers: ActionReducerMap<StoreAppState, any> = {
  router: routerReducer,
  tables: tableReducers,
  app: appReducers,
  winTabs: winTabsReducers,
  report: reportReducers
};
