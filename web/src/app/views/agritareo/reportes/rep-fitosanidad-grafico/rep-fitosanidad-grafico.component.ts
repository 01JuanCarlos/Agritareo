import { AfterViewInit, Component, ElementRef, Injector, NgZone, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AbstractList } from '@app/common/classes/abstract-list.class';
import { GRAFICO_TABLA_FITOSANIDAD } from '@app/common/constants/agritareo.constants';
import { NsDocument } from '@app/common/decorators/document.decorator';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { Chart } from 'chart.js';
import * as moment from 'moment';
import * as PJ from 'print-js';

@Component({
  selector: 'ns-rep-fitosanidad-grafico',
  templateUrl: './rep-fitosanidad-grafico.component.html',
  styleUrls: ['./rep-fitosanidad-grafico.component.scss'],
})

@NsDocument({
  viewURL: GRAFICO_TABLA_FITOSANIDAD,
  isList: true,
})
export class RepFitosanidadGraficoComponent extends AbstractList implements AfterViewInit, OnInit {
  @ViewChild('chart') chart: any;
  @ViewChild('getDataChart') getDataChart: ElementRef;
  form: FormGroup;
  listViewMode = true;
  noteView = true;
  sectoresList = [];
  cultivosList = [];
  cultivosListF = [];
//ss
  tableHeader = [
    { field: 'id', label: 'Id', visible: false },
    { field: 'tipo_registro', label: 'Tipo registro', isColored: true, color: '#CBF90B' },
    { field: 'parcela', label: 'Lote' },
    { field: 'fecha', label: 'Fecha', isDate: true },
    { field: 'evaluador', label: 'Evaluador' },
    { field: 'cultivo', label: 'Cultivo' },
    { field: 'concepto_agricola', label: 'Concepto Agricola' },
    { field: 'organo_afectado', label: 'Órgano afectado' },
    { field: 'valor_encontrado', label: 'Valor encontrado' },
    // { field: 'imagenes', label: 'N° Imagenes' },
    { field: 'glosa', label: 'Notas' },
  ];

  idTipo;
  fileOption = 'pdf';
  selectPrint: boolean;
  chartObj: any;
  selectedLoteId: number;
  selectedLote: any;
  lastDateInicio = '';
  lastDateFin = '';

  centrosDeCosto = [];
  dataset = [];
  data = [];
  xAxis = [];
  dataFecha = [];

  selectedZona: any;
  evaluadorList: any;
  conceptoList: any;
  cultivoList: any;
  organoList: any;
  loteList: any;
  image: any;
  getLoteId: any;
  b64: any;

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
      selected_sector: '',
      selected_tipo_registro: '',
      selected_evaluador: '',
      selected_zona: '',
      selected_concepto: '',
      selected_cultivo: '',
      selected_organo: '',
      selected_lote: '',
      selected_multiple_lote: ''
    });
    this.setInitialData();
    this.getImage();
  }

  ngAfterViewInit() {
    this.plotChart();
  }

  formatDate(date: string) {
    return moment(new Date(date)).format('MM/YYYY');
  }

  setInitialData(i?: string, f?: string) {
    this.http.get('phytosanitary-report', { i, f }).subscribe(data => {
      this.centrosDeCosto = (data.lotes || []).map(it => {
        return it;
      });

      const fechaInicio = new Date(data.meta.fecha_inicio).toISOString();
      const fechaFin = new Date(data.meta.fecha_fin).toISOString();

      this.lastDateFin = data.meta.fecha_fin.split('T')[0];
      this.lastDateInicio = data.meta.fecha_inicio.split('T')[0];

      this.form.patchValue({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    });

    this.http.get('report-concept').subscribe(data => {
      this.conceptoList = data.map(it => {
        return it;
      });
    });
    this.http.get('evaluador').subscribe(data => {
      this.evaluadorList = data.map(it => {
        return it;
      });
    });
    this.http.get('report-cultivo').subscribe(data => {
      this.cultivoList = data.map(it => {
        return it;
      });
    });
    this.http.get('report-organo').subscribe(data => {
      this.organoList = data.map(it => {
        return it;
      });
    });
    this.http.get('report-lote').subscribe(data => {
      this.loteList = data.map(it => {
        return it;
      });
    });
  }

  getImage(){
    this.http.get(`table-image`).subscribe(data => {
      this.image = data.map(it => {
        return it;
      });
    });
  }

  plotChart() {
    if (this.chartObj) {
      this.chartObj.destroy();
    }

    const ctx = this.chart.nativeElement.getContext('2d');
    this.zone.runOutsideAngular(() => {
      this.chartObj = new Chart(ctx, {
        type: 'line',
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
              text: 'Grafico de fitosanidad',
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
                text: 'Valor',
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

  getValue(event: Event):any {
    const getLoteId = (event.currentTarget as HTMLInputElement).value;
    const id = getLoteId;

    try{
    this.http.get(`graphic-table-phytosanitary/${id}`, { i: this.lastDateInicio, f: this.lastDateFin }).subscribe(response => {
      this.data = response.dataset;
      this.dataFecha = response.labels;
      this.plotChart();
    });
  } catch (e) {
    alert('No tiene datos en este rango de fecha');
    }
      return getLoteId;
  }

  getData(b64) {
    this.http.get(`multi-phytosanitary/${b64}`, { i: this.lastDateInicio, f: this.lastDateFin }).subscribe(response => {
      this.data = response.dataset
      this.dataFecha = response.labels
      this.plotChart();
    });
  }
  updatedDate(val?: string) {
    const { fecha_inicio, fecha_fin } = this.form.value;
    const i = fecha_inicio.split('T')[0];
    const f = fecha_fin.split('T')[0];
    const e = this.b64;

    if (this.lastDateFin !== f || this.lastDateInicio !== i) {
      this.lastDateFin = f;
      this.lastDateInicio = i;
      this.setInitialData(i, f);
    }
    this.getData(e);
  }

  downloadData(print = false) {
    const r = this.form.value.selected_tipo_registro;
    const e = this.form.value.selected_evaluador;
    const headers = this.tableHeader.filter(it => it.visible !== false).map(it => ({ field: it.field, label: it.label }));
    this.http.post('download', { headers, file: print ? 'pdf' : this.fileOption, cid: 'GRAFICO_TABLA_FITOSANIDAD', r, e },
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

  getCampanas() {
    this.http.get('report-sector').subscribe((data) => {
      this.sectoresList = Array.from(new Set(data.map((it: any) => it.nombrenivel)));

      (data || []).forEach(element => {
        const find = this.cultivosList.findIndex(it => it.value === element.idcultivo && it.campana === element.nombrenivel);
        if (find === -1) {
          this.cultivosList.push({ campana: element.anio, label: element.nombre_cultivo, value: element.idcultivo });
        }
      });

      this.updatedSelectedSector();
    });
  }

  updatedSelectedSector() {
    if (!this.form.value.selected_sector) {
      this.cultivosListF = [];
      this.cultivosList.forEach(element => {
        const find = this.cultivosListF.findIndex(it => it.value === element.value);
        if (find === -1) {
          this.cultivosListF.push({ label: element.label, value: element.value });
        }
      });
      return;
    }

    this.cultivosListF = this.cultivosList.filter(it => it.nombrenivel.toString() === (this.form.value.selected_sector || '').toString());
  }

}
