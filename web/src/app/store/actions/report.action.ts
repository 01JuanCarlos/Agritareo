import { ReportParam } from '@app/common/interfaces/store/report-state.interface';
import { createAction, props } from '@ngrx/store';

export const SetReportParams = createAction('[Report] Set Report Parameters', props<{ report: string, parameters: ReportParam[] }>());
export const ClearReportParams = createAction('[Report] Clear Report Parameters', props<{ report: string }>());
