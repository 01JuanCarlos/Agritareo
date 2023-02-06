import { Component, OnInit, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Bool, Id } from '@app/common/decorators';

@Component({
  selector: 'ns-textarea-control',
  templateUrl: './ns-textarea-control.component.html',
  styleUrls: ['./ns-textarea-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NsTextareaControlComponent),
      multi: true
    }
  ]
})
export class NsTextareaControlComponent implements OnInit, ControlValueAccessor {
  @Input() @Id id: string;
  @Input() @Bool readonly: boolean;
  @Input() formControlName: string;
  @Input() rows = '';
  @Input() cols = '';

  public disabled = false;
  public value = '';

  public propagateChange = (_: any) => { };
  public onTouched = (_: any) => { };


  constructor() { }

  ngOnInit(): void {
  }

  onChangeValue(text: string) {
    this.propagateChange(text);
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }


}
