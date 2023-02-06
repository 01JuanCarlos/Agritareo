import { Component, Injector } from '@angular/core';
import { AbstractList } from '@app/common/classes/abstract-list.class';
import { ESTADOS_FENOLOGICOS } from '@app/common/constants/agritareo.constants';
import { NsDocument } from '@app/common/decorators/document.decorator';
import * as PJ from 'print-js';

@Component({
  selector: 'ns-mnt-listar-estados-fenologicos',
  templateUrl: './mnt-listar-estados-fenologicos.component.html',
  styleUrls: ['./mnt-listar-estados-fenologicos.component.scss']
})

@NsDocument({
  viewURL: ESTADOS_FENOLOGICOS,
  isList: true,
})
export class MntListarEstadosFenologicosComponent extends AbstractList {

  tableHeader = [
    { field: 'id', label: 'Id', visible: false },
    { field: 'zona_geografica', label: 'Zona' },
    { field: 'cultivo', label: 'Cultivo' },
    { field: 'variedad', label: 'Variedad' },
    { field: 'fecha_inicio', label: 'Fecha Inicio' },
  ];

  fileOption = 'pdf';
  selectPrint: boolean;

  constructor(injector: Injector) {
    super(injector);
  }

  downloadData(print = false) {
    const headers = this.tableHeader.filter(it => it.visible !== false).map(it => ({ field: it.field, label: it.label }));
    this.http.post('download', { headers, file: print ? 'pdf' : this.fileOption, cid: 'ESTADO_FENOLOGICO' },
      { responseType: 'arraybuffer', observe: 'response' }).subscribe((response) => {
        try {
          const type = response.headers.get('content-type');
          const [, filename] = response.headers.get('Content-Disposition').match(/filename=(.*)/);
          const blob = new Blob([response.body], { type });
          const url = URL.createObjectURL(blob);

          if (print) {
            PJ({
              type: 'pdf',
              printable: url
            });
            this.selectPrint = !this.selectPrint;
            return;
          }
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          window.URL.revokeObjectURL(url);

        } catch (err) { }
      });
  }

  printPdf() {
    if (!this.selectPrint) {
      this.selectPrint = !this.selectPrint;
      this.downloadData(true);
    }

  }

  updateTable(item: any) {
    if (item.visible === undefined) {
      return item.visible = false;
    }
    item.visible = !item.visible;
  }

}
