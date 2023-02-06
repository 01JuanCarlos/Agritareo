import { Component, NgZone, OnInit, ViewChild, AfterViewInit, Injector, ElementRef, Renderer2 } from '@angular/core';
import { AbstractList } from '@app/common/classes/abstract-list.class';
import { CLIMA } from '@app/common/constants/agritareo.constants';
import { NsDocument } from '@app/common/decorators/document.decorator';
import * as PJ from 'print-js';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import * as moment from 'moment';
import { Chart } from 'chart.js';

@Component({
  selector: 'ns-clima',
  templateUrl: './clima.component.html',
  styleUrls: ['./clima.component.scss']
})

@NsDocument({
  viewURL: CLIMA,
  isList: true,
})

export class ClimaComponent extends AbstractList implements OnInit {
  @ViewChild('chart') chart: any;
  @ViewChild('getDataChart') getDataChart: ElementRef;
  form: FormGroup;
  tableHeader = [
    { label: 'Id', field: 'id', visible: false },
    { label: 'Humedad', field: 'humedad' },
    { label: 'Descripcion', field: 'descripcion' },
    { label: 'Velocidad', field: 'velocidad' },
    { label: 'Grados', field: 'grados' },
    { label: 'TimeZone', field: 'timezone' },
    { label: 'Fecha', field: 'dia', isDate: true },
    { label: 'Nombre', field: 'nombre' },
    { label: 'Temperatura', field: 'temperatura' },
  ];

  myDate;
  listViewMode = true;
  data = [];
  dataFecha: any = [];
  fileOption = 'pdf';
  selectPrint: boolean;

  lastDateInicio = '';
  lastDateFin = '';
  centrosDeCosto = []
  loteList = [];
  chartObj: any;
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
        selected_lote: '',
        lote: ''
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
              text: 'Grafico de clima',
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
                text: 'Temperatura °Kelvin',
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
              fill: true,
              backgroundColor: 'Aquamarine'
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

      this.http.get('lote-clima').subscribe(data => {
        this.loteList = data.map(it => {
          return it
        })
      })

      const fechaInicio = new Date(data.meta.fecha_inicio).toISOString();
      const fechaFin = new Date(data.meta.fecha_fin).toISOString();

      this.lastDateFin = data.meta.fecha_fin.split('T')[0];
      this.lastDateInicio = data.meta.fecha_inicio.split('T')[0];

      this.form.patchValue({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    })
  }

  getValue(e: any): any {
    this.getLoteId = e
    const id = this.getLoteId

    this.b64 = window.btoa(id)
    this.getData(this.b64);

    return this.getLoteId
  }

  getData(b64) {
    this.http.get(`multi-clima/${b64}`, { i: this.lastDateInicio, f: this.lastDateFin }).subscribe(response => {
      this.data = response.dataset
      this.dataFecha = response.labels
      // this.myDate = this.formatDate(this.dataFecha)
      this.myDate = moment(this.dataFecha).format('L')
      console.log(this.myDate)
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
    const headers = this.tableHeader.filter(it => it.visible !== false).map(it => ({ field: it.field, label: it.label }));
    this.http.post('download', { headers, file: print ? 'pdf' : this.fileOption, cid: 'CLIMA' },
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
