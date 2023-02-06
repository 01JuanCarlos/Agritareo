import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NsMapComponent } from '@app/components/ns-map/ns-map.component';
import { BaseReport } from '@app/common/classes/abstract-base-report.class';
import * as moment from 'moment';
import { ReportesService } from '../reportes.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'ns-rep-fertilizacion',
  templateUrl: './rep-fertilizacion.component.html',
  styleUrls: ['./rep-fertilizacion.component.scss'],
  providers: [ReportesService]
})
export class RepFertilizacionComponent extends BaseReport implements OnInit {
  @ViewChild('date1', { static: true }) date1: ElementRef;
  @ViewChild('date2', { static: true }) date2: ElementRef;
  @ViewChild(NsMapComponent) map: NsMapComponent;
  form: FormGroup;

  centrosDeCosto = []
  centrosDeCostoOrdered = []
  centrosDeCostoSeleccionado = []
  maquinarias = []
  availableNutrientesList = [];
  nutrientesSelected = [];
  nutrientes = [];
  selectedLoteId: number;
  selectedCentroCosto;

  lastDateInicio = '';
  lastDateFin = '';

  selectedLote: any;
  expanded: boolean;
  mapIsLoading = true;
  openDetail = false;

  // Tree, armar el arbol con los siguientes atributos
  parentKey = 'idpadre';
  dataKey = 'id';


  latitud: number;
  longitud: number;
  dataMapa = [];
  dataMapaWithoutFilter = [];

  centroDeCostosList = [];
  selectedCentroCostos = [];
  centroDeCostosListWithoutFilter = [];


  // availableNutrientesList = [];
  nutrientesList = [];
  // nutrientesSelected = [];

  chartFertilizacionLabels = null;
  chartFertilizacionData = null;

  chartFertilizacion = null;

  colors = {
    '-': 'rgb(201, 203, 207)',
    AHF: 'rgb(153, 102, 255)',
    B: 'rgb(54, 162, 235)',
    CA: 'rgb(75, 192, 192)',
    FE: 'rgb(255, 205, 86)',
    K: 'rgb(255, 159, 64)',
    MG: 'rgb(255, 99, 132)',
    MN: 'rgb(153, 102, 255)',
    N: 'rgb(75, 192, 192)',
    P: 'rgb(255, 205, 86)',
    S: 'rgb(153, 102, 255)',
    ZN: 'rgb(255, 159, 64)',
    SUL: 'rgb(255, 159, 64)',
  };

  firstSelected = ['N', 'P', 'K'];

  constructor(
    private fb : FormBuilder,
    private reporteService: ReportesService,
    private zone: NgZone
  ) {
    super();

  }

  ngOnInit(): void {
    this.form = this.fb.group({
      fecha_inicio: '',
      fecha_fin: '',
      idevaluador: ''
    });
    this.getData();
  }

  formatDate(date: string) {
    return moment(new Date(date)).format('DD/MM/YYYY');
  }

  consultarPorFecha() {
    const dateI = this.date1.nativeElement.value;
    const dateF = this.date2.nativeElement.value;

    if (dateI && dateF) {
      const dateParsedI = moment(dateI).format('DD/MM/YYYY');
      const dateParsedF = moment(dateF).endOf('month').format('DD/MM/YYYY');
      this.getData(dateParsedI, dateParsedF);
    }
  }

