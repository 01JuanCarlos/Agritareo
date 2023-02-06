import { Injectable } from '@angular/core';
import { COMPONENT_ACTION_TYPE, COMPONENT_TYPE, PARAM_ACTION_ID, PARAM_COMPONENT_ID, PARAM_TYPE_ID, REPORT_DESIGNER_PATH } from '@app/common/constants';
import { UniqueID } from '@app/common/utils';
import { AppHttpClientService, HttpMethods, IRequestOptions } from '@app/services/util-services/app-http-client.service';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { BlockUIService } from '../util-services/blockui.service';
import { SweetAlertService } from '../util-services/sweet-alert.service';
import { TableComponent } from '@app/components/table/table.component';
import { NotificationService } from '../util-services/notifications.service';

export class TableServiceManager {
  public from: string;
  public pages = [];
  public filters = {};
  public recordsFiltered = 0;
  public recordsTotal = 0;
  public currentPage = 0;
  public lastSort = [];
  public start = 0;
  public length = 0;
  public search = '';
  public selected = null;

  constructor(
    public table: TableComponent,
    public componentId: string,
    public procedureId: string,
    public path: string,
    public fromPath?: boolean) {
    this.from = this.componentId || this.procedureId || this.path;
  }

  updateProcedureId(componentId: string) {
    this.procedureId = componentId;
  }

  updateCurrentPage(page: number) {
    this.currentPage = page;
  }

  registerPage(page: number, data: any[]) {
    if (!isNaN(page) && data?.length) {
      this.pages[+page] = data;
      this.currentPage = page;
    }
  }

  clearPage(page: number) {
    this.pages[+page] = [];
    delete this.pages[+page];
  }

  clear() {
    this.pages = [];
    this.recordsTotal = 0;
    this.recordsTotal = 0;
    this.currentPage = 0;
  }

  registerMeta(meta: { recordsTotal: number, recordsFiltered: number }) {
    this.recordsFiltered = meta.recordsFiltered;
    this.recordsTotal = meta.recordsTotal;
  }

  hasPage(page: number) {
    return page in this.pages;
  }

