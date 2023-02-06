import { Component, NgZone, OnInit, ViewChild, AfterViewInit, Injector, ElementRef, Renderer2 } from '@angular/core';
import * as moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Chart } from 'chart.js';
import { NsDocument } from '@app/common/decorators/document.decorator';
import { AbstractList } from '@app/common/classes/abstract-list.class';
import * as PJ from 'print-js';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { MAQUINARIA } from '@app/common/constants/agritareo.constants';

@Component({
  selector: 'ns-rep-maquinaria-tabla-grafico',
  templateUrl: './rep-maquinaria-tabla-grafico.component.html',
  styleUrls: ['./rep-maquinaria-tabla-grafico.component.scss']
})

@NsDocument({
  viewURL: MAQUINARIA,
  isList: true,
})

export class RepMaquinariaTablaGraficoComponent extends AbstractList implements OnInit {
  @ViewChild('chart') chart: any;
  @ViewChild('getDataChart') getDataChart: ElementRef;
  form: FormGroup;
  MAQUINARIA: any;

  listViewMode = true;
  data = [];
  datae = [];
  dataFecha = [];

  idTipo;
  fileOption = 'pdf';
  selectPrint: boolean;

  lastDateInicio = '';
  lastDateFin = '';
  centrosDeCosto = []
  loteActividadList = [];
  loteMaquinistaList = [];
  loteMaquinaList = [];
  loteList = [];
  tableList = [];
  chartObj: any;



  tableHeader = [
    { field: 'id', label: 'Id', visible: false },
    { field: 'Nro_Parte', label: 'Nro_Parte' },
    { field: 'Unidad_Operativa', label: 'Unidad_Operativa' },
    { field: 'IdActividad', label: 'IdActividad', visible: false },
    { field: 'Actividad', label: 'Actividad' },
    { field: 'Implemento', label: 'Implemento' },
    { field: 'IdMaquinista', label: 'IdMaquinista', visible: false},
    { field: 'Maquinista', label: 'Maquinista' },
    { field: 'IdMaquina', label: 'IdMaquina', visible: false },
    { field: 'Maquina', label: 'Maquina' },
    { field: 'Fecha', label: 'Fecha', isDate: true },
    { field: 'Combustible_Repuesto', label: 'Combustible_Repuesto' },
    { field: 'Avance_Horometro', label: 'Avance_Horometro' },
    { field: 'Horas_Trabajadas', label: 'Horas_Trabajadas' },
    { field: 'Centro_Costo', label: 'Centro_Costo' },
    { field: 'Avance_Ha', label: 'Avance_Ha' },
    { field: 'Gls_Hora', label: 'Gls_Hora' },
    { field: 'Gls_Avance_Horometro', label: 'Gls_Avance_Horometro' },
    { field: 'Hrs_Ha', label: 'Hrs_Ha' },
    { field: 'Gls_Ha', label: 'Gls_Ha' },
    { field: 'Hora_Horometro_Horea_Reloj', label: 'Hora_Horometro_Horea_Reloj' },
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
      maquina: '',
      selected_actividad: '',
      selected_maquinista: ''
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
              text: 'Grafico de maquinaria',
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
                text: 'Horas trabajadas',
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
        return it
      })

      this.http.get('actividad').subscribe(data => {
        this.loteActividadList = data.map(it => {
          return it
        })
      })

      this.http.get('maquinista').subscribe(data => {
        this.loteMaquinistaList = data.map(it => {
          return it
        })
      })

      this.http.get('maquina').subscribe(data => {
        this.loteMaquinaList = data.map(it => {
          return it
        })
      })

      // this.viewURL.map(it => {
      //   console.log(it)
      // })

      const fechaInicio = new Date(data.meta.fecha_inicio).toISOString();
      const fechaFin = new Date(data.meta.fecha_fin).toISOString();

      this.lastDateFin = data.meta.fecha_fin.split('T')[0];
      this.lastDateInicio = data.meta.fecha_inicio.split('T')[0];

      this.form.patchValue({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    })
  }

  getValue(event: Event): any {
    const getLoteId = (event.currentTarget as HTMLInputElement).value;
    const id = getLoteId

    this.http.get(`graphic-machinery/${id}`, { i: this.lastDateInicio, f: this.lastDateFin }).subscribe(response => {
      this.data = response.dataset
      this.datae = response.dataset.label
      this.dataFecha = response.labels
      this.plotChart();
    });
    return getLoteId
  }

  updatedDate(val?: string) {
    const { fecha_inicio, fecha_fin } = this.form.value;
    const i = fecha_inicio.split('T')[0];
    const f = fecha_fin.split('T')[0];

    if (this.lastDateFin !== f || this.lastDateInicio !== i) {
      this.lastDateFin = f;
      this.lastDateInicio = i;
      this.setInitialData(i, f);
    }
  }

  downloadData(print = false) {
    const r = this.form.value.selected_tipo_registro;
    const e = this.form.value.selected_evaluador;
    const headers = this.tableHeader.filter(it => it.visible !== false).map(it => ({ field: it.field, label: it.label }));
    this.http.post('download', { headers, file: print ? 'pdf' : this.fileOption, cid: 'BITACORA_MAQUINARIA', r, e },
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

  //asdasdasdas
  updateEstadoEvaluador() {
    this.http.patch(this.viewURL, this.selectedItem.id, null, { isTransaction: true }).subscribe();
  }

}
