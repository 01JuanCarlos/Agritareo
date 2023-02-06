import { Component, forwardRef, HostBinding, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Bool, Id } from '@app/common/decorators';
import { ParseClassNames } from '@app/common/utils';
import { SerializeClassNames } from '@app/common/utils/serialize-classnames.util';

@Component({
  selector: 'ns-radio-control',
  templateUrl: './ns-radio-control.component.html',
  styleUrls: ['./ns-radio-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NsRadioControlComponent),
      multi: true
    }
  ]
})
export class NsRadioControlComponent implements OnInit, ControlValueAccessor {
  @HostBinding('class') get radioRootClass() {
    return SerializeClassNames(this.__rootClass);
  }
  @Input() size = 'sm';
  @Input() controlClass: string;
  @Input() class: string;
  @Input() @Bool disabled: boolean;
  @Input() @Bool inline: boolean;
  @Input() @Bool checked: boolean;
  @Input() value: any;
  @Input() isRight: boolean;
  @Input() @Id id: string;
  @Input() @Bool readonly: boolean;

  @Input() formControlName: string;

  public propagateChange = (_: any) => { };

  // TODO: En proceso!!
  constructor() { }

  ngOnInit() {
  }

  get __rootClass() {
    return {
      'form-check': !0,
      'form-check-right': this.isRight,
      'form-check-inline': this.inline,
      disabled: this.disabled,
      ...ParseClassNames(this.class)
    };
  }

  // ControlValueAccessor

  writeValue(value: any): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }
  registerOnTouched(fn: any): void { }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
