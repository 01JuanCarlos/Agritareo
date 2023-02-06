import { Component, Injector, ViewChild } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { AbstractDocument, DocumentProvider } from '@app/common/classes';
import { CENTRO_DE_COSTOS, CONTROLADORDERIEGO, CULTIVOS, FENOLOGIA_CAMPANA, ZONAS_GEOGRAFICAS } from '@app/common/constants/agritareo.constants';
import { NsDocument } from '@app/common/decorators/document.decorator';
import { NsMapComponent } from '@app/components/ns-map/ns-map.component';
import { AgritareoComponents } from '@app/config/agritareo-components.config';
import { debounce, values } from 'lodash-es';

@Component({
  selector: 'ns-lote-de-siembra',
  templateUrl: './lote-de-siembra.component.html',
  styleUrls: ['./lote-de-siembra.component.scss'],
  providers: [
    DocumentProvider(LoteDeSiembraComponent)
  ]
})

@NsDocument({
  formControllerId: CENTRO_DE_COSTOS,
  isDocument: true,
  // agregado por glenn
  viewURLZONAS: ZONAS_GEOGRAFICAS,
  viewURLCULTIVOS: CULTIVOS,
  //----------------------------------------------------
})
export class LoteDeSiembraComponent extends AbstractDocument {
  @ViewChild('siembraDetails') siembraDetails;
  @ViewChild('campaniaDetails') campaniaDetails;
  @ViewChild('campaniaAnioDetails') campaniaAnioDetails;
  @ViewChild(NsMapComponent) map: NsMapComponent;

  finderCampana = AgritareoComponents.SuggestCampana;
  finderCultivo = AgritareoComponents.SuggestCultivo;
  finderVariedadCultivo = AgritareoComponents.SuggestVariedad;
  finderFundo = AgritareoComponents.SuggestFundo;
  finderSector = AgritareoComponents.SuggestSector;
  finderZonaGeografica = AgritareoComponents.SuggestZonaGeografica;

  // agregado por glenn
  viewURLZONAS: string;
  viewURLCULTIVOS: string;
  codigo = '';
  descripcion = '';
  id = '';
  //----------------------------------------------------

  controladoresDeRiego = [];

  CentroDeCostosTipo = {
    11: 'Fundo',
    12: 'Sector',
    13: 'Lote'
  };

  // agregado por glenn
  tableHeaderZONAS = [
    { field: 'descripcion', label: 'Descripción'},
    { field: 'descripcion_corta', label: 'Descripción Corta'},
  ];

  tableHeaderCULTIVOS = [
    { field: 'codigo', label: 'Código tipo' },
    { field: 'cultivo', label: 'Descripción' },
  ];
   //----------------------------------------------------

  headerCoordenadas = [
    { field: 'id', label: '', visible: false },
    { label: 'Descripción', field: 'punto' },
    { label: 'Latitud', field: 'latitud' },
    { label: 'Longitud', field: 'longitud' },
  ];

  dataCoordenadas = [];

  headerFenologias = [
    { field: 'id', label: '', visible: false },
    { label: 'Estado Fenológico', field: 'fenologia' },
    { label: 'Día Inicio', field: 'dia_inicio' },
    { label: 'Día Final', field: 'dia_fin' },
    { label: '# Dias', field: 'nro_dias' },
    { label: 'Desde', field: 'fecha_inicio', isDate: true },
    { label: 'Hasta', field: 'fecha_fin', isDate: true },
  ];

  form = this.fb.group({
    idcentrocostopadre: '',
    area: '',
    codigo: [, [Validators.required]],
    coordenadas: '',
    idcontrolador_riego: null,
    idzona_geografica: [, [Validators.required]],
    idempresa: '',
    idnivel: '',
    idnivelconfiguracion: '',
    nombrenivel: [, [Validators.required]],
    parent_id: '',
    referencia: '',
    valvulas: '',
    area_ingresada: '',

    siembra: this.fb.array([]),
  });

  mapData = [];

  editableCoordenadas: boolean;

