import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AgritareoService } from './agritareo.service';
import * as moment from 'moment';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { FormBuilder } from '@angular/forms';
import { Chart } from 'chart.js';
import { PLAGAS } from '@app/common/constants/agritareo.constants';
import { ITS_JUST_ANGULAR } from '@angular/core/src/r3_symbols';

@Component({
  selector: 'ns-agritareo',
  templateUrl: './agritareo.component.html',
  styleUrls: ['./agritareo.component.scss'],
  providers: [
    AgritareoService
  ]
})

export class AgritareoComponent implements OnInit {
  @ViewChild('chart') chart: any;

  // TODO: Hacer referencia rutas
  sections = [
    {
      title: 'Mantenedores',
      routes: [
        { icon: 'icon-bug2', iconColor: 'text-blue-400', name: 'Plagas y conceptos', route: '../agritareo/mantenedores/plagas' },
        { icon: 'fas fa-seedling', iconColor: 'text-blue-400', name: 'Cultivos y variedades', route: '../agritareo/mantenedores/cultivos' },
        { icon: 'fas fa-file-signature', iconColor: 'text-blue-400', name: 'Centros de Costos', route: '../agritareo/mantenedores/centro-de-costos' },
        { icon: 'fas fa-route', iconColor: 'text-blue-400', name: 'Rutas', route: '' },
        { icon: 'icon-spinner10', iconColor: 'text-blue-400', name: 'Fenología', route: '../agritareo/mantenedores/fenologias' },
        { icon: 'icon-stack2', iconColor: 'text-indigo-400', name: 'Niveles', route: '../agritareo/mantenedores/niveles' },
        { icon: 'fas fa-users', iconColor: 'text-indigo-400', name: 'Evaluadores', route: '../agritareo/mantenedores/evaluadores' },
      ]
    },
    {
      title: 'Reportes',
      routes: [
        { icon: 'far fa-file', iconColor: 'text-success-400', name: 'Mantenedores', route: '../agritareo/reportes/reportesmantenedores' },
        { icon: 'icon-map', iconColor: 'text-success-400', name: 'Mapas', route: '../agritareo/reportes/reportesmapa' },
      ]
    },
  ];

  chartObj: any;
  evaluaciones = [];
  actividades = [];
  evaluador = [];
  cultivos = [];
  xLabels = [];
  yLabels = [];
  selectedCentroDeCosto: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: AppHttpClientService,
    private zone: NgZone
  ) { }

  ngOnInit() {
    // this.dashboardService.getFundos().subscribe(data => {
    //   this.centrosDeCosto = data;
    //   this.selectedCentroDeCosto = { centro: this.centrosDeCosto[0], index: 0 };
    // });
    // this.dashboardService.getActividades().subscribe(data => this.actividades = data);

    // console.log(this.selectedCentroDeCosto);
    // this.setInitialData();
    this.setInitialData();
    this.colorRGB();
  }

  ngAfterViewInit() {
    this.plotChart();
  }

  navigateTo(route: string) {
    this.router.navigate([route || '/agritareo']);
  }

  // nextCentroDeCostos() {
  //   this.selectedCentroDeCosto.index += 1;
  //   this.selectedCentroDeCosto.centro = this.centrosDeCosto[this.selectedCentroDeCosto.index];
  // }

  // prevCentroDeCostos() {
  //   this.selectedCentroDeCosto.index -= 1;
  //   this.selectedCentroDeCosto.centro = this.centrosDeCosto[this.selectedCentroDeCosto.index];
  // }

  getDay(fecha: string) {
    return moment(fecha).day();
  }

  getMonth(fecha: string) {
    return moment(moment(fecha).month(), 'MM').format('MMMM').substring(0, 3).toUpperCase();
  }

  generarNumero(numero) {
    return (Math.random() * numero).toFixed(0);
  }

  colorRGB() {
    var coolor = "(" + this.generarNumero(255) + "," + this.generarNumero(255) + "," + this.generarNumero(255) + ")";
    return "rgb" + coolor;
  }


  plotChart() {
    if (this.chartObj) {
      this.chartObj.destroy()
    }

    const ctx = this.chart.nativeElement.getContext('2d');
    this.zone.runOutsideAngular(() => {
      this.chartObj = new Chart(ctx, {
        type: 'doughnut',
        data:
        {
          labels: this.xLabels,
          datasets: [
            {
              label: this.xLabels,
              fill: false,
              data: this.yLabels,
              backgroundColor: ['#6bf1ab', '#63d69f', '#438c6c'],
              borderColor: ['rgba(255, 99, 132, 1)'],
              borderWidth: 1
            },
            // this.colorRGB()
          ],
          hoverOffset: 4
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    });
  }

  setInitialData() {
    this.http.get('dashboard-evaluator').subscribe(data => {
      data.forEach(it => {
        it.nombrePlaga = it.nombre
        it.plaga.forEach(el => {
          this.xLabels.push(el.plaga)
          this.yLabels.push(el.total)
          this.plotChart();
        })
      });
      this.evaluaciones = (data || []).map(it => {
        return it
      });
    })
  }

}