  getData(firstDate?: string, lastDate?: string) {
    this.reporteService.getFertilizacion(firstDate, lastDate).subscribe(data => {

      this.centrosDeCosto = (data.centro_costos || []).map(it => {
        //FIXME: REVISAR CUANDO NO HAYA PORQUE SIEMPRE VIENE Y NO TENGO MANERA DE COMPROBAR SI ESTA BIEN
        let valorNulo = (it.nutrientes_lote || []).length
        valorNulo = !!valorNulo
        it.fillColor = !valorNulo ? '#A7BBC7' : it.color;
        it.codigo = it.codigo;
        // it.fillColor = valorRojo ? '#FF0000' : it.color;
        it.color = !valorNulo ? '#A7BBC7' : it.color;
        it.polygonLabel =
          '<div class="fertilizacion-wrapper">' +
          // '<span class="label-first">' + it.codigo + '</span> <br> ' +
          //'<span class="label-second">' + it.nombre + '</span>' +
          '<span class="label-second">' + it.codigo + '</span>' +
          '</div>';

        return it;
      });
      this.centrosDeCostoOrdered = this.orderedData([...this.centrosDeCosto]).filter(Boolean);
      this.centrosDeCostoSeleccionado = [...this.centrosDeCostoOrdered];

      let x = []
      this.centrosDeCosto.forEach(it => (x = [...x, ...it.nutrientes_lote]));
      const mx = x.map(it => it.simquimico);

      this.availableNutrientesList = Array.from(new Set(mx));
      this.nutrientesSelected = [...this.availableNutrientesList];

      this.nutrientes = data.nutrientes;
      // this.reporteMaquinaria = data;
      this.selectedCentroCostos = data.centro_costos || [];
      this.centroDeCostosListWithoutFilter = data.centro_costos || [];
      const centroDeCostosOrdenado = (data.centro_costos || []).sort((a, b) => a.id - b.id);

      this.nutrientesList = data.nutrientes;

      this.centroDeCostosList = this.orderedData(centroDeCostosOrdenado ?? []).filter(Boolean);

      // this.maquinariasList = data.maquinarias || [];

      // this.getAvailableMaquinaria();

      const coordenadas = data.centro_costos.map(it => it.coordenadas ? it : null).filter(Boolean);
      this.dataMapaWithoutFilter = coordenadas;
      this.dataMapa = coordenadas;

      if (coordenadas.length) {
        const { latitud, longitud } = coordenadas[0].coordenadas[0];
        this.latitud = latitud;
        this.longitud = longitud;
      }


      this.mapIsLoading = false;
      this.loadAvailableNutrientes()

      this.map.centerMap(
        data?.punto_central?.latitud,
        data?.punto_central?.longitud
      );
    });
  }

  selectedLoteMap(lote: any) {
    const { id, codigo } = lote;

    if (id === this.selectedLoteId) {
      this.selectedLoteId = null;
      lote.setOptions({ fillColor: lote.color });
      this.closeLeftPanel();
      return;
    }

    this.selectedLoteId = id;
    this.map.updateAllColors(lote.color);

    lote.setOptions({ fillColor: "red" });

    this.selectedCentroCosto = this.centrosDeCosto.find(it => it.id === id);
    this.openLeftPanel();

    this.loadingLeftPanel();


  }

  selectedMapPolygon(lote) {
    this.openLeftPanel();
    this.startLoadingLeftPanel();
    const { id } = lote;
    const centroDeCosto = this.centroDeCostosListWithoutFilter.find(it => it.id === id);
    this.selectedLote = centroDeCosto;
    this.openDetail = true;


  }


  loadAvailableNutrientes() {
    let nutrientes = [];
    this.selectedCentroCostos.forEach(it => {
      nutrientes = [...nutrientes, ...(it.nutrientes_lote || [])];
    })

    let listIdNutrientes = nutrientes.map(it => it.simquimico);
    listIdNutrientes = [...new Set(listIdNutrientes)];

    this.availableNutrientesList = listIdNutrientes;
    this.nutrientesSelected = listIdNutrientes;

    this.filterCoordinates();
  }
  updatedDate(val?: string) {
    const { fecha_inicio, fecha_fin } = this.form.value;
    // console.log(fecha_fin, fecha_inicio);
    const i = fecha_inicio.split('T')[0];
    const f = fecha_fin.split('T')[0];

    // console.log(i, f);
    if (this.lastDateFin !== f || this.lastDateInicio !== i) {
      this.lastDateFin = f;
      this.lastDateInicio = i;
      // console.log(i, f);
      //this.setInitialData(i, f);
    }
  }

