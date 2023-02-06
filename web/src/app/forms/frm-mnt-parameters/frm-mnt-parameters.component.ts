import { Component, OnInit, Injector } from '@angular/core';
import { AbstractFormGroup, FormGroupProvider } from '@app/common/classes/abstract-form-group.class';
import { NotificationService } from '@app/services/util-services/notifications.service';

@Component({
  selector: 'ns-mnt-parameters',
  templateUrl: './frm-mnt-parameters.component.html',
  styleUrls: ['./frm-mnt-parameters.component.scss'],
  providers: [
    FormGroupProvider(MntParametersComponent)
  ]
})
export class MntParametersComponent extends AbstractFormGroup implements OnInit {
  titleOnCreate = 'Nuevo parámetro';
  titleOnEdit = 'Modificar parámetro';
  componentId = 'FrmMntParameter';

  form = this.fb.group({
    id: [''],
    parametro: [''],
    descripcion: [''],
    valordefecto: ['']
  });

  constructor(injector: Injector, private notification: NotificationService) {
    super(injector);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  initForm() {
    this.clearData();
  }

  setData(data) {
    if (!data) {
      return this.notification.warn('Data inválida');
    }

    this.form.patchValue({
      id: data.id,
      parametro: data.parametro,
      descripcion: data.descripcion,
      valordefecto: data.valordefecto
    });
  }

  clearData() {
    this.form.patchValue({
      id: [''],
      parametro: [''],
      descripcion: [''],
      valordefecto: ['']
    });
  }
}
