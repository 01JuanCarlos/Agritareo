import { Component, Injector, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { AbstractDocument, DocumentProvider } from '@app/common/classes';
import { EVALUADORES } from '@app/common/constants/agritareo.constants';
import { NsDocument } from '@app/common/decorators/document.decorator';
import { UniqueID } from '@app/common/utils';
import { TableSimpleComponent } from '@app/components/table-simple/table-simple.component';
import { AgritareoFormComponents } from '@app/config/agritareo-components.config';

interface UPerfil {
  id?: number;
  idperfil: number;
  perfil: string;
  codigo: string;
}

@Component({
  selector: 'ns-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.scss'],
  providers: [
    DocumentProvider(UsuarioComponent)
  ]
})

@NsDocument({
  formControllerId: EVALUADORES,
  viewComponentId: AgritareoFormComponents.Usuario,
  isDocument: true,
})
export class UsuarioComponent extends AbstractDocument {
  @ViewChild('telefonosTable') telefonosTable: TableSimpleComponent;
  @ViewChild('correosTable') correosTable: TableSimpleComponent;

  CODIGO_EVALUADOR = 'EVAL';

  selectedTelefono: any;
  selectedCorreo: any;
  selectedProfile: any;

  /*
    id
    usuario
    nombre
    apellido_paterno
    apellido_materno
    habilitado
    datos_perfil
      id
      idperfil
      nombre as perfil
    datos_evaluador
      id
      idusuario_perfil
      codigo
      color
      registra_evaluaciones
    telefonos
      id
      idusuario
      principal
      telefono
      descripcion
    correos
      id
      idusuario
      principal
      correo
    meta_form
      fecha_creacion
  */

  emailHeader = [
    { field: 'id', label: 'Id', visible: false },
    { field: 'idusuario', label: 'Id Usuario', visible: false },
    { field: 'correo', label: 'Correo', visible: true },
    { field: 'principal', label: 'Principal', visible: true, isBoolean: true }
  ];

  telefonoHeader = [
    { field: 'id', label: 'Id', visible: false },
    { field: 'idusuario', label: 'Id Usuario', visible: false },
    { field: 'telefono', label: 'Teléfono' },
    { field: 'descripcion', label: 'Descripción' },
    { field: 'principal', label: 'Principal', isBoolean: true },
  ];


  form = this.fb.group({
    id: [{ value: '', disabled: true }, [Validators.required]],
    usuario: [''],
    clave: [''],
    nombre: [''],
    apellido_paterno: [''],
    apellido_materno: [''],
    habilitado: [true],

    datos_perfil: this.fb.group({
      id: [''],
      idperfil: [],
      perfil: [''],
      codigo: [''],
    }),

    datos_evaluador: this.fb.group({
      id: [''],
      idusuario_perfil: [''],
      codigo: [''],
      color: ['#0091ff'],
      registra_evaluaciones: [false]
    }),

    telefonos: this.fb.array([]),
    correos: this.fb.array([]),

    fecha_creacion: [{ value: '', disabled: true }, [Validators.required]],
    usuario_creador: [{ value: '', disabled: true }, [Validators.required]]
  });

  emailForm = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    uuid: '',

    id: '',
    idusuario: '',
    principal: [false],
  });

  telefonoForm = this.fb.group({
    telefono: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    uuid: '',

    id: '',
    idusuario: '',
    principal: [false],
  });

  perfiles$ = this.http.get('/profile');

  test(e) {
    const idForm = this.form.get('id').value;
    const idUPefil = this.datosPerfil.get('id')?.value;
    const data: UPerfil = {
      id: idForm ? idUPefil : null,
      idperfil: e.id,
      perfil: e.label,
      codigo: e.codigo
    };
    this.datosPerfil.patchValue(data);
  }

  getUniqueId() {
    return UniqueID();
  }

  constructor(injector: Injector) {
    super(injector);
  }

  get datosPerfil(): FormGroup {
    return this.form.get('datos_perfil') as FormGroup;
  }

  get telefonosList() {
    return this.form.get('telefonos').value || [];
  }

  get correosList() {
    return this.form.get('correos').value || [];
  }

  starTelefono() {
    this.form.controls.telefonos.value.forEach(it => it.principal = it.uuid === this.selectedTelefono.uuid);
  }

  starCorreo() {
    this.form.controls.correos.value.forEach(it => it.principal = it.uuid === this.selectedCorreo.uuid);
  }
}
