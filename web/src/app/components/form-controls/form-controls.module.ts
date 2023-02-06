import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PopoverDirective } from '@app/directives/popover.directive';
import { TranslateModule } from '@ngx-translate/core';
import { NsAddonControlComponent } from './ns-addon-control/ns-addon-control.component';
import { NsGroupControlComponent } from './ns-group-control/ns-group-control.component';
import { NsInputControlComponent } from './ns-input-control/ns-input-control.component';
import { NsLabelControlComponent } from './ns-label-control/ns-label-control.component';
import { NsRadioControlComponent } from './ns-radio-control/ns-radio-control.component';
import { NsSelectControlComponent } from './ns-select-control/ns-select-control.component';
import { NsSwitchControlComponent } from './ns-switch-control/ns-switch-control.component';
import { NsSelectOptionComponent } from './ns-select-option/ns-select-option.component';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { UrlValidatorDirective } from '../../validators/url-validator.directive';
import { NumberValidatorDirective } from '../../validators/number-validator.directive';
import { NsTextareaControlComponent } from './ns-textarea-control/ns-textarea-control.component';
import { NsColorpickerControlComponent } from '../form-controls/ns-colorpicker-control/ns-colorpicker-control.component';
import { NsDateControlComponent } from './ns-date-control/ns-date-control.component';

export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  declarations: [
    PopoverDirective,
    NsSelectOptionComponent,
    NsSelectControlComponent,
    NsInputControlComponent,
    NsLabelControlComponent,
    NsGroupControlComponent,
    NsAddonControlComponent,
    NsSwitchControlComponent,
    NsRadioControlComponent,
    UrlValidatorDirective,
    NumberValidatorDirective,
    NsTextareaControlComponent,
    NsColorpickerControlComponent,
    NsDateControlComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    NgxMaskModule.forRoot(options),
  ],
  exports: [
    PopoverDirective,
    NsSelectOptionComponent,
    NsSelectControlComponent,
    NsInputControlComponent,
    NsLabelControlComponent,
    NsGroupControlComponent,
    NsAddonControlComponent,
    NsSwitchControlComponent,
    NsRadioControlComponent,
    NsTextareaControlComponent,
    UrlValidatorDirective,
    NumberValidatorDirective,
    NsColorpickerControlComponent,
    NsDateControlComponent,
  ]
})
export class FormControlsModule { }
