import { AfterViewInit, Component, DoCheck, ElementRef, Input, NgZone, OnChanges, OnInit, Output, SimpleChanges, ViewChild, EventEmitter } from '@angular/core';
import * as chart from 'chart.js';

chart.Chart.register(
  chart.LineElement,
  chart.LineController,
  chart.PointElement,
  chart.LinearScale,
  chart.CategoryScale,
  chart.BarElement,
  chart.BarController,
  chart.Tooltip,
  chart.Filler,
  chart.Title,
  chart.Legend,
  chart.PieController,
  chart.ArcElement,
  chart.RadialLinearScale,
  chart.RadarController,
  chart.PolarAreaController,
);
// console.log(chart);
export interface ChartOptions { [key: string]: any; }
@Component({
  selector: 'ns-chart',
  templateUrl: './ns-chart.component.html',
  styleUrls: ['./ns-chart.component.scss']
})
export class NsChartComponent implements OnInit, AfterViewInit, DoCheck, OnChanges {
  @ViewChild('datePicker', { static: true }) datePicker: ElementRef;
  @ViewChild('chart', { static: true }) chartElement: ElementRef;

  @Input() title: string;

  @Input() chartTitle: string;
  @Input() responsive = true;
  @Input() maintainAspectRatio = true;

  @Input() datasets: any[];
  @Input() labels: any[];

  @Input() type = 'line';
  @Input() dir: 'vertical' | 'horizontal' = 'vertical';
  @Input() fill: boolean | 'origin' | 'start' | 'end' = false;


  @Output() click = new EventEmitter<{ index: number }>();
  @Output() hover = new EventEmitter();
  @Output() resize = new EventEmitter<{ size: number }>();

  isExtended: boolean;

  private chartPlugin = null;
  private chartOptions: ChartOptions = {};


  constructor(private zone: NgZone, private elementRef: ElementRef) {

  }

  ngOnInit(): void {
    let type = this.type;
    const labels = this.labels || [];

    if ('area' === type) {
      type = 'line';
    }

    if ('hbar' === type) {
      type = 'bar';
      this.dir = 'horizontal';
    }

    // for (const ds of this.datasets) {

    //   if (!labels?.length) {
    //     if ('object' === typeof it && void 0 !== ds?.x) {
    //       labels.push(ds.x);
    //     }
    //   }
    // }


    this.chartOptions = {
      type,
      data: {
        labels,
        datasets: this.datasets ?? []
      },
      options: {
        responsive: this.responsive,
        maintainAspectRatio: this.maintainAspectRatio,
        indexAxis: +('horizontal' === this.dir),
        plugins: {
          legend: {
            position: 'right',
            display: true,
            align: 'start',
            labels: {
              color: '#070809',
              font: {
                size: 16
              }
            },
          }
        }
      }
    };

    if ('string' === typeof this.chartTitle && this.chartTitle.length) {
      this.chartOptions.options.title = {
        display: true,
        text: this.chartTitle
      };
    }

  }

  ngOnChanges(changes: SimpleChanges) {
    if (void 0 !== this.chartPlugin && null !== this.chartPlugin) {
      if (void 0 !== changes?.labels) {
        this.chartPlugin.data.labels = changes?.labels.currentValue;
        this.chartOptions.data.labels = changes?.labels.currentValue;
      }

      if (void 0 !== changes?.datasets) {
        this.chartOptions.data.datasets = changes?.datasets.currentValue;
        this.chartPlugin.data.datasets = changes?.datasets.currentValue;
      }

      // this.chartPlugin.data.labels = changes?.currentValue;

      this.chartPlugin.update();
    }
  }

  ngAfterViewInit(): void {
    //   $(this.datePicker.nativeElement).daterangepicker();

    this.initChartPlugin(this.getCloneOptions());
  }


  ngDoCheck() {
    this.update();
  }

  private update() {
    const { width } = this.chartElement.nativeElement;
    this.isExtended = width >= 500;
  }

  private getRandomColor() {
    return `hsl(${Math.random() * 360}, 100%, 75%)`;
  }

  private getCloneOptions() {
    return JSON.parse(JSON.stringify(this.chartOptions));
  }

  public setChartType(type: string) {
    if (void 0 !== this.chartPlugin) {
      this.chartPlugin.destroy();
    }

    const options = this.getCloneOptions();

    switch (type) {
      case 'area':
        type = 'line';

        const color = this.getRandomColor();
        options.data.datasets = options.data.datasets.map(it => {
          return {
            ...it,
            fill: 'start',
            backgroundColor: color,
            borderColor: color.replace('75%', '50%'),
            borderWidth: 1,
            tension: 0.4,
          };
        });

        // console.log('OPTIONS', options)
        break;

      case 'hbar':
        type = 'bar';
        options.options.indexAxis = 1;
        break;

      case 'bar':
        type = 'bar';
        options.options.indexAxis = 0;
        break;

      case 'doughnut':
        type = 'doughnut';
        options.options.indexAxis = 1;
        break;
    }

    options.type = type;

    this.initChartPlugin(options);
  }

  private initChartPlugin(options?: ChartOptions) {

    const ng = this;

    if (options && options.options) {
      options.options.onClick = (event, dataset: any[], ch) => {
        const [element] = dataset;

        if (void 0 === element?.index) {
          return;
        }

        this.zone.run(() => {
          this.click.emit({ index: element.index });
        });
      };

      options.options.onHover = (event, dataset: any[], ch) => {
        // console.log({ event, dataset, ch });
        // const [element] = dataset;

        this.zone.run(() => {
          this.hover.emit();
        });
      };

      options.options.onResize = size => {
        this.zone.run(() => {
          this.resize.emit({ size });
          this.update();
        });
      };
    }


    this.zone.runOutsideAngular(() => {
      this.chartPlugin = new chart.Chart(this.chartElement.nativeElement, options);
    });

    // this.chartHorasMaquina = new Chart(document.getElementById('MAQUINARIA') as HTMLCanvasElement, {
    //   type: 'horizontalBar',
    //   data: {
    //     labels: [],
    //     datasets: [
    //       {
    //         label: 'Hora',
    //         data: [],
    //         backgroundColor: 'rgb(51, 102, 204)',
    //         borderWidth: 1
    //       }
    //     ]
    //   },
    //   options: {
    //     responsive: true,
    //     maintainAspectRatio: false,
    //     title: {
    //       display: true,
    //       text: 'Centro de costos vs Maquinaria'
    //     },
    //     scales: {
    //       xAxes: [{ ticks: { beginAtZero: true }, scaleLabel: { labelString: 'Cantidad de Horas', display: true } }]
    //     },
    //     onClick(e) {
    //       const [element] = this.getElementAtEvent(e);
    //       const dataIndex = element?._index;
    //       const { horas_maquinaria } = ng.selectedLote;

    //       // console.log({ element, dataIndex, horas_maquinaria });

    //       if (horas_maquinaria?.length && undefined !== horas_maquinaria[dataIndex]) {
    //         const detalle = horas_maquinaria[dataIndex].detalle_maquinaria;
    //         // console.log({ detalle });
    //         ng.dataTableDetalleMaquinaria = detalle;
    //       }
    //     }
    //   }
    // });
  }

}
