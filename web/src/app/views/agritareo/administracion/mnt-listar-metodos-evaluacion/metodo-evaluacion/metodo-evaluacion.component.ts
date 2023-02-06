import { Component, Injector, ViewChild } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { AbstractDocument } from '@app/common/classes';
import { METODOS_EVALUACION, TEXTOS_DE_ENTRADA } from '@app/common/constants/agritareo.constants';
import { NsDocument } from '@app/common/decorators/document.decorator';
import { deepPatch } from '@app/common/utils/form.util';
import { AgritareoComponents } from '@app/config/agritareo-components.config';
import { CANTIDAD_NIVELES_EVALUACION } from './metodo-evaluacion.constatns';

@Component({
  selector: 'ns-metodo-evaluacion',
  templateUrl: './metodo-evaluacion.component.html',
  styleUrls: ['./metodo-evaluacion.component.scss']
})

@NsDocument({
  formControllerId: METODOS_EVALUACION,
  isDocument: true,
})
export class MetodoEvaluacionComponent extends AbstractDocument {
  @ViewChild('variedadTable') variedadTable;
  @ViewChild('umbralTable') umbralTable;

  SuggestUnidadMedida = AgritareoComponents.SuggestUnidadMedida;
  SuggestCultivo = AgritareoComponents.SuggestCultivo;
  SuggestVariedad = AgritareoComponents.SuggestVariedad;
  SuggestFenologia = AgritareoComponents.SuggestFenologia;

  tipoDeEntrada = [];
  selectedTipoEntradaIndex: number;

  selectedVariedad: any;
  selectedUmbral: any;

  CANTIDAD_NIVELES_EVALUACION = CANTIDAD_NIVELES_EVALUACION;

  headerUmbrales = [
    { visible: false, field: 'idmetodo_cultivo_variedad' },
    { visible: false, field: 'idfenologia_variedad' },
    { field: 'fenologia_variedad' },
    { field: 'bajo_d' },
    { field: 'bajo_a' },
    { field: 'medio_d' },
    { field: 'medio_a' },
    { field: 'alto_d' },
    { field: 'alto_a' },
  ];

  headerCultivosVariedad = [
    { visible: false, field: 'id' },
    { label: 'Cultivo', field: 'cultivo' },
    { visible: false, field: 'idcultivo' },
    { label: 'Variedad', field: 'variedad' },
    { visible: false, field: 'idcultivo_variedad' },
  ];


  umbralForm = this.createUmbralesForm();

  variedadForm = this.createCultivoVariedadForm();

  form = this.fb.group({
    id: '',
    codigo: ['', [Validators.required]],
    estado: 1,
    idmedida: ['', [Validators.required]],
    idtipo_entrada: [, [Validators.required]],
    nombre: ['', [Validators.required]],
    numero_entrada: [''],
    tipo_entrada: [''],
    unimedida: [''],
    cultivos_variedad: this.fb.array([]),
    // niveles_evaluacion: this.fb.array([...CANTIDAD_NIVELES_EVALUACION.map(it => this.fb.group(it))])
  });

  createUmbralesForm() {
    return this.fb.group({
      id: '',
      umbrales_rangos: this.fb.array([]),
      idfenologia_variedad: '',
      fenologia_variedad: '',
      idcultivo_variedad: '',
      idmetodo_evaluacion: '',
      bajo_d: '',
      bajo_a: '',
      medio_d: '',
      medio_a: '',
      alto_d: '',
      alto_a: ''
    });
  }

  createCultivoVariedadForm() {
    return this.fb.group({
      idcultivo: '',
      cultivo: '',
      fenologias: this.fb.array([]),
      idcultivo_variedad: ['', [Validators.required]],
      variedad: '',
    });
  }

  constructor(injector: Injector) {
    super(injector);

    this.getTipoDeEntradas();

    this.onLoadFetchData.subscribe(data => {
      this.selectedTipoEntradaIndex = this.tipoDeEntrada.findIndex(e => {
        return e.id === data?.idtipo_entrada;
      });
    });
  }

  get cultivosVariedad() {
    return this.form.get('cultivos_variedad').value;
  }

