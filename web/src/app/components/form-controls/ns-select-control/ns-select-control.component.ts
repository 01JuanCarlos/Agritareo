import { ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Bool, Id } from '@app/common/decorators';
import { ParseClassNames } from '@app/common/utils';

@Component({
  selector: 'ns-select-control',
  templateUrl: './ns-select-control.component.html',
  styleUrls: ['./ns-select-control.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NsSelectControlComponent),
      multi: true
    }
  ]
})
export class NsSelectControlComponent implements ControlValueAccessor, OnChanges {
  /** ID autogenerado de control del componente */
  @Input() @Id id: string;

  /** Arreglo de los items del componente */
  @Input() items: any[] = [];

  /** Cambia el estado del componente */
  @Input() @Bool disabled: boolean;
  @Input() @Bool readonly: boolean;

  /** Convierte el control de tipo multiple */
  @Input() @Bool isMultiple: boolean;

  /** Establece si el valor del control es requerido */
  @Input() @Bool required: boolean;

  /** Tamaño css del input */
  @Input() size = 'sm';

  /** Listado de clases del componente, separado por espacios */
  @Input() controlClass: string;

  /** Nombre del componente */
  @Input() name: string;

  /** La clave principal del control */
  @Input() dataKey = 'id';

  /** La clave principal de los hijos de la data */
  @Input() childrenKey = 'children';

  /** Se muestra cuando no hay elementos seleccionados */
  @Input() placeholder = 'Seleccione una opción';

  /** Mostrar la opcion por defecto de la lista */
  @Input() showDefaultOption = true;

  /** Se establece cuando el componente está incrustado en un formulario. */
  @Input() formControlName: string;

  /** Se emiten cuando se ha seleccionado una opción en el control */
  @Output() select = new EventEmitter(); // Emite un objeto compuesto por indice, valor, data original, etc.

  /** Se emite cuando el valor ha cambiado */
  @Output() change = new EventEmitter();

  // Eventos adicionales para obtener valores especificos. // FIXME: Se pueden obtener desde el evento "select"
  @Output() selectValue = new EventEmitter(); // Emite solo el valor selecionado.
  @Output() selectLabel = new EventEmitter(); // Emite el label del valor seleccionado.
  @Output() selectIndex = new EventEmitter(); // Emite el index del valor seleccionado.

  /** Valor seleccionado del componente */
  @Input() value = '';

  private addOptionTimeout = null;
  public options = [];

  propagateChange = (_: any) => { };
  private onTouched = (_: any) => { };

  constructor(private cdr: ChangeDetectorRef) { }

  addOption(option: any) {
    clearTimeout(this.addOptionTimeout);

    this.options.push(this.parseOption(option));

    this.addOptionTimeout = setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (void 0 !== changes.items?.currentValue) {
      this.options = this.getSelectOptions(changes.items.currentValue ?? []);
    }
  }

  private parseOption(item) {
    const value = item?.value ?? item?.[this.dataKey];
    const label = item?.label || (item?.title || item?.description || item?.name); // propiedades para datos directos
    const parsed = true === item?.selectOption ? {} : item;
    return {
      ...parsed,
      id: item.id ?? item[this.dataKey],
      label,
      value,
      selected: this.value === value || item.selected ? 'selected' : void 0,
      isParent: this.hasChildren(item),
      children: this.getSelectOptions(item[this.childrenKey] ?? [])
    };
  }

  private getSelectOptions(items?: any[]) {
    return items.map(this.parseOption.bind(this));
  }

  trackByFn(index: number, item: any) {
    return `${index}::${item.value || item.label}`;
  }

  hasChildren(item: any): boolean {
    return !!(Array.isArray(item?.[this.childrenKey]) && item[this.childrenKey].length);
  }

  onChangeOption(target: HTMLSelectElement) {
    const index = target.selectedIndex - (+!!this.showDefaultOption);
    const option = this.getValueFromIndex(index);

    // this.value = option.value;

    // Control Value Accesor
    this.propagateChange(target.value);

    // Eventos
    this.select.emit({
      id: option.id,
      label: option.label,
      value: option.value,
      index,
      data: option,
      parentId: option.parentId
    });

    this.selectIndex.emit(index);
    this.selectLabel.emit(option.label);
    this.selectValue.emit(option.value);
  }

  getValueFromIndex(index: number) {
    for (let i = 0, ci = 0, len = this.options.length; i < len; i++) {
      if (index === ci && !this.hasChildren(this.options[i])) {
        return { parentId: null, ...this.options[i] };
      }

      if (this.hasChildren(this.options[i]) && (index <= (this.options[i].children.length - 1) + ci)) {
        return { parentId: this.options[i].id, ...this.options[i].children[index - ci] };
      }
      ci += this.hasChildren(this.options[i]) ? this.options[i].children.length : 1;
    }
  }

  get __controlClass() {
    return {
      ['form-control-' + this.size]: !!this.size,
      ...ParseClassNames(this.controlClass)
    };
  }

  // ControlValueAccessor implementation

  writeValue(value: string): void {
    this.value = value || '';

    if (this.options.length) {
      this.options = this.options.map(it => {
        return {
          ...it,
          selected: this.value === it.value ? 'selected' : void 0,
        };
      });
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

}
