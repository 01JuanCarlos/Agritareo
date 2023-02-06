import { Injectable } from '@angular/core';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TableActions } from '../actions';
import { EditDataTable, LoadingTable, SaveDataTable, UpdateLoadingTable } from '../actions/table.action';

@Injectable()
export class TableEffects {
  loadDataBalanceEffect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TableActions.SetDataTable),
      switchMap((action: any) => {
        let response: any;
        if (action.title === 'Balance' && action.page === 0) {
          // response = this.service.getDataBalance(action.page).pipe(
          //   map((tables: any) => {
          //     return SaveDataTable({ title: action.title, data: tables.Data, page: action.page, pageSize: tables.PageSize, headers: action.headers });
          //   }),
          //   catchError(err => of(LoadingTable({ title: action.title, loading: false, visible: true }))
          //   ),
          // );
        } else {
          // response = this.service.getDataBalance(action.page).pipe(
          //   map((tables: any) => {
          //     let finalScroll = true;
          //     if ((action.page + 1) === tables.PageSize) {
          //       finalScroll = false;
          //     }
          //     return EditDataTable({ data: tables.Data, title: action.title, page: action.page, scroll: finalScroll });
          //   }),
          //   catchError((err) => of(UpdateLoadingTable({ title: action.title, loading: false, visible: true }))),
          // );
          // LoadingTable({ title: action.title, visible: false, loading: fail });
        }
        return response;
      })
    ),
    { dispatch: false }
  );


  constructor(
    private actions$: Actions,
    private service: AppHttpClientService
  ) { }
}
