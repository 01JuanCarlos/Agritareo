import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseReport } from '@app/common/classes/abstract-base-report.class';
import { NsMapComponent } from '@app/components/ns-map/ns-map.component';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { debounce } from 'lodash';
import * as moment from 'moment';
import 'moment/locale/es';
import { ReportesService } from '../reportes.service';
const _ = require("lodash");


@Component({
  selector: 'ns-rep-fitosanidad',
  templateUrl: './rep-fitosanidad.component.html',
  styleUrls: ['./rep-fitosanidad.component.scss'],
  providers: [
    ReportesService,
  ]
})

export class RepFitosanidadComponent extends BaseReport implements OnInit {
  @ViewChild('map', { static: true }) map: NsMapComponent;
  @ViewChild('tablaDetail') tablaDetail;

  form: FormGroup;
  headerTableDetalleFitosanidad = [
    { label: 'Hace 2 semanas', field: 'documento' },
    { label: 'Hace 1 semana', field: 'fecha', isDate: true },
    { label: 'Esta semana', field: 'actividad' },
  ];

  dataTableDetalleFitosanidad = [];

  //FECHAS
  lastDateInicio = '';
  lastDateFin = '';
  mapPolygonList = {};
  fechaEvaluacion;
  conceptoData;
  valorData:any;
  valorConcepto:any;
  selectedLote: any;
  selectedEvaluaciones: any;
  overLote: any;
  fechaRango = [];
  TwoWeek: any;
  OneWeek: any;
  table = [];
  grpData = [];
  dataHace2Semana = []
  bitacoras = [];

  tempCentroDeCosto = [];
  tempKeys = [];
  tempKeysPlague = [];

  centrosDeCosto = [];
  centrosDeCostoOrdered = [];
  centrosDeCostoSeleccionado = [];
  lotes = [];

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
  overLoteId: number;
  outLoteId: number;
  selectedCultivos = [];
  selectedCoordinates = [];
  selectedCoordinatesWithoutFilter = [];
  display: boolean = false;
  display_detail: boolean = false;

  // static cache = [];
  mapIsLoading = true;
  openDetail = false;

  selectedSiembra: any;

  evaluacionesList = [];
  selectedEvaluacion: any;

  estadosFenologicosArreglo = [];
  imagesList = [];

  chartVolumenAguaLabels: any;
  chartVolumenAguaData: any;

  constructor(
    private fb: FormBuilder,
    private zone: NgZone,
    private http: AppHttpClientService,
  ) {
    super();
    this.setInitialData = debounce(this.setInitialData, 100);
  }

  ngOnInit() {
    this.form = this.fb.group({
      fecha_inicio: '',
      fecha_fin: '',
      idevaluador: ''
    });
    this.setInitialData();
  }

  formatDate(date: string) {
    return moment(new Date(date)).format('DD/MM/YYYY');
  }

  formatDateSeconds(date: string) {
    moment.locale('es');
    return moment(new Date(date)).format('D [de] MMMM , h:mm a');
  }

  formatDateDay(date: string) {
    moment.locale('es');
    return moment(new Date(date)).format('D [de] MMMM');
  }