  getPage(page: number): any[] {
    return this.pages[+page];
  }
}

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private serviceManager = new Map<string, TableServiceManager>();

  constructor(
    private http: AppHttpClientService,
    private alert: SweetAlertService,
    private blockui: BlockUIService,
    private notification: NotificationService,
  ) { }

  registerComponent(table: TableComponent) {

    const tableService = this.serviceManager.get(table.componentId);

    if (!tableService) {
      this.serviceManager.set(
        table.componentId,
        new TableServiceManager(
          table,
          table.componentId,
          table.procId,
          table.path,
          !!table.path
        )
      );
    } else {
      tableService.table = table;
    }

    return tableService;
  }

  destroyComponent(componentId: string) {
    // console.log({ componentId, uno: 3 })
    if (this.serviceManager.has(componentId)) {
      // console.log({ serviceManager: this.serviceManager.get(componentId) });
      this.serviceManager.get(componentId).table = null;
    }
  }

  updateProcedureId(componentId: string, procId: string) {
    if (this.serviceManager.has(componentId)) {
      this.serviceManager.get(componentId).updateProcedureId(procId);
    }
  }

  clearCache(componentId: string) {
    this.serviceManager.delete(componentId);
  }

  setSelected(componentId: string, row: any) {
    const tableService = this.serviceManager.get(componentId);
    if (!!tableService) {
      tableService.selected = row;
    }
  }

  hasSelected(componentId: string) {
    const tableService = this.serviceManager.get(componentId);
    if (!!tableService) {
      return !!tableService.selected;
    }
  }

  getSelected(componentId: string) {
    const tableService = this.serviceManager.get(componentId);
    if (!!tableService) {
      return tableService.selected;
    }
  }

  clearPageCache(componentId: string, page: number) {
    const tableService = this.serviceManager.get(componentId);
    if (!!tableService) {
      tableService.clearPage(page);
    }
  }

  ajax(componentId: string, body?: any, options?: IRequestOptions) {
    const tableService = this.serviceManager.get(componentId);
    let http: Observable<any> = null;

    if (tableService.fromPath) {
      http = this.http.get(tableService.path, body, options);
    } else {
      http = this.http.dataHandler(tableService.procedureId, {
        [PARAM_TYPE_ID]: COMPONENT_TYPE.TABLE,
        [PARAM_COMPONENT_ID]: tableService.componentId || '',
        ...body
      }, options);
    }

    return http.pipe(tap(result => {
      if (result && result.meta) {
        if (result.meta.dataId) {
          tableService.updateProcedureId(result.meta.dataId);
        }
      }
    }));

  }

  printRows(componentId: string) {
    if (componentId && this.serviceManager.has(componentId)) {
      const tableService = this.serviceManager.get(componentId);

      this.blockui.show('Obteniendo formato de impresión.');

      this.ajax(componentId, {
        [PARAM_ACTION_ID]: COMPONENT_ACTION_TYPE.PRINT,
        start: tableService.start,
        length: tableService.length,
        sort: tableService.lastSort,
        search: tableService.search
      },
        {
          responseType: 'arraybuffer',
          componentId
        }
      )
        .pipe(
          finalize(() => this.blockui.hide())
        )
        .subscribe(result => {
          try {
            const blob = new Blob([result], { type: 'application/pdf' });
            if (navigator && navigator.msSaveOrOpenBlob) {
              navigator.msSaveOrOpenBlob(blob, UniqueID() + '.pdf');
            }
            const url = URL.createObjectURL(blob);
            const pwa = window.open(url);
            if (!pwa || pwa.closed || typeof pwa.closed === 'undefined') {
              console.log('Activa las ventanas emergentes / Desactiva Addblock');
            }

          } catch (err) {
            //   console.log('Pdf error ', err)
          }
        }, async err => {
          if (err && err.error) {
            const { code, message } = err.error;
            if (code && code === 1007) {
              return this.notification.error(message);
            }
            const result = await this.alert.warn('¿Desea crear un formato para el componente?', err.error.message);
            if (result) {
              // TODO: Obtener cabeceras de la tabla para enviarlo como parametro.
              // this.printformat.addPrintFormat(componentId, {
              //   docElements: [],
              //   parameters: [],
              //   styles: [],
              //   version: 2,
              //   documentProperties: {}
              // }).subscribe(idReporte => {
              //   if (!!idReporte) {
              //     window.open(REPORT_DESIGNER_PATH + '/' + idReporte.id, '_blank');
              //     // this.router.navigate([REPORT_DESIGNER_PATH + '/' + idReporte.id, '_blank']);
              //   }
              // });
            }
          }
        });
    }
  }

  hasSorted(componentId: string, sort: { column: number, dir: string }[] = []) {
    const tableService = this.serviceManager.get(componentId);
    if (!tableService || !(tableService.lastSort.length === sort.length)) {
      return true;
    }
    return !tableService.lastSort.every(ls => sort.some(s => s.column === ls.column && s.dir === ls.dir));
  }

  refreshPage(componentId: string) {
    const tableService = this.serviceManager.get(componentId);
    if (tableService) {
      if (tableService.table) {
        tableService.clear(); // Fixme: Remover localmente.
        return tableService.table.reload();
      }

      this.clearPageCache(componentId, tableService.currentPage);
      this.getRows(
        componentId, tableService.start, tableService.length, tableService.search, tableService.lastSort, tableService.filters
      ); // Pasar filtros extras...
    }
  }

  getRows(componentId: string, start: number, length: number, search?: string, sort?: any[], params?: { [param: string]: any }): Promise<any> {
    const tableService = this.serviceManager.get(componentId);
    const rowsPage = Math.ceil(start / length);
    const options: IRequestOptions = { componentId };
    if (tableService && (this.hasSorted(componentId, sort) || tableService.search !== search)) {
      tableService.clear();
    }

    if (tableService && tableService.hasPage(rowsPage)) {
      tableService.updateCurrentPage(rowsPage);
      tableService.start = start;
      tableService.length = length;
      tableService.filters = params;
      return Promise.resolve({
        data: tableService.getPage(rowsPage),
        meta: {
          recordsFiltered: tableService.recordsFiltered,
          recordsTotal: tableService.recordsTotal
        }
      });
    }

    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.ajax(componentId, { start, length, search, sort: sort || [], filters: btoa(JSON.stringify(params)) }, options).toPromise();
        const { data = [], meta = { recordsTotal: 0, recordsFiltered: 0 } } = result || { data: [] };
        // LLenar nuevos records
        if (tableService) {
          tableService.registerPage(rowsPage, data);
          tableService.registerMeta(meta);
          tableService.start = start;
          tableService.length = length;
          tableService.search = search;
          tableService.lastSort = sort;
        }
        // Retornar los records
        resolve({ data: meta.recordsFiltered === 0 ? [] : data, meta });
      } catch (err) {
        reject(err);
      }
    });
  }

  loadComponentSettings() {
    return {};
  }

  DeleteRow(componentId: string, id: string) {
    return new Observable(observer => {
      const tableService = this.serviceManager.get(componentId);
      if (tableService) {
        return this.http.dataHandler(tableService.procedureId, id, {
          isTransaction: true,
          method: HttpMethods.DELETE
        }).subscribe(result => {
          // FIXME: Elimina sin refrescar la table, pero si todas la paginas no están cargadas puede confundir.
          // for (let i = 0, len = tableService.pages.length; i < len; i++) {
          //   const page: any[] = tableService.pages[i] || [];
          //   if (page.some(row => row.id === id)) {
          //     tableService.pages[i] = page.filter(row => row.id !== id);
          //     for (let k = i; k < len; k++) {
          //       if (tableService.pages[k + 1] && tableService.pages[k + 1].length) {
          //         tableService.pages[k].push(
          //           tableService.pages[k + 1].shift()
          //         );
          //       }
          //     }
          //     break;
          //   }
          // }
          observer.next(result);
          observer.complete();
        }, err => {
          observer.error(err);
        });
      }
    });
  }

  getPrintFormats(componentId: string) {
    return this.http.get('format-component', componentId);
  }

}
