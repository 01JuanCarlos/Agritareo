import {
  Component,
  ComponentFactoryResolver,
  DoCheck,
  ElementRef,
  EventEmitter,
  forwardRef, HostListener, Input,
  OnChanges,
  OnInit,
  Output,
  Renderer2, SimpleChanges, ViewChild
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SUGGEST_API_PATH } from '@app/common/constants';
import { Id } from '@app/common/decorators';
import { UniqueID } from '@app/common/utils';
import { Highlight } from '@app/common/utils/dom';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { DataBaseService, FinderSchema } from '@app/services/util-services/database.service';
import { escapeRegExp } from 'lodash-es';
import { from, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NsModalComponent } from '../ns-modal/ns-modal.component';

export enum SearchBy {
  CODE,
  LABEL
}

@Component({
  selector: 'ns-finder',
  templateUrl: './ns-finder.component.html',
  styleUrls: ['./ns-finder.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NsFinderComponent),
      multi: true
    }
  ]
})
export class NsFinderComponent implements OnInit, DoCheck, ControlValueAccessor ,OnChanges {
  // @ViewChild('advanced', { static: true, read: ViewContainerRef }) advancedContainer: ViewContainerRef;
  //console.log('');
  @ViewChild('resultbox', { static: true }) resultBox: ElementRef;
  @ViewChild('labelInput', { static: true }) labelInput: ElementRef;
  @ViewChild('finder', { static: true }) finderBox: ElementRef;
  @ViewChild('modal', { static: true }) modal: NsModalComponent;

  @Input() @Id id: string;
  @Input() controllerId = '';
  @Input() componentId = '';
  @Input() searchCodeKey = 'code';
  @Input() searchLabelKey = 'label';
  @Input() items: any[];
  @Input() maxResults = 10;
  @Input() disabled: boolean;
  @Input() readonly: boolean;
  @Input() formControlName: string;
  @Input() showInputCode = true;
  @Input() correlated: NsFinderComponent;
  @Input() correlatedKey = 'id';
  @Input() correlatedForm: FormControl;
  @Input() filterBy: string;
  @Input() advancedSearch = true;
  @Input() codigo: string;
  @Input() descripcion: string;
  //@Input() idseleccionado: any;
  @Input() idseleccionado: string;



  @Output() selectedCode = new EventEmitter<string>();
  @Output() selectedLabel = new EventEmitter<string>();
  @Output() selected = new EventEmitter<{ id: string, description: string }>();

  private interval = null;
  private selectedItem = null;
  private searchText = '';

  public codeFocus = false;
  public labelFocus = false;
  public result = [];
  public loading = false;
  public resultsFound = false;
  public showResult = false;
  public selectedIndex = -1;
  public codeValue = '';
  public labelValue = '';
  public value = '';

  public propagateChange = (_: any) => { };
  public onTouched = (_: any) => { };

  constructor(
    private render: Renderer2,
    private http: AppHttpClientService,
    private db: DataBaseService,
    private cfr: ComponentFactoryResolver
  ) { }

  get fromRemote() {
    return !!this.controllerId || !!this.componentId;
  }

