import { AfterViewInit, Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Bool } from '@app/common/decorators';
import * as moment from 'moment';

@Component({
  selector: 'ns-date-control',
  templateUrl: './ns-date-control.component.html',
  styleUrls: ['./ns-date-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NsDateControlComponent),
      multi: true
    },
  ]
})
export class NsDateControlComponent implements OnInit, AfterViewInit {
  @ViewChild('input') inputRef: ElementRef;

  @Input() @Bool disabled: boolean;
  @Input() @Bool readonly: boolean;
  @Input() format = 'DD/MM/YYYY';

  @Output() dtChange = new EventEmitter();

  value: string;
  selectionStart: number;


  public propagateChange = (_: any) => { };
  public onTouched = (_: any) => { };

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() { }

  get mask() {
    return this.format.replace(/[a-zA-Z]/g, '0');
  }

  onInputFocus(event: any, right?: boolean) {
    const { target } = event;
    const indexes = [];
    if (!this.selectionStart) {
      this.selectionStart = target.selectionStart;
    }

    if (right !== undefined) {
      if (right) {
        target.selectionStart -= 2;
      } else {
        target.selectionStart += 3;
      }
    }

    const currentSelection = target.selectionStart;

    let startn = 0;
    let endn = target.value.length;

    target.value.split('').forEach((char: string, index: number) => {
      if (char === '/') {
        indexes.push(index);
      }
    });

    indexes.forEach((num, index) => {
      if (currentSelection >= num) {
        startn = num + 1;
        if (!indexes[index + 1]) {
          return;
        } else {
          if (currentSelection <= indexes[index + 1] && endn >= indexes[index + 1]) {
            endn = indexes[index + 1];
          }
        }
      } else {
        if (endn >= num) {
          endn = num;
        }
        return;
      }
    });

    setTimeout(() => target.setSelectionRange(startn, endn), 10);
  }

  onChangeValue(value: string) {
    let selectionStart = this.inputRef.nativeElement.selectionStart;
    this.value = value.substring(0, this.mask.length);
    this.inputRef.nativeElement.value = this.value;

    setTimeout(() => {
      const refValue = this.inputRef.nativeElement.value;
      if (refValue[selectionStart] === '/' || refValue.length === selectionStart + 1) {
        selectionStart += 1;
      }
      this.inputRef.nativeElement.setSelectionRange(selectionStart, selectionStart);
      if (refValue.length === this.mask.length) {
        const parsedDate = moment(refValue, this.format);
        if (parsedDate.isValid()) {
          this.dtChange.emit(parsedDate.format());
          return this.propagateChange(parsedDate.format());
          // return this.propagateChange(parsedDate.unix());
        }
      }
      this.propagateChange(refValue);
    }, 10);
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  writeValue(value: string): void {
    if (!value) {
      this.value = '';
      return;
    }
    if (value.length === 25 || value.length >= 19) {
      const conversionUTC = moment.utc(value);
      if (conversionUTC.isValid()) {
        this.value = conversionUTC.format(this.format);
        return;
      }
    }
    this.value = value;
  }
}
