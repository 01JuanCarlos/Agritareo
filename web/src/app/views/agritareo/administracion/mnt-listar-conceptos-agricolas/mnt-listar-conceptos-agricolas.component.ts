import { Component, Injector } from '@angular/core';
import { AbstractList } from '@app/common/classes/abstract-list.class';
import { CONCEPTOS } from '@app/common/constants/agritareo.constants';
import { NsDocument } from '@app/common/decorators/document.decorator';
import * as PJ from 'print-js';

@Component({
  selector: 'ns-mnt-listar-conceptos-agricolas',
  templateUrl: './mnt-listar-conceptos-agricolas.component.html',
  styleUrls: ['./mnt-listar-conceptos-agricolas.component.scss']
})

@NsDocument({
  viewURL: CONCEPTOS,
  isList: true,
})
export class MntListarConceptosAgricolasComponent extends AbstractList {

  tableHeader = [
    { field: 'id', label: 'Id', visible: false },
    { field: 'tipo_concepto', label: 'Tipo Concepto' },
    { field: 'codigo', label: 'Cod. Concepto' },
    { field: 'nombre', label: 'Nombre' },
    { field: 'nombre_cientifico', label: 'Nombre Científico' },
  ];

  fileOption = 'pdf';
  selectPrint: boolean;

  constructor(injector: Injector) {
    super(injector);
  }

  downloadData(print = false) {
    const headers = this.tableHeader.filter(it => it.visible !== false).map(it => ({ field: it.field, label: it.label }));
    this.http.post('download', { headers, file: print ? 'pdf' : this.fileOption, cid: 'CONCEPTO_AGRICOLA' },
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
