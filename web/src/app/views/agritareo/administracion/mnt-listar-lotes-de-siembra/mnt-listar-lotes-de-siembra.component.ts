import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CAMPAIGNS, CENTRO_DE_COSTOS } from '@app/common/constants/agritareo.constants';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { SweetAlertService } from '@app/services/util-services/sweet-alert.service';
import { TableSimpleComponent } from '@app/components/table-simple/table-simple.component';

import * as PJ from 'print-js';
import { ActivatedRoute, Router } from '@angular/router';
import { Logger } from '@app/common/utils/logger.util';

@Component({
  selector: 'ns-mnt-listar-lotes-de-siembra',
  templateUrl: './mnt-listar-lotes-de-siembra.component.html',
  styleUrls: ['./mnt-listar-lotes-de-siembra.component.scss'],
})
export class MntListarLotesDeSiembraComponent implements OnInit {
  @ViewChild('table', { static: false }) table: TableSimpleComponent; // fixed
  form: FormGroup;
  headerLotes = [
    { field: 'id', label: '', visible: false },
    { label: 'Parcela', field: 'codigo' },
    { label: 'Descripción', field: 'nombrenivel' },
    { label: 'Desc. Corta', field: 'nombrenivel' },
    { label: 'Cultivo', field: 'cultivo' },
    { label: 'Variedad', field: 'variedad' },
    { label: 'Año Campaña', field: 'anio' },
    { label: 'Area (Has)', field: 'area' },
    { label: 'F. Siembra', field: 'fecha_siembra', isDate: true },
    { label: '# Surcos', field: 'nro_surcos' },
    { label: '# Plantas', field: 'nro_plantas' },
    { label: 'N° Cosecha', field: 'nombrevariedad' },
    { label: 'Inic. Temporada', field: 'fecha_inicio_campania', isDate: true },
    { label: 'Inic. Cosecha', field: 'fecha_inicio_cosecha', isDate: true },
    { label: 'Fin Temporada', field: 'fecha_fin', isDate: true },
    { label: '#Sem Mant', field: 'nombrevariedad' },
    { label: '#Sem Cosecha', field: 'nombrevariedad' },
    { label: 'Producto a producir', field: 'variedad' },
    { label: 'Kilos Proy. Temporadas', field: 'nombrevariedad' },
  ];

  selectedLote: any;
  selectPrint: boolean;

  campanasList = [];
  cultivosList = [];
  cultivosListF = [];



  fileOption = 'pdf';

  constructor(
    private http: AppHttpClientService,
    private alert: SweetAlertService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      searchInput: [''],
      selectedCultivo: '',
      selectedCampana: ''
    });
    this.getCampanas();
  }

  goEditMode({ item } = { item: void 0 }) {
    if (item && item?.id) {
      this.router.navigate(['./', item?.id], { relativeTo: this.route });
      return;
    }

    Logger.warn('No existe un ID para esta URL');
  }

  deleteLote() {
    this.alert.confirmDelete('Seguro que deseas borrar el Lote: ' + this.selectedLote.codigo).then(result => {
      if (result) {
        this.http.delete(CENTRO_DE_COSTOS, this.selectedLote.id, { isTransaction: true }).subscribe(() => {
          this.table?.reaload(); // fixea
        });
      }
    });
  }

  getCampanas() {
    this.http.get(CAMPAIGNS).subscribe((data) => {
      this.campanasList = Array.from(new Set(data.map((it: any) => it.anio)));
      // (data || []).forEach(element => {
      //   const find = this.campanasList.findIndex(it => it.value === element.anio);
      //   if (find === -1) {
      //     this.campanasList.push({ label: element.anio, value: element.anio });
      //   }
      // });


      (data || []).forEach(element => {
        const find = this.cultivosList.findIndex(it => it.value === element.idcultivo && it.campana === element.anio);
        if (find === -1) {
          this.cultivosList.push({ campana: element.anio, label: element.nombre_cultivo, value: element.idcultivo });
        }
      });

      this.updatedSelectedCampana();
    });
  }

  updatedSelectedCampana() {
    if (!this.form.value.selectedCampana) {
      this.cultivosListF = [];
      this.cultivosList.forEach(element => {
        const find = this.cultivosListF.findIndex(it => it.value === element.value);
        if (find === -1) {
          this.cultivosListF.push({ label: element.label, value: element.value });
        }
      });
      return;
    }

    this.cultivosListF = this.cultivosList.filter(it => it.campana.toString() === (this.form.value.selectedCampana || '').toString());
  }


  downloadData(print = false) {
    const headers = this.headerLotes.filter(it => it.visible !== false).map(it => ({ field: it.field, label: it.label }));
    this.http.post('download', { headers, file: print ? 'pdf' : this.fileOption, cid: 'CENTROCOSTO' },
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