  ngOnInit() {
    this.fillResult(this.fromRemote ? [] : this.items);
    // TODO: chequear
    if (this.correlated) {
      this.setDisabledState(true);
      // console.log('desabilitado', this.disabled);
      this.correlated.selected.subscribe(item => {
        // console.log(item);
        this.disabled = undefined === item;
        this.filterBy = item[this.correlatedKey];
      });
    }
    if (this.correlatedForm !== undefined) {
      this.setDisabledState(true);
      this.correlatedForm.valueChanges.subscribe(it => {
        this.setDisabledState(!it);
        this.filterBy = String(it);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.selectedCode.emit(this.codigo);
    this.selectedLabel.emit(this.descripcion);
    //this.selected.emit(this.idseleccionado);
    this.propagateChange(this.idseleccionado);
    this.codeValue =  this.codigo;
    this.labelValue = this.descripcion;
  }

  ngDoCheck() {
    this.adjust();
  }

  fillResult(items = []) {
    this.result = items.slice(0, this.maxResults).map((it, i) => {
      if (undefined === it.id) {
        it.generatedId = true;
        it.id = UniqueID().slice(0, 8);
      }

      if (undefined === it.description && !it.generatedId) {
        it.description = it.code || it.id;
      }

      it.active = i === 0;
      return it;
    });
  }

  onSearchCode(text: string) {
    this.labelValue = '';
    this.onSearch(text, SearchBy.CODE);
  }

  onSearchLabel(text: string) {
    this.codeValue = '';
    this.onSearch(text, SearchBy.LABEL);
  }

  onInputCodeFocus() {
    this.codeFocus = !0;
    this.onFocus();
  }
  onInputCodeBlur() {
    this.codeFocus = !1;
    this.onBlur();
  }

  onInputLabelFocus() {
    this.labelFocus = !0;
    this.onFocus();
  }
  onInputLabelBlur() {
    this.labelFocus = !1;
    this.onBlur();
  }

  onFocus() {
    if (!this.fromRemote && this.result.length) {
      this.showResult = true;
    }
  }

  onBlur() {
    if (!this.fromRemote && this.result.length) {
      this.showResult = false;
    }
  }

  private HighlightSearch(text: string, property: string) {
    Highlight(this.resultBox.nativeElement.querySelectorAll('.' + property), text);
  }

  onSearch(text: string, type: SearchBy) {
    this.selectedItem = null;
    this.searchText = text;
    this.selectedIndex = -1;

    if (!(text.length > 0)) {
      this.codeValue = '';
      this.labelValue = '';
      return;
    }

    if (!this.fromRemote) {
      this.localSearch(text, type);
      return;
    }
    this.remoteSearch(text, type);
  }

  private localSearch(text: string, type: SearchBy) {
    const result = this.items.filter(it => new RegExp(escapeRegExp(text), 'gi').test(it[SearchBy.CODE === type ? this.searchCodeKey : this.searchLabelKey]));
    this.resultsFound = result.length > 0;
    this.fillResult(result);
    // TODO: La propiedad description crear un input....s
    this.HighlightSearch(text, SearchBy.CODE === type ? 'description' : this.searchLabelKey);

    if (this.resultsFound && text) {
      this.selectedIndex = 0;
      this.showResult = true;
    }
  }

  private remoteSearch(text: string, type: SearchBy) {
    this.HighlightSearch(text, SearchBy.CODE === type ? 'description' : this.searchLabelKey);

    if (this.controllerId || this.componentId) {
      this.loading = true;
      this.interval = setTimeout(() => {
        this.suggest(SearchBy.CODE === type ? '' : text, SearchBy.CODE === type ? text : '') // TODO: Añadir filtro.
          .pipe(finalize(() => {
            this.loading = false;
            this.HighlightSearch(text, SearchBy.CODE === type ? 'description' : this.searchLabelKey);
          }))
          .subscribe(data => {
            data = data || [];
            this.resultsFound = data.length > 0;
            this.fillResult(data);
            if (this.resultsFound && text) {
              this.selectedIndex = 0;
              this.showResult = true;
            }
          });
      }, 300);
    }
  }
  // Cache implementado para pruebas...
  private suggest(query: string, c = '', f = ''): Observable<FinderSchema[]> {
    const searchFn = async () => {
      // Contar coincidencias en el store local.
      // const dbQuery = { id: String(c), controller_id: this.controllerId };
      // const cacheCount = '' !== c ? await this.db.nsfinder.where(dbQuery).count() : 0;

      // if ('' !== c && !query && cacheCount > 0) {
      //   const data = await this.db.nsfinder.where(dbQuery).toArray();
      //   return data.map(it => it.data);
      // }

      const result = await this.http
        .get<FinderSchema[]>(SUGGEST_API_PATH, {
          id: this.controllerId,
          cid: this.componentId,
          l: this.maxResults,
          q: query,
          f: this.filterBy,
          c
        })
        .toPromise();

      // if (result?.length) {
      //   this.db.nsfinder
      //     .bulkPut(result.map(it => Object.assign({
      //       id: String(it.id),
      //       controller_id: this.controllerId,
      //       data: it
      //     })))
      //     .catch(err => console.log('Bulk error: ', err.message));
      // }

      return result;
    };
    return from(searchFn());
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }

  keyfn(index: number) {
    this.selectedIndex += index;
    if (this.selectedIndex < 0) {
      this.selectedIndex = 0;
    }

    if (this.selectedIndex > this.result.length - 1) {
      this.selectedIndex = this.result.length - 1;
    }
  }

  onSelect(it?: any) {

    if (this.result.length > 0) { //  && this.searchText

      if (this.selectedIndex === -1) {
        this.selectedIndex = 0;
      }
    
      if (undefined === it && this.selectedIndex >= 0) {
        it = this.result[this.selectedIndex];
      }

      if (it) {
        this.setSelected(it);

        if (this.codeFocus) {
          this.labelInput.nativeElement.focus();
        }
        this.showResult = false;
        this.propagateChange(it.id);
        
      }
    }
  }

  setSelected(it: any) {
    this.selectedItem = it;
    this.selectedIndex = -1;
    if (it && 'object' === typeof this.selectedItem) {
      this.codeValue = this.selectedItem[this.searchCodeKey];
      this.labelValue = this.selectedItem[this.searchLabelKey];
      this.selected.emit(this.selectedItem);
      this.selectedCode.emit(this.codeValue);
      this.selectedLabel.emit(this.labelValue);
    }
  }

  destroyAdvanced() {
    // this.advancedContainer?.clear();
  }

  @HostListener('keyup.f2')
  onAdvancedSearch() {
    console.warn('Acceso a búsqueda avanzada por configurar');
  }

  selectFinder(it) {
    // TODO: PODER COLOCAR OTROS VALORES
    this.modal.close();
    this.codeValue = it.label;
    this.labelValue = it.description;
    this.value = it.id;
  }

  adjust() {
    if (this.resultBox.nativeElement && this.finderBox.nativeElement) {
      const finderEl = this.finderBox.nativeElement;
      this.render.setStyle(this.resultBox.nativeElement, 'width', `${finderEl.clientWidth}px`);

      //   const box = this.resultBox.nativeElement.getBoundingClientRect();
      //   if (!this.resultFlipped && box.top + box.height > window.innerHeight && box.top > box.height) {
      //     this.flipToTop(box);
      //   }

      //   if (this.resultFlipped && window.innerHeight > (box.top + 2 + this.inputControl.element.offsetHeight) + box.height * 2) {
      //     this.flipToBottom(box);
      //   }
    }
  }

  writeValue(obj: any): void {
    if (!obj) {
      this.codeValue = '';
      this.labelValue = '';
      this.setSelected(null);
      return;
    }

    if ('string' === typeof obj && obj.indexOf('|') !== -1) {
      const [code, label] = obj.split('|');
      this.codeValue = code;
      this.labelValue = label;
      return;
    }

    if ('object' === typeof obj) {
      return;
    }

    if (!this.fromRemote && this.items.length) {
      const item = this.items.find(it => it[this.searchCodeKey] === obj || it[this.searchLabelKey] === obj);
      if (item) {
        this.setSelected(item);
      }
      return;
    }

    if (this.fromRemote) {
      this.suggest('', obj).subscribe(result => {
        if (result && result.length) {
          this.setSelected(result[0]);
        }
      });
      return;
    }
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
