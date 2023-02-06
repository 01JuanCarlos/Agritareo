import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseReport } from '@app/common/classes/abstract-base-report.class';
import { NsMapComponent } from '@app/components/ns-map/ns-map.component';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import * as moment from 'moment';
import { ReportesService } from '../reportes.service';
const _ = require("lodash");

@Component({
  selector: 'ns-rep-ruta',
  templateUrl: './rep-ruta.component.html',
  styleUrls: ['./rep-ruta.component.scss'],
  providers: [
    ReportesService,
  ]
})
export class RepRutaComponent extends BaseReport implements OnInit {
  @ViewChild('map', { static: true }) map: NsMapComponent;
  form: FormGroup;
//variable de fecha
  lastDateInicio = '';
  lastDateFin = '';
  lastFecha = '';
  pruebas = [];
  selectedLote: any;

  bitacoras = [];

  UMBRALES_RANGO = {
    1: '#0dcaf0',
    2: '#ffc107',
    3: '#dc3545',
  };

  dataRoute:any;
  tempCentroDeCosto = [];
  tempKeys = [];
  eva = [];
  centrosDeCosto = [];
  centrosDeCostoOrdered = [];
  centrosDeCostoSeleccionado = [];

  verticesLineas = [];
  markers = [];
  routeCoordinates = [];

  cultivoFiltro = [];
  cultivos = [];
  cultivosSelected = [];
  availableCultivosList = [];

  plagaFiltro = [];
  plagas = [];
  plagasSelected = [];
  availablePlagasList = [];

  evaluadorFiltro = [];
  evaluadores = [];
  evaluadoresSelected = [];
  availableEvaluadoresList = [];

  selectedLoteId: number;
  selectedCultivos = [];
  selectedCoordinates = [];
  selectedCoordinatesWithoutFilter = [];

  // static cache = [];
  mapIsLoading = true;
  openDetail = false;
  lotes = [];

  selectedSiembra: any;

  evaluacionesList = [];
  selectedEvaluacion: any;

  estadosFenologicosArreglo = [];
  imagesList = [];

  chartVolumenAguaLabels: any;
  chartVolumenAguaData: any;
  getInit: any;
  getMarkerRoute: any;
  id: any;
  valor_encontrado: any;


  center: any;

  constructor(
    private fb: FormBuilder,
    private zone: NgZone,
    private reportService: ReportesService,
    private http: AppHttpClientService,) {
    super();
  }

  ngOnInit() {
    this.form = this.fb.group({
      fecha: '',
      idevaluador: ''
    });
    this.setInitialData();
    // this.colorRGB();
  }



  formatDate(date: string) {
    return moment(new Date(date)).format('DD/MM/YYYY');
  }

  formatDateSeconds(date: string) {
    return moment(new Date(date)).format('MMMM Do, h:mm a');
  }

