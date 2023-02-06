import { Component, NgZone, OnInit, ViewChild, AfterViewInit, Injector, ElementRef, Renderer2 } from '@angular/core';
import * as moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Chart } from 'chart.js';
import { NsDocument } from '@app/common/decorators/document.decorator';
import { GRAFICO_TABLA_FITOSANIDAD, TIPO_BITACORA, ZONAS_GEOGRAFICAS } from '@app/common/constants/agritareo.constants';
import { AbstractList } from '@app/common/classes/abstract-list.class';
import * as PJ from 'print-js';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectItemGroup } from 'primeng/api';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { ReportesService } from '../reportes.service';
import { CONSUMO_AGUA } from '@app/common/constants/agritareo.constants';

@Component({
  selector: 'ns-rep-riego-consumo-agua',
  templateUrl: './rep-riego-consumo-agua.component.html',
  styleUrls: ['./rep-riego-consumo-agua.component.scss']
})

@NsDocument({
  viewURL: CONSUMO_AGUA,
  isList: true,
})
export class RepRiegoConsumoAguaComponent  extends AbstractList implements OnInit {
  @ViewChild('chart') chart: any;
  @ViewChild('getDataChart') getDataChart: ElementRef;
  form: FormGroup;
  CONSUMO_AGUA: any;

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
  loteAguaList = [];
  loteList = [];
  tableList = [];
  chartObj: any;

  variableValor: any = "Valor M3";
  periodo: any;



  tableHeader = [
    { field: 'id', label: 'Id', visible: false },
    { field: 'IdSucursal', label: 'IDSUCURSAL' },
    { field: 'Sucursal', label: 'SUCURSAL' },
    { field: 'IdCcosto', label: 'IDCCOSTO' },
    { field: 'C_Costo', label: 'C_COSTO' },
    { field: 'Periodo', label: 'PERIODO' },
    { field: 'Area', label: 'AREA'},
    { field: 'Horas_Riego_Acumuladas', label: 'HORAS_RIEGO_ACUMULADAS' },
    { field: 'Volumen_Acumulado', label: 'VOLUMEN_ACUMULADO' },
    { field: 'Horas_Riego_Acumuladas_Ha', label: 'HORAS_RIEGO_ACUMULADA_HA' },
    { field: 'Volumen_Acumulado_Ha', label: 'VOLUMEN_ACUMULADA_HA' },
    { field: 'Nro_dias_riego', label: 'NRO_DIAS_RIEGO' },
    { field: 'Ult_fecha_riego', label: 'T_FECHA_RIEGO', isDate: true },
    { field: 'idSiembra', label: 'IDSIEMBRA' },
    { field: 'IdCampana', label: 'IDCAMPAÑA' },
    { field: 'Inicio_Campana', label: 'INICIO_CAMPAÑA', isDate: true },
    { field: 'Fin_Campana', label: 'FIN_CAMPAÑA', isDate: true },
  ];

  constructor(
    injector: Injector,
    private fb: FormBuilder,
    public http: AppHttpClientService,
    private zone: NgZone,
    private renderer2: Renderer2,
  ) { super(injector); }
  // super(injector)


  ngOnInit() {
    this.form = this.fb.group({
      fecha_inicio: '',
      fecha_fin: '',
      periodo: '',
      selected_Periodo: ''
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
              text: 'Grafico de riego',
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
                text: this.variableValor,
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

      this.http.get('report-agua').subscribe(data => {
        this.loteAguaList = data.map(it => {
          return it
        })
      })

      this.http.get('total-agua').subscribe(data => {
        this.tableList = data.map(it => {
          return it
        })
      })

      this.http.get('report-riego-lote').subscribe(data => {
        this.loteList = data.map(it => {
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
    this.periodo = getLoteId
    const id = getLoteId

    this.http.get(`graphic-agua-consumo/${id}`, { i: this.lastDateInicio, f: this.lastDateFin }).subscribe(response => {
      this.data = response.dataset
      this.datae = response.dataset.label
      this.dataFecha = response.labels
      this.plotChart();
    });
    return getLoteId
  }

  getConsumoAgua(event: Event): any{
    const a = (event.currentTarget as HTMLInputElement).value;

    if (a == "1"){
      this.variableValor = 'Valor M3'
    }
    if (a == "2"){
      this.variableValor = 'Horas'
    }
    if (a == "3"){
      this.variableValor = 'Valor M3'
    }
    if (a == "4"){
      this.variableValor = 'Horas'
    }



    this.http.get(`graphic-agua-consumo/${this.periodo}`, { i: this.lastDateInicio, f: this.lastDateFin, a }).subscribe(response => {
      this.data = response.dataset
      this.datae = response.dataset.label
      this.dataFecha = response.labels
      this.plotChart();
    });
    console.log(a, this.periodo)
    return this.periodo
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
    this.http.post('download', { headers, file: print ? 'pdf' : this.fileOption, cid: 'BITACORA_AGUA', r, e },
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
