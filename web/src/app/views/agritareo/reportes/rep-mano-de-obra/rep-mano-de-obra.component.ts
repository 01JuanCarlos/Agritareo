import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { ReportesService } from '../reportes.service';
import { BaseReport } from '@app/common/classes/abstract-base-report.class';
import { NsMapComponent } from '@app/components/ns-map/ns-map.component';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'ns-rep-mano-de-obra',
  templateUrl: './rep-mano-de-obra.component.html',
  styleUrls: ['./rep-mano-de-obra.component.scss'],
  providers: [
    ReportesService
  ]
})
export class RepManoDeObraComponent extends BaseReport implements OnInit {
  @ViewChild('date1', { static: true }) date1: ElementRef;
  @ViewChild('date2', { static: true }) date2: ElementRef;
  @ViewChild(NsMapComponent) map: NsMapComponent;
  form: FormGroup;
  centrosDeCosto = []
  centrosDeCostoOrdered = []
  centrosDeCostoSeleccionado = []
  maquinarias = []
  availableMaquinariasList = [];
  maquinariasSelected = [];
  selectedLoteId: number;
  selectedCentroCosto;



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

  // selectedCentroCosto: any;
  selectedLoteLoading: any;
  chartVolumenAguaLabels: any;
  chartVolumenAguaData: any;

  constructor(
    private zone: NgZone,
    private reporteService: ReportesService
  ) {
    super();

  }

  ngOnInit(): void {
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
        it.fillColor = it.color
        it.polygonLabel =
          '<div class="label-map-wrapper">' +
          '<span class="label-first">' + (+it.total_horas).toFixed(2) + 'Hrs</span> <br> ' +
          '<span class="label-second">' + (+it.horas_ha).toFixed(2) + 'Hrs/Ha</span>' +
          '</div>';
        return it;
      });
      this.centrosDeCostoOrdered = this.orderedData([...this.centrosDeCosto]).filter(Boolean);
      this.centrosDeCostoSeleccionado = [...this.centrosDeCostoOrdered];

      // this.selectedCentroCostos = data || [];
      // this.centroDeCostosListWithoutFilter = data || [];
      // const centroDeCostosOrdenado = (data || []).sort((a, b) => a.id - b.id);

      // this.centroDeCostosList = this.orderedData(centroDeCostosOrdenado ?? []).filter(Boolean);

      // const coordenadas = data?.map(it => it.coordenadas ? it : null).filter(Boolean) || [];
      // coordenadas.forEach(element => {
      //   element.polygonLabel =
      //     '<div class="label-map-wrapper">' +
      //     '<span class="label-first">10Hrs</span> <br> ' +
      //     '<span class="label-second">20Hrs/Ha</span>' +
      //     '</div>';
      // });

      // this.dataMapaWithoutFilter = coordenadas;
      // this.dataMapa = coordenadas;

      // if (coordenadas.length) {
      //   const { latitud, longitud } = coordenadas[0].coordenadas[0];
      //   this.latitud = latitud;
      //   this.longitud = longitud;
      // }

      this.map.centerMap(
        data?.punto_central?.latitud,
        data?.punto_central?.longitud
      );

      this.mapIsLoading = false;
    });
  }

  selectData() {

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


  centroDeCostosSelect(object: any) {
    console.log('ete', object);
  }


  centroDeCostosUnselect() {
    console.log('aca');
  }


  selectedMapPolygon(object: any) {
    const { id } = object;
    this.openLeftPanel();
    this.startLoadingLeftPanel();

    const { codigo } = this.centroDeCostosListWithoutFilter.find(it => it.id === id);

  }

  unselectedMapPolygon() {
    this.closeLeftPanel();
  }

}