  constructor(injector: Injector) {
    super(injector);
    this.getDatosControladorDeRiego();
    // agregado por glenn
    this.viewURLZONAS = this.options.viewURLZONAS;
    this.viewURLCULTIVOS = this.options.viewURLCULTIVOS;
     //----------------------------------------------------

    this.onLoadFetchData.subscribe(data => {
      // this.mapData = [...this.mapData, ...[{ coordenadas: data.coordenadas }]]
      this.mapData = [...[{ coordenadas: data.coordenadas }]];
      this.form.patchValue({ coordenadas: data.coordenadas });
      this.map.centerMap(data?.latitud, data?.longitud);
    });
    this.updateFechas = debounce(this.updateFechas, 100);
  }


  // agregado por glenn
  goEditZona({ item } = { item: void 0 }) {
    if (item && item?.id) {
     this.codigo = item?.descripcion;
     this.descripcion = item?.descripcion_corta;
     //this.id = item;
     this.id = item?.id;
   }
 }

 goEditCultivo({ item } = { item: void 0 }) {
  if (item && item?.id) {
   this.codigo = item?.codigo;
   this.descripcion = item?.cultivo;
   //this.id = item;
   this.id = item?.id;
 }
}
 //----------------------------------------------------


  get siembraHasCampanias(): boolean {
    const campania = this.form.get(['siembra', this.siembraDetails?.selectedIndex || 0, 'campania']);
    return !!campania?.value?.length;
  }

  getFenologiasZonaVariedad() {
    const siembra = this.form.get(['siembra', this.siembraDetails?.selectedIndex || 0]);
    const campania = siembra.get(['campania', this.campaniaDetails?.selectedIndex || 0]);

    if (!campania || !siembra) {
      return;
    }

    const obj = {
      f: campania.value.fecha_inicio,
      c: campania.value.idcampania_agricola,
      v: siembra.value.idvariedad,
      z: this.form.value.idzona_geografica
    };

    const emptyCheck = values(obj).every(x => !!x);

    if (!emptyCheck) {
      return;
    }

    this.http.get(FENOLOGIA_CAMPANA, obj).subscribe(data => {
      const arr = campania.get(['fenologia_campania']) as FormArray;
      arr.clear();
      data.forEach(fenologia => {
        const fenologiaGroup = this.createFenologiaCampania();
        fenologiaGroup.patchValue({
          idestado_fenologico_d: fenologia.id,
          fenologia: fenologia.fenologia_variedad,
          dia_inicio: fenologia.dia_inicio,
          dia_fin: fenologia.dia_fin,
          fecha_inicio: fenologia.fecha_inicio,
          fecha_fin: fenologia.fecha_fin,
          nro_dias: fenologia.duracion_dias
        });
        arr.push(fenologiaGroup);
      });
    });
    // const zona = this.form.value.idzona_geografica;
    // const variedad = this.form.get(['siembra', this.siembraDetails.selectedIndex]).value.idvariedad;

    // if (!zona || !variedad) {
    //   return;
    // }

    // const arrayFenologiaCampaniaSeleccionada = this.form.get([
    //   'siembra', this.siembraDetails.selectedIndex,
    //   'campania', this.campaniaDetails.selectedIndex,
    //   'campania_anio', this.campaniaAnioDetails.selectedIndex,
    //   'fenologia_campania']) as FormArray;

    // arrayFenologiaCampaniaSeleccionada.clear();

    // this.http.get(`${ZONA_VARIEDAD}/${variedad}`, { z: zona }).subscribe(data => {
    //   (data || []).forEach(fenologia => {
    //   });
    // });
  }

  get isSector() {
    return this.form.value.idnivelconfiguracion.toString() === (12).toString();
  }

  get isFundo() {
    return this.form.value.idnivelconfiguracion.toString() === (11).toString();
  }

  get isLote() {
    return this.form.value.idnivelconfiguracion.toString() === (13).toString();
  }

  get dataFenologias() {
    return this.form.get([
      'siembra', this.siembraDetails?.selectedIndex,
      'campania', this.campaniaDetails?.selectedIndex,
      'fenologia_campania'])?.value || [];
  }

