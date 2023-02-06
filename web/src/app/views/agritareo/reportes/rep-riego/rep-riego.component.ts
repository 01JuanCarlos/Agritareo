import { Component, ElementRef, NgZone, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NsMapComponent } from '@app/components/ns-map/ns-map.component';
import { BaseReport } from '@app/common/classes/abstract-base-report.class';
import * as moment from 'moment';
import { ReportesService } from '../reportes.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';


@Component({
  selector: 'ns-rep-riego',
  templateUrl: './rep-riego.component.html',
  styleUrls: ['./rep-riego.component.scss'],
  providers: [ReportesService]
})
export class RepRiegoComponent extends BaseReport implements OnInit {
  @ViewChild('date1', { static: true }) date1: ElementRef;
  @ViewChild('date2', { static: true }) date2: ElementRef;
  @ViewChild(NsMapComponent) map: NsMapComponent;
  form: FormGroup;
 //FECHAS
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

  chartVolumenAguaLabels = [];
  chartVolumenAguaData = [];

  ccFiltro = [];
  chartVolumenAgua = null;




  constructor(
    private fb: FormBuilder,
    private zone: NgZone,
    private http: AppHttpClientService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      fecha_inicio: '',
      fecha_fin: '',
      idevaluador: ''
    });
    this.setInitialData();
  }

  consultarPorFecha() {
    const dateI = this.date1.nativeElement.value;
    const dateF = this.date2.nativeElement.value;

    if (dateI && dateF) {
      const dateParsedI = moment(dateI).format('DD/MM/YYYY');
      const dateParsedF = moment(dateF).endOf('month').format('DD/MM/YYYY');
      // this.getData(dateParsedI, dateParsedF);
    }
  }

  formatDate(date: string) {
    return moment(new Date(date)).format('DD/MM/YYYY');
  }

  setInitialData(i?: string, f?: string) {
    this.mapIsLoading = true;
    this.http.get('irrigation-report', { i, f }).subscribe(data => {
      this.centrosDeCosto = (data?.lotes || []).map(it => {
        it.id = it.idcentro_costo;
        it.label = it.centro_costo;
        it.codigo = it.codigo;
        it.volumen = it.volumen
        let valorNulo = it.volumen

        valorNulo = !!valorNulo
        it.fillColor = !valorNulo ? '#A7BBC7' : it.color;
        // it.fillColor = valorRojo ? '#FF0000' : it.color;
        it.color = !valorNulo ? '#A7BBC7' : it.color;
        it.polygonLabel =
          '<div class="riego-wrapper">' +
          '<span class="label-first">' + it.label + '</span> <br> ' +
          '<span class="label-second">' + it.codigo + '</span> <br> ' +
          '<span class="label-sub">Volumen del Día: ' + it.valor + '</span> <br> ' +
          '<span class="label-third">Volumen Total : ' + (it.Volumen_Acumulado).toFixed(0) + '</span> <br> ' +
          '</div>';

        it.polygonInfo =
          '<div style="margin: 10px;">' +
          '<div class="sec-content font-weight-bold" >' + 'Lote: ' + it.codigo + '</div>' +
          // '<div><a class="mt-2"><strong>Volumen: </strong>' + it.volumen + '</a></div>' +
          // '<div><a><strong>Volumen_ha : </strong>' + it.volumen_ha + '</a></div>' +
          // '<div><a><strong>Área: </strong>' + it.area + '</a></div>' +
          // '<div><a><strong>Campaña: </strong>' + this.formatDate(data.meta.fecha_inicio.split('T')[0]) + '-' + this.formatDate(data.meta.fecha_fin.split('T')[0]) + '</a></div>' +
          '</div></div>';
        return it;
      });
      this.centrosDeCostoOrdered = this.orderedData([...this.centrosDeCosto] ?? [], 'parent').filter(Boolean);
      this.centrosDeCostoSeleccionado = [...this.centrosDeCostoOrdered];

      this.mapIsLoading = false;

      //Manejo de fechas
      const fechaInicio = new Date(data.meta.fecha_inicio).toISOString();
      const fechaFin = new Date(data.meta.fecha_fin).toISOString();

      this.lastDateFin = data.meta.fecha_fin.split('T')[0];
      this.lastDateInicio = data.meta.fecha_inicio.split('T')[0];

      this.form.patchValue({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });

      // this.map.centerMap(
      //   data?.punto_central?.latitud,
      //   data?.punto_central?.longitud
      // );

      const [first] = this.centrosDeCosto;
      if (first?.coordenadas) {
        const firstCoordenadas = this.map.getCoordinatesCenter(first.coordenadas);
        this.map?.centerMap(firstCoordenadas.lat(), firstCoordenadas.lng());
      }

      this.mapIsLoading = false;
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

  filterCoordinates() {
    const listaIdCentroCostos = this.selectedCentroCostos.map(it => it.id);
    this.dataMapa = this.dataMapaWithoutFilter.filter(it => listaIdCentroCostos.includes(it.id));
  }

  selectedMapPolygon(lote) {
    const { id } = lote;
    const centroDeCosto = this.centroDeCostosListWithoutFilter.find(it => it.id === id);
    this.selectedLote = centroDeCosto;
    this.openDetail = true;

  }

  centroDeCostosUnselect() {
    this.filterCoordinates();
  }

  centroDeCostosSelect(centroDeCosto: any) {
    this.filterCoordinates();
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
