import { Component, NgModule, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControlsModule } from '../form-controls/form-controls.module';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SharedModule } from '@app/modules/shared/shared.module';
import { DATA_MODAL } from '../ns-modal/ns-modal.service';

@Component({
  selector: 'ns-lazy-table-settings',
  templateUrl: './ns-lazy-table-settings.component.html',
  styleUrls: ['./ns-lazy-table-settings.component.scss']
})
export class NsLazyTableSettingsComponent {
  form: FormGroup;


  reportList = [];
  componentId: string;

  constructor(
    private fb: FormBuilder,
    @Inject(DATA_MODAL) public data: any,
  ) {
    this.componentId = data?.componentId;
    this.form.patchValue({
      header: data?.fields
    });
    console.log({ data });
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      header: [[]],
      perPage: [10],
      headerFixed: [false],
      showIndicators: [false],
      allowAdjust: [false],
      fixedCols: [false],
      allowSearch: [false],
      allowSort: [false],
      allowSelection: [false]
    });
  }

  createReport() { }

  onSubmit() {
    console.log('Enviar el formulario!!');
  }
}

@NgModule({
  imports: [
    CommonModule,
    FormControlsModule,
    SharedModule
  ],
  declarations: [NsLazyTableSettingsComponent]
})
class NsLazyTableSettingsModule { }
