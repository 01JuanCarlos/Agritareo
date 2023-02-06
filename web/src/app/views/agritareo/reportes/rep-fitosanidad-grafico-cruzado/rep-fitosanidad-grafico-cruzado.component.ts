import { AfterViewInit, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { Chart } from 'chart.js';
import { ReportesService } from '../reportes.service';
import * as moment from 'moment'

@Component({
  selector: 'ns-rep-fitosanidad-grafico-cruzado',
  templateUrl: './rep-fitosanidad-grafico-cruzado.component.html',
  styleUrls: ['./rep-fitosanidad-grafico-cruzado.component.scss'],
  providers: [
    ReportesService,
  ]
})
export class RepFitosanidadGraficoCruzadoComponent implements OnInit, AfterViewInit {
  @ViewChild('chart') chart: any;
  chartObj: any;
  form: FormGroup;

  lastDateF: any;
  lastDateI: any;

  xAxis = [];
  cultivos = [];
  conceptos = [];
  conceptosF = [];
  lotes = [];
  // graphData = [];

  constructor(
    private zone: NgZone,
    private http: AppHttpClientService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
  this.form = this.fb.group({
    cultivo: '',
    concepto: '',
    fecha_inicio: '',
    fecha_fin: '',
  })
    const fecha_inicio = moment().clone().startOf('month').format('YYYY-MM-DD');
    const fecha_fin = moment().clone().endOf('month').format('YYYY-MM-DD');

    this.form.patchValue({ fecha_inicio, fecha_fin });

    this.setInitialData();
  }


  ngAfterViewInit() {
    this.plotChart();
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
          labels: this.xAxis,
          datasets: this.graphData
        },
        options: {
          maintainAspectRatio: false,
          scales: {
            yAxes: [{
              ticks: {
                display: false
              }
            }]
          }
        }
      });
    });
  }


  updateConceptosF() {
    this.conceptosF = this.conceptos.filter(it => it.idconcepto_agricola_cultivo == this.form.value.cultivo);
    if (this.conceptosF.length) {
      this.form.patchValue({ concepto: this.conceptosF[0].idconcepto_agricola });
    }
  }

  get graphData() {
    let cloneLotes = [...(this.lotes || [])]

    let selectedCultivo = this.form.value.cultivo;
    if (this.cultivos.length && !selectedCultivo) {
      this.form.patchValue({ cultivo: this.cultivos[0].idcultivo });
      selectedCultivo = this.form.value.cultivo;
    }
    if (!!selectedCultivo) {
      cloneLotes = cloneLotes.filter(it => it.idcultivo === +selectedCultivo);
    }

    this.updateConceptosF();

    let selectedConcepto = this.form.value.concepto;

    if (!!selectedConcepto) {
      cloneLotes = cloneLotes.filter(lote => {
        const f = lote.evaluaciones_sanitarias.map(c => c.idconcepto_agricola)
        return f.includes(+selectedConcepto)
      })
    }

    if (selectedCultivo == '' || selectedConcepto == '') {
      return []
    }

    return cloneLotes.map(lote => {
      const graph: any = {}

      const data = this.xAxis.map(it => {
        const reversed = lote.evaluaciones_sanitarias.reverse();
        const fil = reversed.find(e => moment(e.fecha).format('DD/MM/YY') === it)
        return fil ? fil.valor_encontrado : Number.NaN
        // return fil ? fil.valor_encontrado : 0
      });

      const rgb = this.hexToRGB(lote.color)
      graph.label = lote.centro_costo;
      graph.data = data;
      graph.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
      graph.borderColor = lote.color;
      graph.borderWidth = 1;
      // graph.showLine = true //<- set this
      graph.fill = true;
      return graph
    })
  }

  hexToRGB(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  setInitialData() {
    const { fecha_inicio, fecha_fin } = this.form.value

    if (this.lastDateI === fecha_inicio && this.lastDateF === fecha_fin) {
      return
    }

    this.lastDateI = fecha_inicio
    this.lastDateF = fecha_fin

    this.http.get('phytosanitary-report-graphic', { i: fecha_inicio, f: fecha_fin }).subscribe(data => {
      const i = data.meta.fecha_inicio;
      const f = data.meta.fecha_fin;

      const fecha_inicio = moment(i).format('YYYY-MM-DD');
      const fecha_fin = moment(f).format('YYYY-MM-DD');
      this.form.patchValue({ fecha_inicio, fecha_fin });

      const diff = Math.abs(moment(i).diff(moment(f), 'days'));
      const days = [...Array(diff).keys()];

      this.xAxis = days.map(el => moment(i).add(el, 'days').format('DD/MM/YY'));

      this.cultivos = data?.cultivos || [];
      this.conceptos = data?.conceptos_agricolas || [];
      this.conceptosF = data?.conceptos_agricolas || [];
      this.lotes = data?.lotes || [];

      this.plotChart();
    });
  }

}
