import { Component, ElementRef, NgZone, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NsMapComponent } from '@app/components/ns-map/ns-map.component';
import { BaseReport } from '@app/common/classes/abstract-base-report.class';
import * as moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReportesService } from '../reportes.service';


@Component({
  selector: 'ns-rep-maquinaria',
  templateUrl: './rep-maquinaria.component.html',
  styleUrls: ['./rep-maquinaria.component.scss'],
  providers: [
    ReportesService
  ]
})
export class RepMaquinariaComponent extends BaseReport implements OnInit {
  @ViewChild('date1', { static: true }) date1: ElementRef;
  @ViewChild('date2', { static: true }) date2: ElementRef;
  @ViewChild(NsMapComponent) map: NsMapComponent;
  form: FormGroup;
  lastDateInicio = '';
  lastDateFin = '';

  centrosDeCosto = []
  centrosDeCostoOrdered = []
  centrosDeCostoSeleccionado = []
  maquinarias = []
  availableMaquinariasList = [];
  maquinariasSelected = [];
  selectedLoteId: number;
  selectedCentroCosto;

  selectedLote: any = true;
  openDetail = false;
  expanded = false;
  mapIsLoading = true;

  selectedLoteLoading = true;
  // Tree, armar el arbol con los siguientes atributos
  parentKey = 'idpadre';
  dataKey = 'id';

  reporteMaquinaria = [];

  centroDeCostosList = [];
  selectedCentroCostos = [];
  centroDeCostosListWithoutFilter = [];
  // centroDeCostosList = [];
  maquinariasList = [];

  dataMapaWithoutFilter = [];
  dataMapa = [];
  latitud: number;
  longitud: number;

  chartHorasMaquinaData = [];
  chartHorasMaquinaLabels = [];

  chartHorasMaquina = null;


  headerTableDetalleMaquinaria = [
    { label: 'Documento', field: 'documento' },
    { label: 'Fecha', field: 'fecha', isDate: true },
    { label: 'Actividad', field: 'actividad' },
    { label: 'Labor', field: 'labor' },
    { label: 'Cant. Horas', field: 'cant_horas' },
    { label: 'Operario', field: 'operario' },
  ];

  dataTableDetalleMaquinaria = [];



  constructor(
    private fb: FormBuilder,
    private reporteService: ReportesService,
    private zone: NgZone) {
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
    this.reporteService.getMaquinaria(firstDate, lastDate).subscribe(data => {
      this.centrosDeCosto = (data.centro_costos || []).map(it => {
        it.fillColor = it.color;
        it.polygonLabel =
          '<div class="label-map-wrapper">' +
          '<span class="label-first">' + (+it.total_horas).toFixed(2) + 'Hrs</span> <br> ' +
          '<span class="label-second">' + (+it.horas_ha).toFixed(2) + 'Hrs/Ha</span>' +
          '</div>';
        return it;
      });

      this.centrosDeCostoOrdered = this.orderedData([...this.centrosDeCosto]).filter(Boolean);
      this.centrosDeCostoSeleccionado = [...this.centrosDeCostoOrdered];

      // let x = []
      // this.centrosDeCosto.forEach(it => (x = [...x, ...it.maquinarias_cc]));
      // const mx = x.map(it => it.cod_maq);

      // this.availableMaquinariasList = Array.from(new Set(mx));
      // this.maquinariasSelected = [...this.availableMaquinariasList];
      // this.maquinarias = data.maquinarias;
      // this.reporteMaquinaria = data;
      // this.selectedCentroCostos = data.centro_costos || [];
      // this.centroDeCostosListWithoutFilter = data.centro_costos || [];

      // console.log(this.centroDeCostosListWithoutFilter);
      // const centroDeCostosOrdenado = (data.centro_costos || []).sort((a, b) => a.id - b.id);
      // this.maquinariasList = data.maquinarias || [];

      // this.getAvailableMaquinaria();

      // const coordenadas = data.centro_costos.map(it => it.coordenadas ? it : null).filter(Boolean);

      // coordenadas.forEach(element => {

      // });

      // this.dataMapaWithoutFilter = coordenadas;
      // this.dataMapa = coordenadas;

      // if (coordenadas.length) {
      //   const { latitud, longitud } = coordenadas[0].coordenadas[0];
      //   this.latitud = latitud;
      //   this.longitud = longitud;
      // }

      this.mapIsLoading = false;
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
    this.map.updateAllColors();
    lote.setOptions({ fillColor: "red" });

    this.selectedCentroCosto = this.centrosDeCosto.find(it => it.id === id);
    this.openLeftPanel();

    this.loadingLeftPanel();


  }

  // getAvailableMaquinaria() {
  //   this.availableMaquinariasList = this.selectedCentroCostos.reduce((a, it) => {
  //     return [...a, ...(it.maquinarias_cc ?? []).map(e => e.cod_maq)];
  //   }, []);
  //   this.availableMaquinariasList = this.availableMaquinariasList.map(it => it.trim());
  //   this.maquinariasSelected = this.availableMaquinariasList;

  //   this.updateCoordinates();
  // }

  // unselectedMapPolygon() {
  //   this.closeLeftPanel();
  // }

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
      this.getData(i, f);
    }
  }

