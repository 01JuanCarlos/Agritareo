import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  Input,
  OnInit,
  Optional,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import { AbstractControl, ControlContainer, ControlValueAccessor, NG_VALUE_ACCESSOR, ValidationErrors } from '@angular/forms';
import { INPUT_VALIDATIONS } from '@app/common/constants/input-error.constants';
import { Bool, Id } from '@app/common/decorators';
import { ParseClassNames } from '@app/common/utils';
import { SerializeClassNames } from '@app/common/utils/serialize-classnames.util';
import '@static/js/plugins/forms/tags/tokenfield.min.js';
import * as $ from 'jquery';
import { NsAddonControlComponent } from '../ns-addon-control/ns-addon-control.component';

@Component({
  selector: 'ns-input-control',
  templateUrl: './ns-input-control.component.html',
  styleUrls: ['./ns-input-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NsInputControlComponent),
      multi: true
    },
    // {
    //   provide: NG_VALIDATORS,
    //   useExisting: NsInputControlComponent,
    //   multi: true
    // }
  ]
})
export class NsInputControlComponent implements OnInit, ControlValueAccessor, AfterViewInit {
  @ViewChild('input') inputRef: ElementRef;
  @Input() @Id id: string;
  @Input() size = 'sm';
  @Input() controlClass: string;
  @Input() @Bool disabled: boolean;
  @Input() @Bool readonly: boolean;
  @Input() name: string;
  @Input() placeholder: string;
  @Input() rootClass: string;
  @Input() class: string;
  @Input() showClear: boolean;
  @Input() tags: boolean;
  @Input() createTagOnBlur = true;
  @Input() tagsMinWidth = 70;
  @Input() tagsDelimiter = ',';
  @Input() required: boolean;

  @Input() min: number;
  @Input() max: number;
  @Input() step: number;
  @Input() maxlength: number;
  // @Input() mask: string;
  @Input() showMask: boolean;

  @Input() iconFeedbackLeft: string;
  @Input() iconFeedbackRight: string;

  // public isDateType: boolean;
  private inputType = 'text';

  @Input() get type() {
    return this.inputType;
  }

  set type(value: string) {
    this.inputType = value;
  }

  // public mask = {
  //   guide: true,
  //   showMask: true,
  //   mask: [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]
  // };

  public ADDON_PREPEND = 0;
  public ADDON_APPEND = 1;
  public element: HTMLElement;
  public addons = [[ /* Prepend */], [ /* Append */]];

  @Input() value = '';

  @Input() formControlName: string;

  @Output() inputText = new EventEmitter<string>();
  @Output() clear = new EventEmitter<any>();
  @Output() blur = new EventEmitter<any>();
  @Output() focus = new EventEmitter<any>();
  @Output() keyArrowDown = new EventEmitter<any>();
  @Output() keyArrowUp = new EventEmitter<any>();
  @Output() keyTab = new EventEmitter<any>();
  @Output() keyEnter = new EventEmitter<any>();

  // private control: AbstractControl;

  public propagateChange = (_: any) => { };
  public onTouched = (_: any) => { };

  @HostBinding('class') get inputRootclass() {
    return SerializeClassNames(this.__rootClass);
  }

  constructor(
    el: ElementRef,
    private render: Renderer2,
    @Optional() private controlContainer: ControlContainer
  ) {
    this.element = el.nativeElement;
  }

  ngOnInit() { }

  ngAfterViewInit() {
    if (undefined !== this.tags) {
      $(`#${this.id}`).tokenfield({
        trimValue: true,
        minWidth: this.tagsMinWidth,
        delimiter: this.tagsDelimiter,
        createTokensOnBlur: this.createTagOnBlur
      }).on('change', () => {
        this.onChangeValue($(`#${this.id}`).tokenfield('getTokensList'));
      });

      $(`#${this.id}-tokenfield`).on('blur', event => {
        this.blur.emit(event);
        this.onTouched(event);
      });
    }
  }

  get currentControl(): AbstractControl {
    return this.controlContainer ? this.controlContainer.control.get(this.formControlName) : null;
  }

  get hasError(): ValidationErrors {
    return this.currentControl ? this.currentControl.errors : null;
  }

  get touched(): boolean {
    return this.currentControl ? this.currentControl.touched : null;
  }

  get dirty(): boolean {
    return this.currentControl ? this.currentControl.dirty : null;
  }

  addAddon(addon: NsAddonControlComponent) {
    this.addons[+!!addon.append].push(addon);
  }

  clearInput() {
    this.value = '';
    this.clear.emit();
  }

  get _isFeedback() {
    return !!(this.iconFeedbackLeft || this.iconFeedbackRight);
  }

  get __controlClass() {
    return {
      ...ParseClassNames(this.controlClass),
      ['form-control-' + this.size]: this.size,
      'input-clear-btn': this.showClear,
      required: this.required
    };
  }

  get __rootClass() {
    return {
      'input-group': this.addons[this.ADDON_APPEND].length || this.addons[this.ADDON_PREPEND].length,
      ['input-group-' + this.size]: this.size,
      'form-group-feedback': this._isFeedback,
      ['form-group-feedback-' + (this.iconFeedbackRight ? 'right' : 'left')]: this._isFeedback,
      ...ParseClassNames(this.rootClass),
      ...ParseClassNames(this.class)
    };
  }

  get _feedBackContainerClass() {
    return {
      'form-control-feedback': this._isFeedback,
      ['form-control-feedback-' + this.size]: this._isFeedback
    };
  }

  // ControlValueAccessor
  onChangeValue(value: string) {
    this.value = value || '';
    this.inputText.emit(this.value);
    this.propagateChange(this.value);
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }


  get _getError() {
    const [error] = Object.keys(this.hasError);
    const errorMessage = INPUT_VALIDATIONS[error];
    const replace = Object.values(this.hasError[error]);
    const errorMessageT = errorMessage.replace(/\$/g, ',$');
    const toReplace = errorMessageT.split(',');
    return this.reemplazar(toReplace, replace);
  }

  reemplazar(arr: string[], replace: any[]): string {
    if (arr.length === 1) {
      const [first] = arr;
      return first;
    }
    let str = '';
    let index = 0;
    arr.forEach((it: string) => {
      if (it.startsWith('$')) {
        it = it.replace('$', replace[index]);
        index += 1;
      }
      str += it;
    });
    return str;
  }

}
