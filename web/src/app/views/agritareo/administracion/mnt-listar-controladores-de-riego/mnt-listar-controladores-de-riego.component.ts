import { Component, Injector } from '@angular/core';
import { AbstractList } from '@app/common/classes/abstract-list.class';
import { CONTROLADOR_RIEGO } from '@app/common/constants/agritareo.constants';
import { NsDocument } from '@app/common/decorators/document.decorator';
import * as PJ from 'print-js';

@Component({
  selector: 'ns-mnt-listar-controladores-de-riego',
  templateUrl: './mnt-listar-controladores-de-riego.component.html',
  styleUrls: ['./mnt-listar-controladores-de-riego.component.scss']
})

@NsDocument({
  viewURL: CONTROLADOR_RIEGO,
  isList: true,
})

export class MntListarControladoresDeRiegoComponent extends AbstractList {
  tableHeader = [
    { field: 'Id', label: 'id', visible: false },
    { field: 'codigo', label: 'Codigo' },
    { field: 'nombre', label: 'Nombre' }
  ]

  fileOption = 'pdf';
  selectPrint: boolean;

  constructor(injector: Injector) {
    super(injector)
  }

  downloadData(print = false) {
    const headers = this.tableHeader.filter(it => it.visible !== false).map(it => ({ field: it.field, label: it.label }));
    this.http.post('download', { headers, file: print ? 'pdf' : this.fileOption, cid: 'CONTROLADOR_RIEGO' },
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
