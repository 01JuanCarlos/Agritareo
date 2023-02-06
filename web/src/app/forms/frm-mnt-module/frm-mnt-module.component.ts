import { Component, OnInit, Injector } from '@angular/core';
import { Validators } from '@angular/forms';
import { AbstractFormGroup, FormGroupProvider } from '@app/common/classes/abstract-form-group.class';

@Component({
  selector: 'ns-frm-mnt-module',
  templateUrl: './frm-mnt-module.component.html',
  styleUrls: ['./frm-mnt-module.component.scss'],
  providers: [
    FormGroupProvider(FrmMntModuleComponent)
  ]
})
export class FrmMntModuleComponent extends AbstractFormGroup implements OnInit {

  componentId = 'FrmMntModuleComponent';

  form = this.fb.group({
    id: [''],
    label: ['', [Validators.required]],
    metadata: [''],
    general: [false],
    path: ['', [Validators.required]]
  });

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  onSubmit() {
    this.form.patchValue({
      metadata: JSON.stringify({path: this.form.value.path})
    });
  }

}
