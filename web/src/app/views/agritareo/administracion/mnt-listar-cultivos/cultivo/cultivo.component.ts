import { Component, Injector, ViewChild } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { AbstractDocument, DocumentProvider } from '@app/common/classes';
import { CULTIVOS } from '@app/common/constants/agritareo.constants';
import { NsDocument } from '@app/common/decorators/document.decorator';
import { UniqueID } from '@app/common/utils';

@Component({
  selector: 'ns-cultivo',
  templateUrl: './cultivo.component.html',
  styleUrls: ['./cultivo.component.scss'],
  providers: [
    DocumentProvider(CultivoComponent)
  ]
})

@NsDocument({
  formControllerId: CULTIVOS,
  isDocument: true,
})
export class CultivoComponent extends AbstractDocument {
  @ViewChild('variedadesSection', { static: false }) variedadesSection: any;

  selectedFenologia: any;
  selectedFenologiaVariedad: any;

  fenologiaHeader = [
    { field: 'id', label: 'Id', visible: false },
    { field: 'codigo', label: 'Código' },
    { field: 'nombre', label: 'Fenologia' },
    { field: 'duracion_dias', label: '#Días' },
    { field: 'orden', label: 'Orden' }
  ];

  fenologiaVariedadHeader = [
    { field: 'id', label: 'Id', visible: false },
    { field: 'nombre', label: 'Nombre' },
    { field: 'duracion_dias', label: '#Días' },
    { field: 'orden', label: 'Orden' },
  ];

  fenologiaForm = this.fb.group({
    nombre: ['', [Validators.required]],
    duracion_dias: ['', [Validators.required]],
    codigo: ['', [Validators.required]],
    id: '',
    identificador: '',
    idcultivo: '',
    orden: '',
  });

  fenologiaVariedadForm = this.createFenologiaVariedad();

  form = this.fb.group({
    id: [],
    descripcion_cultivo: ['', [Validators.required]],
    codigo: ['', [Validators.required]],
    descripcion_cientifica: [''],
    color: ['', [Validators.required]],
    estilo: [''],
    idpreferencias_cultivo: '',

    variedad: this.fb.array([this.createVariedad()]),
    fenologias_cultivo: this.fb.array([])
  });

  error = '';

  constructor(injector: Injector) {
    super(injector);
  }

  addFenologiaClick(fenologiaModal: any) {
    this.selectedFenologia = null;
    this.fenologiaForm.reset();
    this.error = '';

    this.fenologiaForm.patchValue({
      id: null,
      identificador: UniqueID(),
      orden: (this.fenologiasList.length + 1)
    });

    fenologiaModal.open();
  }

  addFenologia(fenologiaModal: any) {

    if (this.fenologiasList?.some(e => e.codigo === this.fenologiaForm.value.codigo)) {
      this.error = 'El codigo de fenologia ya existe en la lista';
      return;
    }

    this.addFormArrayItem('fenologias_cultivo', this.fenologiaForm);
    this.syncFenologiasVariedad();
    fenologiaModal.close();
  }

  get variedadIndex() {
    return this.variedadesSection?.selectedIndex ?? 0;
  }

  get fenologiasList() {
    return this.form.get('fenologias_cultivo').value || [];
  }

  get variedadesList(): FormArray {
    return this.form.get('variedad') as FormArray;
  }

  createVariedad() {
    return this.fb.group({
      id: [],
      codigo: [, [Validators.required]],
      descripcion_variedad: ['', [Validators.required]],
      idpreferencias_variedad: [],
      color_variedad: [],
      estilo: [],
      fenologias_variedad: this.fb.array([]),
    });
  }

  createFenologiaVariedad() {
    return this.fb.group({
      id: [],
      idvariedad: [],
      idfenologia_cultivo: [],
      nombre: ['', [Validators.required]],
      duracion_dias: [, [Validators.required]],
      orden: [],
      identificador: []
    });
  }

  syncFenologiasVariedad() {
    const fenologiaCultivoValue = this.fenologiaForm.value;
    const variedades = this.form.get('variedad') as FormArray;
    variedades.controls.forEach((variedad: FormGroup) => {
      const fenologiasVariedad = variedad.controls.fenologias_variedad as FormArray;
      const formFenologiaVariedad = this.createFenologiaVariedad();
      formFenologiaVariedad.patchValue({
        duracion_dias: fenologiaCultivoValue.dias,
        ...fenologiaCultivoValue
      });
      fenologiasVariedad.push(formFenologiaVariedad);
    });
  }
}