  filterCoordinates() {
    const listaIdCentroCostos = this.selectedCentroCostos.map(it => it.id);
    this.dataMapa = this.dataMapaWithoutFilter.filter(it => listaIdCentroCostos.includes(it.id));
  }

  // FIXME: Metodo sin uso pero duplicado.
  // selectedMapPolygon(polygon: any) {
  //   this.chartHorasMaquinaLabels = ['Maquina A', 'Maquina B', 'Maquina C'];
  //   this.chartHorasMaquinaData = [120, 100, 130];

  //   this.openLeftPanel();
  //   this.startLoadingLeftPanel();
  //   this.openDetail = true;
  //   this.selectedLoteLoading = true;
  //   this.dataTableDetalleMaquinaria = [];
  //   const { id } = polygon;
  //   const centroDeCosto = this.centroDeCostosListWithoutFilter.find(it => it.id === id);
  //   this.selectedCentroCosto = centroDeCosto;

  //   this.reporteService.getDetallesDeMaquinaria(centroDeCosto.codigo?.trim()).subscribe(response => {
  //     this.stopLoadingLeftPanel();
  //     this.selectedLote = response;
  //     this.selectedLoteLoading = false;


  //     const horasMaquinaria = response?.horas_maquinaria.sort((a, b) => {
  //       return b.cant_horas_maq - a.cant_horas_maq;
  //     });

  //     this.selectedLote.horas_maquinaria = horasMaquinaria;

  //     // horas_maquinaria
  //     this.chartHorasMaquinaLabels = horasMaquinaria.reduce((a, b) => {
  //       return [...a, b.maquinaria];
  //     }, []);

  //     // cant_horas_maq
  //     this.chartHorasMaquinaData = [{
  //       data: horasMaquinaria.reduce((a, b) => {
  //         return [...a, b.cant_horas_maq];
  //       }, [])
  //     }];

  //   });
  // }

  selectedMapPolygon(lote) {
    const { id } = lote;
    const centroDeCosto = this.centroDeCostosListWithoutFilter.find(it => it.id === id);
    this.selectedLote = centroDeCosto;
    this.openDetail = true;

    this.openLeftPanel();
    this.startLoadingLeftPanel();

  }

  updateCoordinates() {
    const listIdCentroCosto = (this.selectedCentroCostos || []).map(it => it.id);
    this.dataMapa = [];
    this.dataMapaWithoutFilter.forEach(lote => {
      const listIdMaquinaria = lote.maquinarias_cc.map(it => it.cod_maq.trim());
      listIdMaquinaria.forEach(idMaquinaria => {
        if (this.maquinariasSelected.includes(idMaquinaria) && listIdCentroCosto.includes(lote.id)) {
          const index = this.dataMapa.find(it => it.id === lote.id);
          if (!index) {
            this.dataMapa.push(lote);
          }
        }
      });
    });
  }

  centroDeCostosUnselect() {
    this.filterCoordinates();
  }

  centroDeCostosSelect(centroDeCosto: any) {
    this.filterCoordinates();
  }

  onCheckedMaquinaria(maquinaria: any) {
    this.updateCoordinates();
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
        parent.children = [...parent.children, item];
      }
      return arr;
    }, []);
  }

  onBarClick(index: number) {
    const { horas_maquinaria } = this.selectedLote;
    if (horas_maquinaria?.length && undefined !== horas_maquinaria[index]) {
      const detalle = horas_maquinaria[index].detalle_maquinaria;
      this.dataTableDetalleMaquinaria = detalle;
    }
  }

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


}
