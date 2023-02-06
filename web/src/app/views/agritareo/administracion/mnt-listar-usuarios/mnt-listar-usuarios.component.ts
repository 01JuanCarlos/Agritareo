import { Component, Injector } from '@angular/core';
import { AbstractList } from '@app/common/classes/abstract-list.class';
import { EVALUADORES } from '@app/common/constants/agritareo.constants';
import { NsDocument } from '@app/common/decorators/document.decorator';
import * as PJ from 'print-js';

@Component({
  selector: 'ns-mnt-listar-usuarios',
  templateUrl: './mnt-listar-usuarios.component.html',
  styleUrls: ['./mnt-listar-usuarios.component.scss'],
})

@NsDocument({
  viewURL: EVALUADORES,
  isList: true,
})
export class MntListarUsuariosComponent extends AbstractList {
  listViewMode = true;

  tableHeader = [
    { field: 'id', label: 'Id', visible: false },
    { field: 'usuario', label: 'Usuario' },
    { field: 'nombre', label: 'Nombres' },
    { field: 'apellido_paterno', label: 'A. Paterno' },
    { field: 'apellido_materno', label: 'A. Materno' },
    { field: 'registra_evaluaciones', label: 'Es evaluador' },
    { field: 'codigo_evaluador', label: 'Codigo evaluador' },
    { field: 'color_evaluador', label: 'Color Evaluador' },
    { field: 'correo', label: 'E-mail' },
    { field: 'telefono', label: 'Teléfono' },
    { field: 'habilitado', label: 'Estado', isBoolean: true },
  ];

  fileOption = 'pdf';
  selectPrint: boolean;

  constructor(injector: Injector) {
    super(injector);
  }

  updateEstadoEvaluador() {
    this.http.patch(this.viewURL, this.selectedItem.id, null, { isTransaction: true }).subscribe();
  }

  downloadData(print = false) {
    const headers = this.tableHeader.filter(it => it.visible !== false).map(it => ({ field: it.field, label: it.label }));
    this.http.post('download', { headers, file: print ? 'pdf' : this.fileOption, cid: 'EVALUADOR' },
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
