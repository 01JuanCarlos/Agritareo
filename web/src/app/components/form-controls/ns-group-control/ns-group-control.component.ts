import { AfterViewInit, Component, ContentChild, ElementRef, HostBinding, Input, OnInit } from '@angular/core';
import { Bool, Id } from '@app/common/decorators';
import { GetSecureProperty, ParseClassNames, SetSecureProperty } from '@app/common/utils';
import { SerializeClassNames } from '@app/common/utils/serialize-classnames.util';
import { NsAutocompleteComponent } from '@app/components/ns-autocomplete/ns-autocomplete.component';
import { NsFinderComponent } from '@app/components/ns-finder/ns-finder.component';
import { NsColorpickerControlComponent } from '../ns-colorpicker-control/ns-colorpicker-control.component';
import { NsDateControlComponent } from '../ns-date-control/ns-date-control.component';
import { NsInputControlComponent } from '../ns-input-control/ns-input-control.component';
import { NsLabelControlComponent } from '../ns-label-control/ns-label-control.component';
import { NsRadioControlComponent } from '../ns-radio-control/ns-radio-control.component';
import { NsSelectControlComponent } from '../ns-select-control/ns-select-control.component';
import { NsSwitchControlComponent } from '../ns-switch-control/ns-switch-control.component';
import { NsTextareaControlComponent } from '../ns-textarea-control/ns-textarea-control.component';
@Component({
  selector: 'ns-group-control',
  templateUrl: './ns-group-control.component.html'
})
export class NsGroupControlComponent implements OnInit, AfterViewInit {
  @HostBinding('class') get formGroupClass(): string {
    return SerializeClassNames(this.__rootClass);
  }
  @Input() @Id id: string;
  @Input() @Bool inline: boolean;
  @Input() @Bool required: boolean;
  @Input() size = 'sm';
  @Input() class: string;
  @Input() controlName: string;

  @ContentChild(NsLabelControlComponent, { static: true }) labelControl: NsLabelControlComponent;
  @ContentChild(NsInputControlComponent, { static: true }) inputControl: NsInputControlComponent;
  // tslint:disable-next-line: deprecation
  @ContentChild(NsAutocompleteComponent, { static: true }) autoCompleteControl: NsAutocompleteComponent;
  @ContentChild(NsSelectControlComponent, { static: true }) selectControl: NsSelectControlComponent;
  @ContentChild(NsRadioControlComponent, { static: true }) radioControl: NsRadioControlComponent;
  @ContentChild(NsFinderComponent, { static: true }) finderControl: NsFinderComponent;
  @ContentChild(NsTextareaControlComponent, { static: true }) textareaControl: NsTextareaControlComponent;
  @ContentChild(NsSwitchControlComponent, { static: true }) switchControl: NsSwitchControlComponent;
  @ContentChild(NsColorpickerControlComponent, { static: true }) colorPicker: NsColorpickerControlComponent;
  @ContentChild(NsDateControlComponent, { static: true }) dateControl: NsColorpickerControlComponent;

  constructor(private el: ElementRef) { }

  public get label() {
    return this.labelControl;
  }

  public get input() {
    return this.inputControl
      || this.selectControl || this.finderControl
      || this.switchControl || this.autoCompleteControl
      || this.radioControl || this.textareaControl
      || this.colorPicker || this.dateControl;
  }

  public setValue(val: any): void {
    // console.log({ input: this.input });
    this.input.writeValue(val);
  }

  ngOnInit() {
    let controlId = '';

    const inputControl = this.input;
    if (inputControl) {
      controlId = GetSecureProperty(inputControl, 'id');
    }

    if (this.labelControl) {
      this.labelControl.size = this.size;
      this.labelControl.inline = this.inline;
      this.labelControl.for = controlId;
      this.labelControl.required = this.required;
    }

    SetSecureProperty(inputControl, 'size', this.size);
    SetSecureProperty(inputControl, 'required', this.required);
    // SetSecureProperty(this.radioControl, 'inline', this.inline);
  }

  get parentHasRowClass() {
    const parent: HTMLElement = this.el.nativeElement.parentElement;
    return parent.classList.contains('row');
  }

  ngAfterViewInit() {
  }

  get __rootClass() {
    return {
      'form-group': true,
      ['form-group-' + this.size]: !!this.size,
      // 'form-inline': this.inline,
      row: !this.parentHasRowClass && this.inline,
      ...ParseClassNames(this.class),
      'mb-1': true,
    };
  }

}
