import { Component, Injector } from '@angular/core';
import { AbstractList } from '@app/common/classes/abstract-list.class';
import { CAMPANIA_AGRICOLA } from '@app/common/constants/agritareo.constants';
import { NsDocument } from '@app/common/decorators/document.decorator';
import * as PJ from 'print-js';

@Component({
  selector: 'ns-mnt-listar-campanias-agricolas',
  templateUrl: './mnt-listar-campanias-agricolas.component.html',
  styleUrls: ['./mnt-listar-campanias-agricolas.component.scss']
})

@NsDocument({
  viewURL: CAMPANIA_AGRICOLA,
  isList: true,
})
export class MntListarCampaniasAgricolasComponent extends AbstractList {
  tableHeader = [
    { label: 'Id', field: 'id', visible: false },
    { label: 'Codigo', field: 'codigo' },
    { label: 'Descipcion', field: 'descripcion' },
    { label: 'Cultivo', field: 'cultivo' },
    { label: 'Año', field: 'anio' },
  ];

  fileOption = 'pdf';
  selectPrint: boolean;

  constructor(injector: Injector) {
    super(injector);
  }

  downloadData(print = false) {
    const headers = this.tableHeader.filter(it => it.visible !== false).map(it => ({ field: it.field, label: it.label }));
    this.http.post('download', { headers, file: print ? 'pdf' : this.fileOption, cid: 'CAMPANIA_AGRICOLA' },
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
