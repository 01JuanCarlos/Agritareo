// tslint:disable-next-line: max-line-length
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, forwardRef, HostBinding, Input, NgZone, OnInit, Output, EventEmitter, OnChanges, SimpleChanges, DoCheck } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Bool } from '@app/common/decorators';
import { ParseClassNames } from '@app/common/utils';
import { SerializeClassNames } from '@app/common/utils/serialize-classnames.util';
import { TranslateService } from '@ngx-translate/core';
import '@static/js/plugins/forms/styling/switch.min.js';
import Switchery from '@static/js/plugins/forms/styling/switchery.min.js';
import * as $ from 'jquery';

@Component({
  selector: 'ns-switch-control',
  templateUrl: './ns-switch-control.component.html',
  styleUrls: ['./ns-switch-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NsSwitchControlComponent),
      multi: true
    }
  ]
})
export class NsSwitchControlComponent implements OnInit, AfterViewInit, ControlValueAccessor, DoCheck {
  /** Establece las clases al elemento root del componente */
  @HostBinding('class') get switchRootClass() {
    return SerializeClassNames(this.__rootClass);
  }
  /** Tamaño del componente */
  @Input() size = 'sm';
  /** Color o tema de color del componente */
  @Input() color = 'success';

  // INFO: # ESTAS PROPIEDADES SON VALIDAS CUANDO isLabelOption es TRUE
  @Input() @Bool readonly: boolean;

  /** Color cuando está activo */
  @Input() onColor = 'success';
  /** Color cuando está inactivo */
  @Input() offColor = 'default';
  /** Texto cuando está activo */
  @Input() onText = 'SI';
  /** Texto cuando está inactivo */
  @Input() offText = 'NO';

  // ##
  /** Establece clases al elemento root del componente */
  @Input() rootClass: string;
  /** Realiza lo mismo que rootClass */
  @Input() class: string;
  /** Inidica si el control esta desactivado/activado */
  @Input() @Bool disabled: boolean;
  /** Indica si el control está encendido/apagado */
  @Input() checked: boolean;
  /** Cuando es FALSE el control elimina las etiquetas YES/NO y deja en su lugar un control circular */
  @Input() @Bool isLabelOption = true;

  @Output() change = new EventEmitter<boolean>();

  alreadyLoad: any;

  colors = {
    primary: '#2196F3',
    danger: '#EF5350',
    warning: '#FF7043',
    info: '#00BCD4',
    success: '#64BC63'
  };

  sizes = { sm: 'small', md: undefined, lg: 'large' };
  formControlName: string;
  checkboxElement: HTMLInputElement;

  public value = false;
  public propagateChange = (_: any) => { };

  constructor(
    private el: ElementRef,
    private translate: TranslateService,
    private zone: NgZone
  ) { }

  ngOnInit() {
    this.checkboxElement = this.el.nativeElement.querySelector('input[type="checkbox"]');
    if (undefined !== this.checked) {
      this.value = this.checked;
    }
    // Actualizar el texto del switch dependiendo el lenguaje elegido.
    this.translate.onLangChange.subscribe(lang => {
      $(this.checkboxElement).bootstrapSwitch('onText', lang.translations[this.onText] || this.onText);
      $(this.checkboxElement).bootstrapSwitch('offText', lang.translations[this.offText] || this.offText);
    });
  }

  ngDoCheck() {
    if (this.alreadyLoad) {
      $(this.alreadyLoad).bootstrapSwitch('disabled', this.disabled || this.readonly);
    }
  }

  ngAfterViewInit() {
    if (this.isLabelOption && $().bootstrapSwitch) {
      this.zone.runOutsideAngular(() => {
        [this.alreadyLoad] = $(this.checkboxElement).bootstrapSwitch({
          disabled: this.disabled || this.readonly,
          onSwitchChange: (e: any) => {
            this.toggleValue();
          }
        });
      });
    }

    if (!this.isLabelOption) {
      // tslint:disable-next-line: no-unused-expression
      new Switchery(this.checkboxElement, { color: this.colors[this.color] });
    }
  }

  toggleValue(event?: Event) {
    // Solo permite realizar cambios con la interación del usuario.
    if (event && !event.isTrusted) {
      // - Este fix permite que angular no detecte los eventos emitidos por dispatchEvent y evita la duplicidad.
      return;
    }

    this.value = !this.value;
    this.zone.run(() => {
      this.propagateChange(this.value);
    });
    this.change.emit(this.value);
  }

  get __controlClass() {
    return {
      ['form-check-input-switchery-' + this.color]: !this.isLabelOption && !!this.color,
      'form-check-input': this.isLabelOption,
      'form-check-input-switch': this.isLabelOption
    };
  }

  get __rootClass() {
    return {
      'form-check': true,
      'bootstrap-switch-disabled': this.readonly || this.disabled,
      'form-check-switchery': !this.isLabelOption,
      'form-check-switch': this.isLabelOption,
      'form-check-switch-left': this.isLabelOption,
      ...ParseClassNames(this.class),
      ...ParseClassNames(this.rootClass),
    };
  }

  // ControlValueAccessor implementation

  writeValue(isChecked: boolean): void {
    this.value = !!isChecked;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void { }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