  get umbralesVariedad() {
    const umbrales = this.form.get(['cultivos_variedad', this.variedadTable?.selectedIndex, 'fenologias'])?.value || [];
    umbrales.forEach(element => {
      const uBajo = (element.umbrales_rangos || []).find(it => it.numero_nivel === 1);
      const uMedio = (element.umbrales_rangos || []).find(it => it.numero_nivel === 2);
      const uAlto = (element.umbrales_rangos || []).find(it => it.numero_nivel === 3);

      element.bajo_d = uBajo?.rango_inicio;
      element.bajo_a = uBajo?.rango_fin;
      element.medio_d = uMedio?.rango_inicio;
      element.medio_a = uMedio?.rango_fin;
      element.alto_d = uAlto?.rango_inicio;
      element.alto_a = uAlto?.rango_fin;
    });
    return umbrales;
  }


  saveUmbral() {
    const uGroup = this.form.get(['cultivos_variedad', this.variedadTable?.selectedIndex, 'fenologias', this.umbralTable.selectedIndex[0]]) as FormGroup;
    deepPatch(this.umbralForm.value, uGroup);
    this.umbralForm.reset();
  }

  getTipoDeEntradas() {
    this.http.get(TEXTOS_DE_ENTRADA).subscribe((data) => this.tipoDeEntrada = data || []);
  }

  onSelectedVariedad(variedad: any) {
    this.selectedVariedad = variedad;
    deepPatch(variedad || {}, this.variedadForm);
  }

  patchUmbralForm(val) {
    this.selectedUmbral = val;
    this.umbralForm.reset();
    deepPatch(val, this.umbralForm);
  }

  get umbralFormArrayControl() {
    return (this.umbralForm.get('umbrales_rangos') as FormArray).controls;
  }

  beforeAddVariedad(id: number) {
    this.variedadForm.setErrors({ loading: true });
    const idvariedad = this.variedadForm.value.idcultivo_variedad || id;
    const umbrales = this.variedadForm.controls.fenologias as FormArray;

    if (umbrales.length) {
      return;
    }

    this.http.get('phenology-variety/' + idvariedad).subscribe(data => {
      data.forEach(umbral => {
        const uUmbral = {
          idfenologia_variedad: umbral.id,
          fenologia_variedad: umbral.nombre,
          umbrales_rangos: CANTIDAD_NIVELES_EVALUACION.map(it => (this.fb.group(it).getRawValue()))
        };

        const form = this.createUmbralesForm();
        deepPatch(uUmbral, form);
        umbrales.push(form);
      });
      this.variedadForm.setErrors(null);
    });
  }

  checkUmbrales(): boolean {
    const searchIn = ['bajo_d', 'bajo_a', 'medio_d', 'medio_a', 'alto_d', 'alto_a'];
    let readonly = false;
    (this.form.get('cultivos_variedad') as FormArray).controls.forEach((cultivoVariedadControl: FormGroup) => {
      const umbralesCultivo: FormArray = cultivoVariedadControl.controls.umbrales_fenologia as FormArray;
      (umbralesCultivo?.controls || []).forEach(umbralControl => {
        searchIn.forEach(key => {
          if (umbralControl.value[key]) {
            readonly = true;
          }
        });
      });
    });
    return readonly;
  }

  clearUmbrales(): void {
    this.alert.confirmDelete('¿Está seguro que desea eliminar todos los umbrales?', 'Eliminar todos los umbrales')
      .then((result) => {
        if (result) {
          const searchIn: string[] = ['bajo_d', 'bajo_a', 'medio_d', 'medio_a', 'alto_d', 'alto_a'];
          (this.form.get('cultivos_variedad') as FormArray).controls.forEach((cultivoVariedadControl: FormGroup) => {
            const umbralesCultivo: FormArray = cultivoVariedadControl.controls.umbrales_fenologia as FormArray;
            umbralesCultivo.controls.forEach(umbralControl => {
              umbralControl.patchValue(searchIn.reduce((a, b) => (a[b] = '', a), {}));
            });
          });
        }
      });
  }

}