  setInitialData(i?: string) {
    this.mapIsLoading = true;
    this.getInit = this.http.get('phytosanitary-route-report', { i }).subscribe(data => {
      this.centrosDeCosto = (data.lotes || []).map(it => {
        this.getMarkerRoute = (it.evaluaciones_sanitarias || []).map(e => {
          this.id = e.idbitacora_agricola
          it.routeInfo =
          `
          <h1 style="font-size:35px; font-weight: bold;"><i class="fas fa-user"  style="font-size:35px"></i> ${it.evaluador} </h1>
          <span style="font-size:25px; border-right: 1px solid; padding-right: 7px; font-weight: 500;"><i class="fas fa-map-marker-alt"  style="font-size:25px; padding-right: 5px;"></i>${it.centro_costo}</span>
          <span style="font-size:25px; margin-left: 10px; font-weight: 500;"><i class="fas fa-seedling"  style="font-size:25px; padding-right: 5px;"></i>${it.cultivo_variedad}</span> <br> <br> <br>
          <table>
                     <tr style="font-size:25px;">
                       <th><i class="fas fa-bug" style="padding-left: 110px;"></i></th>
                       <th><i class="fas fa-user-clock"></i> ${this.formatDateSeconds(e?.fecha)}  </th>
                     </tr>'
                     <tr style="font-size:25px; border-top: 2px outset; font-weight: 400;" *ngFor="let item of this.getMarkerRoute">
                       <td style="border-right: 2px outset; padding-right: 20px">${e.concepto_agricola}</td>
                       <td style="padding-left: 110px; background: #317f43;">${e.valor_encontrado}</td>
                     </tr>
                     </table>`
          return e
        })
        it.id = it.idcentro_costo;
        it.label = it.centro_costo;
        it.codigo = it.codigo;
        it.fillColor = it.color;
        return it


      });

      this.centrosDeCostoOrdered = this.orderedData([...this.centrosDeCosto] ?? [], 'parent').filter(Boolean);
      this.centrosDeCostoSeleccionado = [...this.centrosDeCostoOrdered];
      this.verticesLineas = [...this.centrosDeCostoOrdered];
      this.markers = [...this.centrosDeCostoOrdered];
      this.tempCentroDeCosto = [...this.centrosDeCostoSeleccionado];

      this.evaluadorFiltro = (data.evaluadores || []).map(e => {
        e.id = e.idcentro_costo;
        e.label = e.evaluador;
        e.value = e.valor_encontrado
        return e;
      });


      this.cultivoFiltro = (data.cultivos || []).map(c => {
        c.id = c.idcultivo;
        c.label = c.cultivo;
        return c;
      });

      this.availableCultivosList = (data.cultivos || []).map(it => it.idcultivo);
      this.cultivosSelected = [...this.availableCultivosList];
      this.cultivos = (data.cultivos || []);

      this.availablePlagasList = (data.conceptos_agricolas || []).map(it => it.idtipo_concepto);
      this.plagasSelected = [...this.availablePlagasList];
      this.plagas = data.conceptos_agricolas || [];

      this.availableEvaluadoresList = (data.evaluador || []).map(it => it.idevaluador);
      this.evaluadoresSelected = [...this.availableEvaluadoresList];
      this.evaluadores = data.evaluador || [];

      const fecha = new Date(data.meta.fecha).toISOString();

      this.lastFecha = data.meta.fecha.split('T')[0];

      this.form.patchValue({ fecha: fecha });

      const [first] = this.centrosDeCosto;
      if (first?.coordenadas) {
        const firstCoordenadas = this.map.getCoordinatesCenter(first.coordenadas);
        this.map?.centerMap(firstCoordenadas.lat(), firstCoordenadas.lng());
      }

      this.mapIsLoading = false;
    });
  }



  ngOnDestroy() {
    this.getInit.unsubscribe()
  }

  openTest(e:any){
    console.log(e)
  }

  onSelectedLote(lote: any) {
    const { id } = lote;

    if (id === this.selectedLoteId) {
      this.selectedLoteId = null;
      lote.setOptions({ fillColor: lote.color });
      this.closeLeftPanel();
      return;
    }

    this.selectedLoteId = id;
    this.selectedLote = this.centrosDeCosto.find(it => it.id === id);
    this.map.updateAllColors(lote.color);
  }

  centrarLote(e) {
    e.stopPropagation()
    const finde = this.centrosDeCostoSeleccionado.find(it => it.centro_costo === e.target.text);

    //click para centrar el lote
    const { lat, lng } = this.map.getCoordinatesCenter(finde.coordenadas);
    this.map.centerMap(lat(), lng());
  }

  evaluadorSeleccionado(e) {
    console.log(e)
    const id = e.node.id
    const finde = this.evaluadores.find(it => it.id === e.node.id);
    if (!finde) {
      this.evaluadores.push(e.node);
    }
  }

  evaluadorUnSeleccionado(e) {
    const id = e.node.id
    // console.log('NO SELECCIONADO', id)
  }

  updatedDate(val?: string) {
    const { fecha } = this.form.value;
    const i = fecha.split('T')[0];

    if (this.lastFecha !== i) {
      this.lastFecha = i;
      this.setInitialData(i);
    }
  }

  cultivoSeleccionado(e) {
    this.tempKeys = this.tempKeys.filter(v => {
      return v !== e.node.idcultivo
    })
    if (this.tempKeys.length != 0) {
      var temparray = this.tempCentroDeCosto
      this.tempKeys.forEach(r => {
        temparray = temparray.filter(t => t.idcultivo !== r)
      })
      this.centrosDeCostoSeleccionado = temparray;
      return;
    }
    this.centrosDeCostoSeleccionado = this.tempCentroDeCosto;
    console.log(this.tempCentroDeCosto)

  }

  cultivoUnSeleccionado(e) {
    let i = true
    this.tempKeys.forEach(element => {
      if (element == e.node.idcultivo) {
        i = !i;
      }
    });
    if (i) {
      this.tempKeys.push(e.node.idcultivo);
    }
    this.centrosDeCostoSeleccionado = this.centrosDeCostoSeleccionado.filter(it => it.idcultivo !== e.node.idcultivo);
    console.log(this.centrosDeCostoSeleccionado)
  }

}
