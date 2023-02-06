import { Component, Injector, ViewChild } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { AbstractDocument, DocumentProvider } from '@app/common/classes';
import { BITACORAS } from '@app/common/constants/agritareo.constants';
import { NsDocument } from '@app/common/decorators/document.decorator';
import { NsDetailSectionComponent } from '@app/components/ns-detail-section/ns-detail-section.component';
import { NsImageUploaderComponent } from '@app/components/ns-image-uploader/ns-image-uploader.component';
import { AgritareoComponents } from '@app/config/agritareo-components.config';
import { debounce } from 'lodash-es';

@Component({
  selector: 'ns-bitacora',
  templateUrl: './bitacora.component.html',
  styleUrls: ['./bitacora.component.scss'],
  providers: [
    DocumentProvider(BitacoraComponent)
  ]
})

@NsDocument({
  formControllerId: BITACORAS,
  isDocument: true,
})

export class BitacoraComponent extends AbstractDocument {
  @ViewChild('evaluacionTab', { static: false }) evaluacionTab: NsDetailSectionComponent;
  @ViewChild('conceptoTab', { static: false }) conceptoTab: NsDetailSectionComponent;
  @ViewChild('imageUploader', { static: false }) imageUploader: NsImageUploaderComponent;
  @ViewChild('evaluacionesSanitariasDetails') evaluacionesSanitariasDetails;
  @ViewChild('organosAfectadosDetails') organosAfectadosDetails;

  SuggestCultivo = AgritareoComponents.SuggestCultivo;
  SuggestVariedad = AgritareoComponents.SuggestVariedad;
  SuggestTipoConcepto = AgritareoComponents.SuggestTipoConcepto;
  SuggestTipoRegistro = AgritareoComponents.SuggestTipoRegistro;
  SuggestResponsable = AgritareoComponents.SuggestResponsable;
  SuggestParcela = AgritareoComponents.SuggestLote;
  SuggestConcepto = AgritareoComponents.SuggestConcepto;


  IDEVALUACION_SANITARIA = 4;

  subconceptos = [];
  umbrales = [];

  registryTypes = [];

  form = this.fb.group({
    id: '',
    idtipo_registro: ['', Validators.required],
    idevaluador: ['', Validators.required],
    idcentro_costo: ['', Validators.required],
    fecha: ['', Validators.required],


    idcultivo: [''],
    idcultivo_variedad: [''],
    codigo_campania: [''],
    descripcion_campania: [''],
    dia_crecimiento: [''],
    semana_crecimiento: [''],
    estado_fenologico: [''],
    fenologia_variedad: [''],
    area_sembrada: [''],
    idcampania: [''],
    idcampania_agricola: [''],
    // dia_crecimiento: [''],



    anio: [''],
    area_total: [''],
    cultivo: [''],
    descripcion: [''],
    dias_transcurridos_fenologia: [''],
    fecha_fin_fenologia_campania: [''],
    fecha_inicio_campania: [''],
    fecha_inicio_fenologia_campania: [''],
    fecha_inicio_siembra: [''],
    idestado_fenologico: [''],
    idestado_fenologico_detalle: [''],
    idfenologia_campania: [''],
    idfenologia_variedad: [''],
    idsiembra: [''],
    variedad: [''],
    parcela: [''],
    evaluador: [''],


    evaluaciones_sanitarias: this.fb.array([]),
    // conceptos_sanitarios: this.fb.array([this.conceptoSatniario]),
    // evaluaciones_sanitarias: this.fb.array([this.evaluacionSanitaria()]),
  });

  lastDate: string;
  lastParcela: number;
  idBitacora_agricola: number;
  image: any;

  constructor(injector: Injector) {
    super(injector);
    this.getRegistryType();
    this.checkParcela = debounce(this.checkParcela, 100);
  }

  getRegistryType() {
    this.http.get('/binnacle-type').subscribe(data => this.registryTypes = data || []);
  }

  checkParcela() {
    if (this.form.value.fecha.length <= 10) {
      return;
    }

    if (this.lastParcela === this.form.value.idcentro_costo && this.form.value.fecha === this.lastDate) {
      return;
    }

    this.lastParcela = this.form.value.idcentro_costo;
    this.lastDate = this.form.value.fecha;

    if (!this.lastParcela || !this.lastDate) {
      return;
    }

    this.http.get('plot-data', { fecha: this.lastDate, parcela: this.lastParcela }).subscribe((data) => {
      if (Array.isArray(data)) {
        this.form.patchValue(data[0] || {});
      } else {
        this.form.patchValue(data || {});
      }
    });
    // console.log('Acá consultar data', this.lastResponsable, this.lastDate);
  }



