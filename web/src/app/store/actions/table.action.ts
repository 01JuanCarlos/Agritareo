import { createAction, props } from '@ngrx/store';

export const GetTables = createAction('[Table] Get Tables');
export const UpdateTemporalKey = createAction('[Table] Update TemporalKey', props<{ title: string, payload: string }>());
export const UpdateHeaders = createAction('[Table] Update Headers', props<{ title: string, id: string, payload: number }>());
export const UpdateLoadingTable = createAction('[Table] Update Loading Table', props<{ title: string, loading: boolean, visible: boolean }>());
export const LoadingTable = createAction('[Table] Loading Table', props<{ title: string, loading: boolean, visible: boolean }>());
export const SaveDataTable = createAction('[Table] Save DataTable', props<{ title: string, data: any, page: number, pageSize: number, headers: any }>());
export const ScrollDataTable = createAction('[Table] Scroll DataTable', props<{ title: string, scroll: boolean }>());
export const SetDataTable = createAction('[Table] Set DataTable', props<{ page: number, title: string, headers: any[] }>());
export const EditDataTable = createAction('[Table] Edit DataTable', props<{ data: any, title: string, page: number, scroll: boolean }>())
export const FailService = createAction('[Table] Fail Service', props<{ disconnect: boolean }>());
