import { Component, OnInit, Injector } from '@angular/core';
import { Validators } from '@angular/forms';
import { AbstractFormGroup, FormGroupProvider } from '@app/common/classes/abstract-form-group.class';

@Component({
  selector: 'ns-frm-mnt-form-builder',
  templateUrl: './frm-mnt-form-builder.component.html',
  styleUrls: ['./frm-mnt-form-builder.component.scss'],
  providers: [
    FormGroupProvider(FrmMntFormBuilderComponent)
  ]
})
export class FrmMntFormBuilderComponent extends AbstractFormGroup implements OnInit {
  componentType = [
    { id: 'menu', label: 'Menu' },
    { id: 'tabla', label: 'Tabla' },
    { id: 'formulario', label: 'Formulario' },
    { id: 'ventana', label: 'Ventana' },
    // { id: 'input', label: 'Input' },
    // { id: 'boton', label: 'Boton' },
    // { id: 'reporte', label: 'Reporte' }
  ];

  componentId = 'FrmMntFormBuilderComponent';
  constructor(injector: Injector) {
    super(injector);
  }

  form = this.fb.group({
    uuid: [''],
    module_id: [''],
    id: [''],
    cid: [''],
    moduleId: [''],
    parent_id: [''],
    // Datos del componente
    codigo: [''],
    label: ['', [Validators.required]],
    descripcion: [''],
    codigo_acceso: [''],
    atajo_teclado: [''],
    tipo: ['', [Validators.required]],
    metadata: this.fb.group({
      proc: [''],
      path: [''],
      icon: [''],
      struct_document: [''],
    }),

    isDynamicDocument: [''],
    headerDocument: [''],
    detailDocument: ['']

  });

  get cType(): string {
    return this.form.get('tipo').value;
  }

  get showProc(): boolean {
    return this.form.get('tipo').value === 'tabla' || this.form.get('tipo').value === 'formulario';
  }

  setData(data) {
    this.reset();
    console.log('setData: ', data);
    if (!data) {
      return console.error('Data inválida');
    }

    this.patchFormValue({
      uuid: data.uuid,
      id: data.id,
      parent_id: data.parent_id,
      codigo: data.codigo,
      label: data.label,
      descripcion: data.descripcion,
      codigo_acceso: data.codigo_acceso,
      atajo_teclado: data.atajo_teclado,
      tipo: data.tipo,
      metadata: JSON.parse(data.metadata || '{}')
    });
  }

  ngOnInit() {
    super.ngOnInit();
  }

  submitForm() {
    console.log('Datos a wardar: ', this.form.value);
  }

  reset() {
    this.resetForm();
  }
}
