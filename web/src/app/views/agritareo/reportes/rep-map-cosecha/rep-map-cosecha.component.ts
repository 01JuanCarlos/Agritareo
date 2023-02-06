import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { NsMapComponent } from '@app/components/ns-map/ns-map.component';
import { BaseReport } from '@app/common/classes/abstract-base-report.class';
import * as moment from 'moment';
import { ReportesService } from '../reportes.service';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounce, isUndefined } from 'lodash';
import { BITACORAS } from '@app/common/constants/agritareo.constants';
import { AgritareoComponents } from '@app/config/agritareo-components.config';

@Component({
  selector: 'ns-rep-map-cosecha',
  templateUrl: './rep-map-cosecha.component.html',
  styleUrls: ['./rep-map-cosecha.component.scss'],
  providers: [
    ReportesService,
  ]
})
export class RepMapCosechaComponent extends BaseReport implements OnInit {
  @ViewChild('map', { static: true }) map: NsMapComponent;
  form: FormGroup;
  lastDateInicio = '';
  lastDateFin = '';

  //variable para el loading del mapa
  mapIsLoading = true;

  tempCentroDeCosto = [];
  centrosDeCosto = [];
  centrosDeCostoOrdered = [];
  centrosDeCostoSeleccionado = [];

  selectedLoteId: number;
  selectedLote: any;

  constructor(
    private fb: FormBuilder,
    private zone: NgZone,
    private reportService: ReportesService,
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

  setInitialData(i?: string, f?: string) {
    this.mapIsLoading = true;
    this.http.get('harvest-report', { i, f }).subscribe(data => {
      this.centrosDeCosto = (data.lotes || []).map(it => {
        it.id = it.idcentro_costo;
        it.label = it.centro_costo;
        it.codigo = it.codigo;
        let valorNulo = (it.evaluaciones_sanitarias || []).length
        const valorVerde = (it.evaluaciones_sanitarias || []).some(e => e.numero_nivel == 1)
        const valorAmbar = (it.evaluaciones_sanitarias || []).some(e => e.numero_nivel == 2)
        const valorRojo = (it.evaluaciones_sanitarias || []).some(e => e.numero_nivel == 1)
        it.fillColor = valorRojo ? '#FF0000' : it.color;
        it.color = valorRojo ? '#FF0000' : it.color;

        it.polygonLabel =
          '<div class="fitosanidad-wrapper">' +
          '<span class="label-first">' + it.codigo + '</span> <br> ' +
          '</div>';

        it.polygonInfo =
          '<div style="margin: 10px;">' +
          '<div class="sec-content font-weight-bold" >' + 'Lote: ' + it.centro_costo + '</div>' +
          // '<div><a class="mt-2"><strong>Cultivo: </strong>' + it.cultivo + '</a></div>' +
          // '<div><a><strong>Variedad: </strong>' + it.variedad + '</a></div>' +
          '<div><a><strong>Área: </strong>' + it.area + '</a></div>' +
          '<div><a><strong>Campaña: </strong>' + this.formatDate(data.meta.fecha_inicio.split('T')[0]) + '-' + this.formatDate(data.meta.fecha_fin.split('T')[0]) + '</a></div>' +
          '</div></div>';
        return it;
      });

      this.centrosDeCostoOrdered = this.orderedData([...this.centrosDeCosto] ?? [], 'parent').filter(Boolean);
      this.centrosDeCostoSeleccionado = [...this.centrosDeCostoOrdered];
      this.tempCentroDeCosto = [...this.centrosDeCostoSeleccionado];

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

  onSelectedLote(lote: any) {
    const { id } = lote;

    if (id === this.selectedLoteId) {
      this.selectedLoteId = null;
      lote.setOptions({ fillColor: lote.color });
      $('#tablaDetail').modal('toggle')
      return;
    }

    this.selectedLoteId = id;
    this.selectedLote = this.centrosDeCosto.find(it => it.id === id);
    this.map.updateAllColors(lote.color);

    // it.fillColor = valorRojo ? '#FF0000' : it.color;
    lote.setOptions({ fillColor: '#0d6efd' });

    $('#tablaDetail').modal('show')
    // this.openLeftPanel();
    this.loadingLeftPanel();
    try {
      this.http.get(`phytosanitary-detail/${id}`, { i: this.lastDateInicio, f: this.lastDateFin }).subscribe(response => {
        this.selectedLote.evaluaciones = response?.data;
        // this.table = response?.table;
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

}