  getSubConceptoCultivo(obj: any) {
    this.idBitacora_agricola = this.form.value.id;
    this.http.get(`table-image/${this.idBitacora_agricola}`).subscribe(data => {
      this.image = data.map(it => {
        console.log(it)
        return it;
      });
    });
    const idCultivo = this.form.value.idcultivo;
    const idConcepto = obj.id;

    const concepto = obj.label;
    // console.log(this.evaluacionTab)
    const formGroup = this.form.get(['evaluaciones_sanitarias', this.evaluacionTab?.selectedIndex]) as FormGroup;
    // if (formGroup.value.concepto !== concepto) {
    //   formGroup.patchValue({ concepto });
    // }

    if (!idCultivo || !idConcepto) {
      return;
    }

    this.http.get('subconcept', { c: idCultivo, ca: idConcepto }).subscribe(data => this.subconceptos = data || []);
  }

  onSelectedSubconcepto(id: number) {
    const obj = this.subconceptos.find(it => it.idevaluacion_subconcepto === id)
    this.umbrales = [];

    if (!obj) {
      return;
    }

    const formGroup = this.form.get(['evaluaciones_sanitarias', this.evaluacionTab.selectedIndex]) as FormGroup;
    formGroup.patchValue(obj);

    const fenologiaVariedad = this.form.value.idfenologia_variedad;
    const idVariedad = this.form.value.idcultivo_variedad;
    const idMetodoEvaluacion = obj.idmetodo_evaluacion;

    this.http.get('threshold-method', { me: idMetodoEvaluacion, fv: fenologiaVariedad, cv: idVariedad }).subscribe(data => this.umbrales = data || []);
  }

  patchEvaluacionDetalle(idUmbral: any) {
    const obj = this.umbrales.find(it => it.id === idUmbral);
    if (!obj) {
      return;
    }

    const formGroup = this.form.get(['evaluaciones_sanitarias', this.evaluacionTab.selectedIndex]) as FormGroup;
    formGroup.patchValue({ idmetodo_evaluacion_detalle: obj.idmetodo_evaluacion_detalle });
  }

  conceptoSatniario() {
    return this.fb.group({
      idconcepto: [''],
      concepto: [''],
      organo_afectado: [''],
    });
  }

  createEvaluacionSanitaria() {
    return this.fb.group({
      idtipo_concepto: [''],
      idconcepto: [''],
      idconcepto_cultivo: [''],
      concepto: [''],
      organos_afectados: this.fb.array([]),
    });
  }

  get currentEvaluacionSanitaria() {
    return this.form.get(['concepto', this.evaluacionesSanitariasDetails?.selectedIndex || 0]) as FormGroup;
  }

  createOrganoAfectado() {
    return this.fb.group({
      idbitacora_agricola: '',
      idsubconcepto_evaluado: '',
      idevaluacion_subconcepto: [''],
      idmedida: [''],
      idmetodo_evaluacion: [''],
      idsubconcepto_agricola: [''],
      metodo_evaluacion: [''],
      organo_afectado: [''],
      subconcepto_agricola: [''],
      unimedida: [''],
      idumbral_rango: [''],
      valor_encontrado: [''],
      glosa: [''],
      idmetodo_evaluacion_detalle: [''],
      imagenes: this.fb.array([]),
    });
  }

  get evaluacionSanitariaHasOrganos(): boolean {
    const organo = this.form.get(['evaluaciones_sanitarias', this.evaluacionesSanitariasDetails?.selectedIndex || 0, 'organos_afectados']);
    return !!organo?.value?.length;
  }

  imagen() {
    return this.fb.group({
      ruta: '',
      data: '',
      uuid: '',
    });
  }

  get conceptosSanitarios(): FormArray {
    return this.form.get('conceptos_sanitarios') as FormArray;
  }

  get evaluacionesSanitarias() {
    return this.form.get('evaluaciones_sanitarias');
  }

  get datosEvaluaciones() {
    return this.form.controls['evaluaciones_sanitarias'].value;
  }

  array = [{ nombre: 1 }, { nombre: 's' }, { nombre: 'h' }, { nombre: 'j' }]

  evaluacionesSanitariasIMG(n: any) {
    // console.log(n)
    const index = n.selectedIndex;
    const data = n.formArray.value;
    const image = data[index]?.imagenes;
    const send = image?.map(it => it.ruta);
    return send
    // image.map(it => {
    //   it.ruta || it.data
    //   console.log(it.ruta)
    // })
    // console.log(index, data[index]);
    // const formGroup = this.form.get(['evaluaciones_sanitarias', this.evaluacionTab?.selectedIndex]) as FormGroup;
    // console.log(formGroup?.value.evaluaciones_sanitarias)
    // return (formGroup?.value.evaluaciones_sanitarias || []).map(eva => {
    //   eva.map(it => it.ruta || it.data);
    // })
    // it.imagenes?.map(it => it.ruta || it.data);
  }



  addImagen(image) {
    const formArray = this.form.get(['evaluaciones_sanitarias', this.evaluacionTab?.selectedIndex, 'imagenes']) as FormArray;
    const formGroup = this.imagen();
    formGroup.patchValue({ data: image.blob });
    formArray.push(formGroup);
  }
}
