import { Component, Injector, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { AbstractFormGroup, FormGroupProvider } from '@app/common/classes/abstract-form-group.class';
import { AgritareoComponents } from '@app/config/agritareo-components.config';
import { NotificationService } from '@app/services/util-services/notifications.service';
// import { Components } from '@app/common/constants/components.constants';

@Component({
  selector: 'ns-frm-mnt-company-parameters',
  templateUrl: './frm-mnt-company-parameters.component.html',
  styleUrls: ['./frm-mnt-company-parameters.component.scss'],
  providers: [
    FormGroupProvider(FrmMntParameterComponent)
  ]
})
export class FrmMntParameterComponent extends AbstractFormGroup implements OnInit {
  componentId = AgritareoComponents.SuggestPEmpresa;
  titleOnCreate = 'Nuevo parámetro';
  titleOnEdit = 'Modificar parámetro';

  form = this.fb.group({
    id: [],
    peid: [],
    idparametro: ['', [Validators.required]],
    parametro: ['', [Validators.required]],
    descripcion: [''],
    habilitado: [1],
    idref: [],
    cid: [],
    valor: ['']
  });

  onSelectFinder(event) {
    this.form.patchValue({ parametro: event.label, descripcion: event.description, pedi: event.badge, valor: event.icon });
  }

  constructor(injector: Injector, private notification: NotificationService) {
    super(injector);
  }
  ngOnInit() {
    super.ngOnInit();
  }

  setData(data) {
    if (!data) {
      return this.notification.warn('Data inválida');
    }

    this.form.patchValue({
      idref: data.idinterno_dadicional,
      cid: data.idcomponente
    });
  }

  clearData() {
    this.form.patchValue({
      id: [],
      peid: [],
      idparametro: ['', Validators.required],
      parametro: ['', Validators.required],
      descripcion: [''],
      habilitado: 1,
      idref: [],
      cid: [],
      valor: '',
    });
  }

}
