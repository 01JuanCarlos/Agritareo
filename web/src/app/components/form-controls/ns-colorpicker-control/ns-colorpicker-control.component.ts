import { Component, ElementRef, forwardRef, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { debounce, trim } from 'lodash-es';

@Component({
  selector: 'ns-colorpicker-control',
  templateUrl: './ns-colorpicker-control.component.html',
  styleUrls: ['./ns-colorpicker-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NsColorpickerControlComponent),
      multi: true
    }
  ]
})
export class NsColorpickerControlComponent implements OnInit, ControlValueAccessor {
  constructor(private zone: NgZone) {
    this.emitValue = debounce(this.emitValue, 100);
  }

  @ViewChild('inputPicker', { static: true }) inputPicker: ElementRef;
  @ViewChild('inputText', { static: true }) inputText: ElementRef;

  @Input() disabledText = false;
  @Input() defaultColor = '#000000';

  value: string = this.defaultColor;

  public propagateChange = (_: any) => { };
  public onTouched = (_: any) => { };

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.inputPicker.nativeElement.addEventListener('input', (event) => {
        this.onChangeValue(event.target.value);
      });

      this.inputText.nativeElement.addEventListener('input', (event) => {
        this.onChangeValue(event.target.value);
      });

      this.inputText.nativeElement.addEventListener('focusout', (event) => {
        this.onChangeValue(this.isValidColor(event.target.value));
      });
    });
  }

  onChangeValue(value: string) {
    const rawValue = !value?.startsWith('#') ? '#' + value : value;
    this.value = rawValue;

    this.updateControls(rawValue);
    this.emitValue();
  }

  updateControls(value: string) {
    this.inputText.nativeElement.value = value;
    this.inputPicker.nativeElement.value = this.isValidColor(value);
  }

  emitValue() {
    this.propagateChange(this.value);
  }

  isValidColor(colorString: string) {
    return trim(colorString)?.match(/^#[a-f0-9]{6}$/i) !== null ? colorString : this.defaultColor;
  }

  writeValue(value: string): void {
    this.value = this.isValidColor(value);
    this.updateControls(this.value);
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
