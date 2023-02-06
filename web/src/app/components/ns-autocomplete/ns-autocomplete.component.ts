import { Component, DoCheck, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormArray, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Id } from '@app/common/decorators';
import { UniqueID } from '@app/common/utils';
import { Highlight } from '@app/common/utils/dom';
import { escapeRegExp } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { NsInputControlComponent } from '../form-controls/ns-input-control/ns-input-control.component';
import { AutoCompleteService } from './ns-autocomplete.service';

export interface AutocompleteItem {
  id: string;
  label: string;
  badge?: string;
  icon?: string;
  description?: string;
}

/**
 * @deprecated Usar en su lugar ns-finder
 */

@Component({
  selector: 'ns-autocomplete',
  templateUrl: './ns-autocomplete.component.html',
  styleUrls: ['./ns-autocomplete.component.scss'],
  providers: [AutoCompleteService, {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NsAutocompleteComponent),
    multi: true
  }]
})

export class NsAutocompleteComponent implements OnInit, DoCheck, ControlValueAccessor {
  @ViewChild(NsInputControlComponent, { static: true })
  inputControl: NsInputControlComponent;

  @ViewChild('resultBox', { static: true })
  resultBox: ElementRef;

  @Input() @Id id: string;
  /** Lista de items */
  @Input() items: AutocompleteItem[] = [];
  /** Procedimiento desde donde obtener los items */
  @Input() data: string;
  /** Texto que se muestra en el input */
  @Input() value = '';
  /** Cantidad de resultados por busqueda */
  @Input() max = 10;
  /** Icono del input */
  @Input() searchIcon = 'icon-search4';
  /** Icono por defecto a cada item del resultado */
  @Input() itemIcon: string;
  /** No setear valor en el cuadro de busqueda cuando se selecciona un item */
  @Input() noSetValue: boolean;
  /** Desactivar el control */
  @Input() disabled: boolean;
  /** El control es solo lectura */
  @Input() readonly: boolean;
  /** Setear solo el valor cuando se selecciona un item. "valor" en lugar de "id | valor"  */
  @Input() setOnlyValue = false;
  /** Depende del estado y los valores del componente NsAutocompleteComponent */
  @Input() correlated: NsAutocompleteComponent;
  @Input() correlatedKey = 'id';
  /** Usar una función para establecer el valor del control al seleccionar. */
  @Input() setValueFn: () => string;

  @Input() formControlName: string;

  private resultFlipped = false;
  private isRemote = false;
  private selected = null;
  private interval = null;
  private filterBy: string;

  public result = [];
  public visibleResult = false;
  public limitExceeded = false;
  public noResultsFound: boolean;
  public mouseOnResult = false;
  public search = '';
  public loading: boolean;
  public itemsF: FormArray;
  public orderForm: FormGroup;


  @Output() selectItem = new EventEmitter<any>();
  @Output() itemValue = new EventEmitter<any>();

  public propagateChange = (_: any) => { };
  public onTouched = (_: any) => { };

  constructor(
    private render: Renderer2,
    private service: AutoCompleteService,
    private fb: FormBuilder) { }

  ngDoCheck() {
    this.adjust();
    this.highlightSearch(this.search);
  }

  ngOnInit() {
    // Campos para el formulario
   this.orderForm = this.fb.group({
    customerName: '',
    email: '',
    itemsF: this.fb.array([this.createItem()])
  });
    this.isRemote = !!this.data;
    this.setResult(this.isRemote ? [] : this.items);
    if (this.correlated) {
      this.setDisabledState(true);
      this.correlated.selectItem.subscribe(item => {
        this.disabled = undefined === item;
        this.filterBy = item[this.correlatedKey];
      });
    }
  }

  controls(name: string) {
    // return this.orderForm.get(name).controls
  }

  trackByFn(index: number, it: any) {
    return it.id;
  }

  itemActiveIndex() {
    return this.result.findIndex(it => it.active === true);
  }

  selectIndex(index: number) {
    this.result.forEach((it: any, i: number) => {
      it.active = index === i;
    });
  }

  onKeyArrowDown() {
    const index = this.itemActiveIndex();
    this.selectIndex(index >= this.result.length - 1 ? this.result.length - 1 : index + 1);
  }

  onKeyArrowUp() {
    const index = this.itemActiveIndex();
    this.selectIndex(index - 1 < 0 ? 0 : index - 1);
  }

  onSearchFocus() {
    if (!this.isRemote) {
      this.visibleResult = true;
    }
  }

  onSearchBlur(event: FocusEvent) {
    if (this.mouseOnResult) {
      event.stopPropagation();
    } else {
      this.visibleResult = false;
    }
  }