  filterCoordinates() {
    const listCentroDeCostos = this.selectedCentroCostos.map(it => it.id);

    this.dataMapa = [];
    this.dataMapaWithoutFilter.forEach(lote => {
      const idNutriente = lote.nutrientes_lote.map(nutriente => nutriente.simquimico);

      idNutriente.forEach(elementId => {
        if (this.nutrientesSelected.includes(elementId) && listCentroDeCostos.includes(lote.id)) {
          const index = this.dataMapa.find(it => it.id === lote.id);
          if (!index) {
            this.dataMapa.push(lote);
          }
        }
      });
    });
  }

  onCheckedNutriente() {
    this.filterCoordinates();
  }

  centroDeCostosUnselect() {
    this.loadAvailableNutrientes();
  }

  centroDeCostosSelect(centroDeCosto: any) {
    this.loadAvailableNutrientes();
  }



  orderedData(data: any[]) {
    return data.reduce((arr, item) => {
      item.label = item.nombrenivel || item.lote || item.nombre;
      if (!item[this.parentKey]) {
        arr = arr.concat(item);
      } else {
        const parent: any = data.find(k => k[this.dataKey] === item[this.parentKey]);
        if (parent && !parent.children) {
          parent.children = [];
        }
        // parent.children = [...parent.children, item];
        parent && (parent.children = [...parent.children, item]);
      }
      return arr;
    }, []);
  }





  // orderedData(data: any[]) {
  //   return data.reduce((arr, item) => {
  //     item.label = item.nombrenivel || item.lote || item.nombre;
  //     if (!item[this.parentKey]) {
  //       arr = arr.concat(item);
  //     } else {
  //       const parent: any = data.find(k => k[this.dataKey] === item[this.parentKey]);
  //       if (parent && !parent.children) {
  //         parent.children = [];
  //       }
  //       parent.children = [...parent.children, item];
  //     }
  //     return arr;
  //   }, []);
  // }

  centroSeleccionado(e) {
    if (e.originalEvent.target.innerText) {
      // TODO: Corregir
      const finde = this.centrosDeCostoSeleccionado.find(it => it.id === e.node.id);
      if (!finde) {
        this.centrosDeCostoSeleccionado.push(e.node);
      }

      const { lat, lng } = this.map.getCoordinatesCenter(e.node.coordenadas);
      this.map.centerMap(lat(), lng());
      this.selectedLoteMap(this.map.mapPolygonList[e.node.id]);
    }
  }


  // ngAfterViewInit() {
  // const ng = this;

  // this.zone.runOutsideAngular(() => {
  // this.chartFertilizacion = new Chart('FERTILIZACION', {
  //   type: 'line',
  //   data: {
  //     labels: [],
  //     datasets: [
  //       {
  //         label: 'Volumen Ha',
  //         fill: true,
  //         backgroundColor: '#92bed2',
  //         pointBackgroundColor: '#3282bf',
  //         borderColor: '#3282bf',
  //         data: [],
  //       },
  //       {
  //         label: 'Volumen',
  //         fill: true,
  //         backgroundColor: '#8fa8c8',
  //         pointBackgroundColor: '#75539e',
  //         borderColor: '#75539e',
  //         data: [],

  //       }
  //     ]
  //   },
  //   options: {
  //     responsive: true,
  //     scales: {
  //       yAxes: [{
  //         stacked: true,
  //         scaleLabel: {
  //           display: true,
  //           labelString: 'Unidades de nutriente'
  //         }
  //       }],
  //       xAxes: [{
  //         scaleLabel: {
  //           labelString: 'Dia de crecimiento',
  //           display: true
  //         }
  //       }]
  //     },
  //     animation: {
  //       duration: 750,
  //     },
  //   }
  // });
  // });

  // }


}
