import { Component, Injector, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { AbstractFormGroup, FormGroupProvider } from '@app/common/classes/abstract-form-group.class';
import { PROFILE_API_PATH } from '@app/common/constants';

@Component({
  selector: 'ns-frm-mnt-user',
  templateUrl: './frm-mnt-user.component.html',
  styleUrls: ['./frm-mnt-user.component.scss'],
  providers: [
    FormGroupProvider(FrmMntUserComponent)
  ]
})
export class FrmMntUserComponent extends AbstractFormGroup implements OnInit {
  public rolesOptions$ = this.formService.load(PROFILE_API_PATH);
  titleOnCreate = 'Crear nuevo usuario';
  titleOnEdit = 'Modificar información de usuario';
  componentId = 'FrmMntUserComponent';

  form = this.fb.group({
    id: [''],
    nombre: ['', Validators.required],
    idperfil: ['', Validators.required],
    usuario: ['', Validators.required],
    habilitado: [1],
    date: [new Date().toISOString().slice(0, 10)],
  });

  constructor(injector: Injector) {
    super(injector);
  }

  get username() {
    return this.form.get('usuario');
  }

  // Implementación necesaria para el resteo y recuperación de datos por defecto.
  ngOnInit() {
    super.ngOnInit();
  }
}