  // yes, problem with the cards
  onSelect(it: any) {
    this.selectValue(it);
  }
  /**
   * Seleccionar un item de la lista.
   * @param item Valor seleccionado
   */
  selectValue(item: any) {
    this.selected = item;
    this.selectItem.emit(item);
    if (!this.noSetValue) {
      this.value = this.setValueFn ? this.setValueFn.call(null, item) : `${this.setOnlyValue ? '' : item.id + ' | '}${item.label}`;
    }
    this.itemValue.emit(this.value);
    this.visibleResult = false;
    this.setResult([item]);
    this.propagateChange(item.id);
  }

  /**
   * Seleccionar al presionar la tecla ENTER
   */
  onKeyEnter() {
    const index = this.itemActiveIndex();
    if (-1 !== index) {
      this.selectValue(this.result[index]);
    }
  }

  /**
   * Buscar en la lista de items.
   * @param value Texto de busqueda
   */
  onSearch(value: string) {
    this.selected = null;
    this.search = value;
    this.visibleResult = true;

    if (!this.isRemote) {
      return this.localSearch(value);
    }
    this.loading = true;
    this.remoteSearch(value);
  }

  /**
   * Realiza la busqueda en un servicio remoto
   * @param text Texto para buscar
   */
  remoteSearch(text: string) {
    clearTimeout(this.interval);

    if (!this.data) {
      return;
    }

    this.interval = setTimeout(() => {
      this.service.search(this.data, text, this.max, this.filterBy)
        .pipe(finalize(() => {
          this.loading = false;
        }))
        .subscribe(result => {
          result = result || [];
          this.noResultsFound = !!(result && !result.length);
          this.setResult(result);
        });
    }, 300);
  }

  /**
   * Realiza una busqueda en los items locales.
   * @param text Texto para buscar
   */
  localSearch(text: string) {
    const result = this.items.filter(it => new RegExp(escapeRegExp(text), 'gi').test(it.label));
    this.noResultsFound = !!(result && !result.length);
    this.setResult(result);
  }

  /**
   * Establece los items del resultado de la busqueda.
   * @param items Items del resultado.
   */
  setResult(items = []) {
    // if (items.length > this.max) {
    //   this.limitExceeded = true;
    //   this.result = [];
    //   return;
    // }

    this.result = items.slice(0, this.max).map((it, i) => {
      if (!('id' in it)) {
        it.id = UniqueID().slice(0, 8);
      }
      if (!('description' in it)) {
        it.description = it.id;
      }
      it.active = i === 0;
      return it;
    });
  }

  /**
   * Pintar las coincidencias
   * @param text Busqueda para pintar
   */
  highlightSearch(text: string) {
    Highlight(this.resultBox.nativeElement.querySelectorAll('.title'), text);
  }

  /** Ajustar la caja de resultados */
  adjust() {
    if (this.resultBox.nativeElement && this.inputControl.element) {
      this.render.setStyle(this.resultBox.nativeElement, 'width', `${this.inputControl.element.clientWidth}px`);

      const box = this.resultBox.nativeElement.getBoundingClientRect();
      if (!this.resultFlipped && box.top + box.height > window.innerHeight && box.top > box.height) {
        this.flipToTop(box);
      }

      if (this.resultFlipped && window.innerHeight > (box.top + 2 + this.inputControl.element.offsetHeight) + box.height * 2) {
        this.flipToBottom(box);
      }
    }
  }

  /**
   * Voltear hacia arriba la caja de resultados
   * @param box Informacion de la caja de resultados.
   */
  flipToTop(box: DOMRect) {
    this.render.setStyle(this.resultBox.nativeElement, 'margin-top', `-${box.height + this.inputControl.element.offsetHeight + 2}px`);
    this.toggleFlipBox(box);
  }
  /**
   * Voltear hacia abajo la caja de resultados
   * @param box Informacion de la caja de resultados.
   */
  flipToBottom(box: DOMRect) {
    this.render.setStyle(this.resultBox.nativeElement, 'margin-top', `2px`);
    this.toggleFlipBox(box);
  }
  /**
   * Voltear la caja de resultados y ajustar el scroll e items
   * @param box Informacion de la caja de resultados.
   */
  toggleFlipBox(box: DOMRect) {
    const scrollTop = (box.height + 3) - this.resultBox.nativeElement.scrollTop;
    this.resultBox.nativeElement.scrollTop = scrollTop;
    this.resultFlipped = !this.resultFlipped;
    this.result = this.result.reverse();
    this.mouseOnResult = false;
  }

  createItem(): FormGroup {
    return this.fb.group({
      name: '',
      description: '',
      price: ''
    });
  }

  addFilter() {
    this.itemsF = this.orderForm.get('itemsF') as FormArray;
    this.itemsF.push(this.createItem());
  }

  // ControlValueAccessor
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
}