  setInitialData(i?: string, f?: string) {
    this.mapIsLoading = true;
    this.http.get('phytosanitary-report', { i, f }).subscribe(data => {
      this.centrosDeCosto = (data.lotes || []).map(it => {
        it.id = it.idcentro_costo;
        it.label = it.centro_costo;
        it.codigo = it.codigo;
        it.fillColor = it.color;

        this.lotes = (data.lotes || []);

        if(it.evaluaciones_sanitarias?.length > 0){
          it.polygonLabel =`<i class="fas fa-bug"  style="font-size:30px; color: #FF0000;"></i>`
        } else{
          it.polygonLabel =`<i class="fas fa-bug"  style="font-size:30px; color: #808080;"></i>`
        }

        it.polygonInfo =
        `
        <h1 class="polygonInfo_title"><i class="fas fa-map-marker-alt" style="padding-right: 5px;"></i>${it.codigo}</h1>
        <span class="polygonInfo_subTitle"><i class="fas fa-seedling"  style="padding-right: 5px;"></i>${it.cultivo + ' - ' + it.variedad}</span>
        <span class="polygonInfo_subTitle"><i class="fas fa-vector-square"  style="padding-right: 5px;"></i>${it.area}</span>
        `

        return it;
      });

      this.centrosDeCostoOrdered = this.orderedData([...this.centrosDeCosto] ?? [], 'parent').filter(Boolean);
      this.centrosDeCostoSeleccionado = this.centrosDeCostoOrdered;
      this.tempCentroDeCosto = [...this.centrosDeCostoSeleccionado];


      this.cultivoFiltro = (data.cultivos || []).map(c => {
        c.id = c.idcultivo;
        c.label = c.cultivo;
        return c;
      });

      this.plagaFiltro = (data.conceptos_agricolas || []).map(c => {
        c.id = c.idconcepto_agricola;
        c.label = c.concepto_agricola;
        return c;
      });

      this.evaluadorFiltro = (data.evaluadores || []).map(c => {
        c.id = c.idevaluador;
        c.label = c.evaluador;
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

      const fechaInicio = new Date(data.meta.fecha_inicio).toISOString();
      const fechaFin = new Date(data.meta.fecha_fin).toISOString();

      this.lastDateFin = data.meta.fecha_fin.split('T')[0];
      this.lastDateInicio = data.meta.fecha_inicio.split('T')[0];

      this.form.patchValue({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });

      const [first] = this.centrosDeCosto;
      if (first?.coordenadas) {
        const firstCoordenadas = this.map.getCoordinatesCenter(first.coordenadas);
        this.map?.centerMap(firstCoordenadas.lat(), firstCoordenadas.lng());
      }

      this.mapIsLoading = false;
    });
  }

  openTableRow (e: any){
      this.display_detail = true;
      this.valorConcepto = e.concepto;
      this.valorData = e.valores;
      console.log('data:' + e)
  }

  openTable(e: any){
    const { id } = e;
    this.selectedLote = this.centrosDeCosto.find(it => it.id === id);
    this.display = true;
    this.loadingLeftPanel();
    try {
      this.http.get(`phytosanitary-day-detail/${id}`, { i: this.lastDateInicio, f: this.lastDateFin }).subscribe(response => {
        this.selectedLote.evaluaciones = response?.data;
        (response || []).map(x => {
          this.table =  x.valores_encontrados.map(y => {
            return y
          })
          this.selectedEvaluaciones = x.evaluaciones_sanitarias.map(z => {
            this.fechaEvaluacion = this.formatDateDay(z?.fecha)
            return z
          });
          return x
        })
        this.conceptoData = _.chain(this.table)
          .groupBy("concepto")
          .toPairs()
          .map(item => _.zipObject(["concepto", "valores"], item))
          .value();

           (this.conceptoData || []).forEach(el => {
            const result = _.meanBy(el.valores, val => +val.valor_encontrado)
            el.avg = result
          })
        this.zone.run(() => { this.stopLoadingLeftPanel(); });
      });
      throw "undefined";
    } catch (e) {
      this.stopLoadingLeftPanel();
    }
  }

  onSelectedLote(lote: any) {
    const { id } = lote;

    if (id === this.selectedLoteId) {
      this.selectedLoteId = null;
      $('#tablaDetail').modal('toggle')
      return;
    }

    this.selectedLoteId = id;
    this.selectedLote = this.centrosDeCosto.find(it => it.id === id);
    this.map.updateAllColors(lote.color);


    $('#tablaDetail').modal('show')
    this.loadingLeftPanel();
    try {
      this.http.get(`phytosanitary-detail/${id}`, { i: this.lastDateInicio, f: this.lastDateFin }).subscribe(response => {
        this.table = response?.table;
        this.zone.run(() => { this.stopLoadingLeftPanel(); });
      });
      throw "undefined";
    } catch (e) {
      this.stopLoadingLeftPanel();
    }
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

  centrarLote(e) {
    e.stopPropagation()
    const finde = this.centrosDeCostoSeleccionado.find(it => it.centro_costo === e.target.text);

    //click para centrar el lote
    const { lat, lng } = this.map.getCoordinatesCenter(finde.coordenadas);
    this.map.centerMap(lat(), lng());
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

  plagaSeleccionado(e) {
    // console.log('e', e)
    this.tempKeysPlague = this.tempKeysPlague.filter(v => {
      return v !== e.node?.idconcepto_agricola
    })
    if (this.tempKeysPlague.length != 0) {
      var temparray = this.tempCentroDeCosto
      console.log(temparray)
      this.tempKeysPlague.forEach(r => {
        temparray = temparray.filter(t => t?.idconcepto_agricola !== r)
      })
      this.centrosDeCostoSeleccionado = temparray;
      return;
    }
    this.centrosDeCostoSeleccionado = this.tempCentroDeCosto;
  }

  plagaUnSeleccionado(e) {
    let i = true
    this.tempKeysPlague.forEach(element => {
      if (element == e.node?.idconcepto_agricola) {
        i = !i;
      }
    });
    if (i) {
      this.tempKeysPlague.push(e.node?.idconcepto_agricola);
    }
    this.centrosDeCostoSeleccionado = this.centrosDeCostoSeleccionado.filter(it => it.idconcepto_agricola !== e.node.idconcepto_agricola);
  }

}
