import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AbstractFormGroup, FormGroupProvider } from '@app/common/classes/abstract-form-group.class';
import { AgritareoComponents } from '@app/config/agritareo-components.config';

// FIXME: Ver si se elimina o no (mnt clieprov)
@Component({
  selector: 'ns-frm-mnt-clieprov-contactos',
  templateUrl: './frm-mnt-clieprov-contactos.component.html',
  styleUrls: ['./frm-mnt-clieprov-contactos.component.scss'],
  providers: [
    FormGroupProvider(FrmMntClieprovContactosComponent)
  ]
})
export class FrmMntClieprovContactosComponent extends AbstractFormGroup implements OnInit {
  componentId = AgritareoComponents.SuggestPEmpresa;

  displayedColumnsContactC: [];

  @Input() data: FormGroup;

  form = this.fb.group({
    id: [],
    idclieprov: [],
    nombre: [],
    predeterminado: [],
    telefono: [],
    correo: [],
    idestado: [],
    para_cobranza: [],
    enviar_email: [],
    tmclieprov_contacto_comunicacion: this.fb.array([])
    // tmclieprov_contacto_comunicacion: this.fb.array([
    //   this.fb.group({
    //     id: [],
    //     idclieprov_contacto: [],
    //     idtipo_comunicacion: [],
    //     codtipo_comunicacion: [],
    //     descripcion: [],
    //     nomtipo_comunicacion: [],
    //     principal: [],
    //     valor: []
    //   })
    // ])
  });

  titleOnCreate = 'Nuevo Contacto';
  titleOnEdit = 'Modificar Contacto';

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit() {
    super.ngOnInit();
    this.form.valueChanges.subscribe(() => {
      this.data.patchValue(this.form.getRawValue());
    });
  }

  load(data) {
    this.form.patchValue(data);
  }

  // FormGroup {
  //   return this.fb.group({
  //     id: [],
  //     idclieprov: [],
  //     nombre: [],
  //     predeterminado: [],
  //     telefono: [],
  //     correo: [],
  //     idestado: [],
  //     para_cobranza: [],
  //     enviar_email: [],
  //     tmclieprov_contacto_comunicacion: this.fb.array([
  //       this.fb.group({
  //         id: [],
  //         idclieprov_contacto: [],
  //         idtipo_comunicacion: [],
  //         codtipo_comunicacion: [],
  //         descripcion: [],
  //         nomtipo_comunicacion: [],
  //         principal: [],
  //         valor: []
  //       })
  //     ])
  //   });
  // }
}
