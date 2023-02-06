import { Component, NgZone, OnInit, ViewChild, AfterViewInit, Injector, ElementRef, Renderer2 } from '@angular/core';
import * as moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Chart } from 'chart.js';
import { NsDocument } from '@app/common/decorators/document.decorator';
import { MANO_DE_OBRA } from '@app/common/constants/agritareo.constants';
import { AbstractList } from '@app/common/classes/abstract-list.class';
import * as PJ from 'print-js';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectItemGroup } from 'primeng/api';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { ReportesService } from '../reportes.service';

@Component({
  selector: 'ns-rep-mano-de-obra-grafico',
  templateUrl: './rep-mano-de-obra-grafico.component.html',
  styleUrls: ['./rep-mano-de-obra-grafico.component.scss']
})

@NsDocument({
  viewURL: MANO_DE_OBRA,
  isList: true,
})

export class RepManoDeObraGraficoComponent extends AbstractList implements AfterViewInit, OnInit {
  @ViewChild('chart') chart: any;
  @ViewChild('getDataChart') getDataChart: ElementRef;
  form: FormGroup;
  listViewMode = true;
  data = [];
  dataFecha = [];

  idTipo;
  fileOption = 'pdf';
  selectPrint: boolean;

  lastDateInicio = '';
  lastDateFin = '';
  centrosDeCosto = []
  loteList = [];
  laborList = [];
  chartObj: any;
  getLoteId: any;
  getLabor: any;

  tableHeader = [
    { field: 'id', label: 'Id', visible: false },
    { field: 'nombre', label: 'Lote' },
    { field: 'fecha', label: 'Fecha', isDate: true },
    { field: 'desclabor', label: 'Labor' },
    { field: 'desactividad', label: 'Descactividad' },
    { field: 'jornales', label: 'Jornales' },
  ];

  constructor(
    injector: Injector,
    private fb: FormBuilder,
    public http: AppHttpClientService,
    private zone: NgZone,
    private renderer2: Renderer2,
  ) { super(injector); }

  ngOnInit() {
    this.form = this.fb.group({
      fecha_inicio: '',
      fecha_fin: '',
      selected_lote: '',
      selected_labor: ''
    });
    this.setInitialData();
  }

  ngAfterViewInit() {
    this.plotChart();
  }

  formatDate(date: string) {
    return moment(new Date(date)).format('MM/YYYY');
  }

  plotChart() {
    if (this.chartObj) {
      this.chartObj.destroy()
    }

    const ctx = this.chart.nativeElement.getContext('2d');
    this.zone.runOutsideAngular(() => {
      this.chartObj = new Chart(ctx, {
        type: 'bar',
        data:
        {
          labels: this.dataFecha,
          datasets: this.data,
          hoverOffset: 4
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Grafico de Mano de obra',
              color: 'black',
              font: {
                size: 20,
                weight: 'normal',
                fontFamily: 'system-ui',
              },
            },
            legend: {
              position: 'top',
              labels: {
                padding: 20,
                boxWidth: 15,
                fontFamily: 'system-ui',
                fontColor: 'black',
                color: 'black',
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Fecha',
                color: 'black',
                font: {
                  size: 20,
                  weight: 'normal',
                  fontFamily: 'system-ui',
                },
                padding: { top: 20, left: 0, right: 0, bottom: 0 }
              },
              legend: {
                position: 'top',
                labels: {
                  padding: 20,
                  boxWidth: 15,
                  fontFamily: 'system-ui',
                  fontColor: 'black',
                  color: 'black',
                }
              }
            },
            y: {
              display: true,
              title: {
                display: true,
                text: 'Jornales',
                color: 'black',
                font: {
                  size: 20,
                  weight: 'normal',
                  fontFamily: 'system-ui',
                },
                padding: { top: 30, left: 0, right: 0, bottom: 0 }
              }
            }
          },
          layout: {
            padding: {
              right: 50,
            }
          },
          tooltips: {
            backgroundColor: '#0584f6',
            titleFontSize: 20,
            xPadding: 20,
            yPadding: 20,
            bodyFontSize: 15,
            bodySpacing: 10,
            mode: 'x',
          },
          elements: {
            line: {
              borderWidth: 8,
              fill: false,
            },
            point: {
              radius: 6,
              borderWidth: 4,
              backgroundColor: 'white',
              hoverRadius: 8,
              hoverBorderWidth: 4,
            }
          }
        }
      });
    });
  }

  setInitialData(i?: string, f?: string) {
    this.http.get('phytosanitary-report', { i, f }).subscribe(data => {
      this.centrosDeCosto = (data.lotes || []).map(it => {
        return it;
      });

      this.http.get('report-manoObra').subscribe(data => {
        this.loteList = data.map(it => {
          return it;
        });
      });


      this.http.get('report-labor').subscribe(data => {
        this.laborList = data.map(it => {
          return it;
        });
      });

      const fechaInicio = new Date(data.meta.fecha_inicio).toISOString();
      const fechaFin = new Date(data.meta.fecha_fin).toISOString();

      this.lastDateFin = data.meta.fecha_fin.split('T')[0];
      this.lastDateInicio = data.meta.fecha_inicio.split('T')[0];

      this.form.patchValue({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    });
  }

  getValue(event: any): any {
    this.getLoteId = (event.currentTarget as HTMLInputElement).value;
    this.getData(this.getLoteId);
    return this.getLoteId
  }

  getData(id: number): void {
    this.getLabor = this.http.get(`graphic-table-labor/${id}`, { i: this.lastDateInicio, f: this.lastDateFin }).subscribe(response => {
      this.data = response.dataset
      this.dataFecha = response.labels
      this.plotChart();
    });
  }

  updatedDate() {
    const { fecha_inicio, fecha_fin } = this.form.value;
    const i = fecha_inicio.split('T')[0];
    const f = fecha_fin.split('T')[0];
    const e = this.getLoteId;

    if (this.lastDateFin !== f || this.lastDateInicio !== i) {
      this.lastDateFin = f;
      this.lastDateInicio = i;
      // this.setInitialData(i, f);
    }
    this.getData(e);
  }

  downloadData(print = false) {
    const r = this.form.value.selected_tipo_registro;
    const e = this.form.value.selected_evaluador;
    const headers = this.tableHeader.filter(it => it.visible !== false).map(it => ({ field: it.field, label: it.label }));
    this.http.post('download', { headers, file: print ? 'pdf' : this.fileOption, cid: 'MANO_DE_OBRA', r, e },
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

  updateEstadoEvaluador() {
    this.http.patch(this.viewURL, this.selectedItem.id, null, { isTransaction: true }).subscribe();
  }
}
