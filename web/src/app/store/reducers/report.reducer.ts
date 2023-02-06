import { createReducer, on, Action } from '@ngrx/store';
import { ReportState } from '@app/common/interfaces/store/report-state.interface';
import { initialReportState } from '../state/report.state';
import { SetReportParams } from '../actions/report.action';

export const reducer = createReducer(
  initialReportState,
  on(SetReportParams, (state, { parameters, report }) => {
    return { ...state, parameters, report };
  })
);

export function reportReducers(state: ReportState | undefined, action: Action) {
  return reducer(state, action);
}