  updateFechas() {
    // TODO: Actualizar fechas
    // const detalleCampania = this.form.get([
    //   'siembra', this.siembraDetails?.selectedIndex,
    //   'campania', this.campaniaDetails?.selectedIndex,
    //   'campania_anio', this.campaniaAnioDetails?.selectedIndex]).value


    // const arr = this.form.get([
    //   'siembra', this.siembraDetails?.selectedIndex,
    //   'campania', this.campaniaDetails?.selectedIndex,
    //   'campania_anio', this.campaniaAnioDetails?.selectedIndex,
    //   'fenologia_campania']) as FormArray;



    // arr.controls.forEach((it, index) => {
    //   if (index === 0) {
    //     const dateP = moment(detalleCampania.fecha_inicio_campania, 'DD/MM/YYYY');
    //     it.patchValue({ desde: dateP.format('DD/MM/YYYY'), hasta: moment(arr.at(index + 1).value.fecha_inicio).format('DD/MM/YYYY') })

    //     it.patchValue({
    //       dia_fin: moment(it.value.hasta, 'DD/MM/YYYY').diff(dateP, 'days'),
    //       duracion_dias: moment(it.value.hasta, 'DD/MM/YYYY').diff(dateP, 'days')
    //     })
    //     return;
    //   }

    //   if (index === arr.length - 1) {
    //     const dateP = moment(detalleCampania.fecha_fin_campania, 'DD/MM/YYYY');
    //     it.patchValue({ hasta: dateP.format('DD/MM/YYYY'), desde: moment(arr.at(index - 1)?.value.fecha_fin).format('DD/MM/YYYY') })

    //     const diff = dateP.diff(moment.utc(it.value.fecha_inicio), 'days');

    //     it.patchValue({
    //       dia_fin: Number(arr.at(index - 1).value.dia_fin) + diff,
    //       duracion_dias: diff
    //     })
    //     return;
    //   }

    //   const dateValueF = it.value.fecha_fin;
    //   const dateValueI = it.value.fecha_inicio;
    //   it.patchValue({ desde: moment(dateValueI).format('DD/MM/YYYY'), hasta: moment(dateValueF).format('DD/MM/YYYY') })
    // });
  }

  createSiembra() {
    return this.fb.group({
      id: '',
      codigo_siembra: [, [Validators.required]],
      fecha_inicio: ['', [Validators.required]],
      fecha_fin: '',
      area_sembrada: [, [Validators.required]],
      estado: [true, [Validators.required]],
      idcultivo: [, [Validators.required]],
      idvariedad: ['', [Validators.required]],
      campania: this.fb.array([]),
    });
  }

  get currentSiembra() {
    return this.form.get(['siembra', this.siembraDetails?.selectedIndex || 0]) as FormGroup;
  }

  createCampania() {
    return this.fb.group({
      id: '',
      codigo: [, [Validators.required]],
      idcampania_agricola: ['', [Validators.required]],
      area_sembrada: [this.currentSiembra.value.area_sembrada, [Validators.required]],
      costo_proyectado: '',
      idcosecha: '',
      estado: [true, [Validators.required]],
      idsiembra: '',
      kilos_proyectado: '',
      fecha_inicio: [, [Validators.required]],
      fecha_fin: '',
      numero_plantas: '',
      fenologia_campania: this.fb.array([])
    });
  }

  createFenologiaCampania() {
    return this.fb.group({
      id: '',
      idestado_fenologico_d: [, [Validators.required]],
      fenologia: '',
      idcampania: '',
      dia_inicio: [, [Validators.required]],
      dia_fin: [, [Validators.required]],
      fecha_inicio: [, [Validators.required]],
      fecha_fin: [, [Validators.required]],
      nro_dias: ''
    });
  }

  selectedTopLevel(topLevel: any) {
    console.log(topLevel);
    this.http.get(`${CENTRO_DE_COSTOS}/${topLevel.id}/coordinates`).subscribe(data => {
      this.mapData = data.lotes.filter(it => it.id.toString() !== this.formId.toString());
    });
  }

  getDatosControladorDeRiego() {
    this.http.get(CONTROLADORDERIEGO).subscribe((data) => {
      this.controladoresDeRiego = data || [];
    });
  }

  onSelectedPolygon(objPolygon: any) {
    const [pol] = objPolygon;
    this.form.patchValue({
      coordenadas: pol.coordenadas
    });
    this.dataCoordenadas = pol.coordenadas.map((it, idx: number) => {
      return { ...it, label: 'P' + idx };
    });
  }

  get coordinatesTable() {
    return (this.form.value.coordenadas || []).map((it, idx: number) => ({ ...it, punto: `P${idx}` }));
  }
}
