import { Component, ContentChildren, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Bool } from '@app/common/decorators';
import { THeaderColumn } from '@app/common/interfaces';
import { UniqueID } from '@app/common/utils';
import { debounce } from 'lodash-es';
import * as moment from 'moment';
import { TableSimpleService } from './table-simple.service';

@Component({
  selector: 'ns-table-simple',
  templateUrl: './table-simple.component.html',
  styleUrls: ['./table-simple.component.scss'],
  providers: [
    TableSimpleService
  ]
})
export class TableSimpleComponent implements OnInit, OnChanges {
  @ContentChildren('headerContent') headerContent: QueryList<ElementRef>;

  /* Propiedad cabecera de la tabla */
  @Input() controller: any;
  @Input() controllerParams: any[];
  /* Propiedad cabecera de la tabla */
  @Input() header: THeaderColumn[];
  /* Propiedad de datos de la tabla */
  @Input() data: any = [];
  /* Propiedad para propios controles de la tabla */
  @Input() controls: any = [];

  @Input() @Bool multi: boolean;

  @Input() searchInput: FormControl;

  @Input() orderKey: string;

  @Output() tsEdit = new EventEmitter();
  @Output() tsDelete = new EventEmitter();
  @Output() tsSelect = new EventEmitter();
  @Output() tsDblClick = new EventEmitter();

  isEditEnable = false;
  isDeleteEnable = false;
  selectedIndex = [];
  selectedRows = [];

  tableLoading = false;

  meta: any;

  searchQuery: string;
  paramArray = [];

  constructor(
    public readonly service: TableSimpleService) {
    this.filterBy = debounce(this.filterBy, 250);
  }

  ngOnInit() {
    this.isEditEnable = this.tsEdit.observers.length > 0;
    this.isDeleteEnable = this.tsDelete.observers.length > 0;

    if (this.controller && !this.controllerParams) {
      this.searchBycontroller();
    }

    if (this.searchInput) {
      this.searchInput.valueChanges.subscribe(it => {
        this.filterBy(it);
      });
    }
  }

  filterBy(val: string) {
    this.searchQuery = val;
    this.searchBycontroller();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.paramArray = changes?.controllerParams?.currentValue;
    if (this.paramArray) {
      this.searchBycontroller();
    }
  }

  get tableData() {
    (this.data || []).forEach(element => element.uuid = UniqueID());
    if (this.orderKey) {
      return (this.data || []).sort((a, b) => a[this.orderKey] - b[this.orderKey])
    }
    return (this.data || []);
  }

  updatedParams(paramArray: any[]) {
    const paramObject = {};
    const required = this.checkRequiredParams(paramArray);
    if (required) {
      (paramArray || []).forEach(it => {
        paramObject[it.param] = it.value;
      });
    }
    return paramObject;
  }

  checkRequiredParams(array): boolean {
    let required = true;
    (array || []).forEach(it => {
      if (it.required === true && !it.value) {
        required = false;
      }
    });
    return required;
  }

  reaload() {
    this.searchBycontroller();
  }

  searchBycontroller() {
    this.tableLoading = true;
    const paramObject = this.updatedParams(this.paramArray);
    const params = { ...paramObject, search: this.searchQuery };
    this.service.controllerService(this.controller, params).subscribe(data => {
      this.data = data.data;
      this.meta = { ...data.meta, ...{ currentPage: this.service.currentPage } };
      this.tableLoading = false;
    });
  }

  onPageChange(page: number) {
    if (page !== this.service.currentPage) {
      this.service.setCurrentPage(page);
      this.searchBycontroller();
    }
  }

  trackByFn(index: number, it: any) {
    // return index + it?.id;
    return index;
  }

  parseData(header, data: string) {
    if (header.isDate && data) {
      // TODO: Revisar conversión de horas
      // return moment(new Date(data)).format('DD/MM/YYYY');
      return moment.utc(data).format('DD/MM/YYYY');
    }

    if (header.badge) {
      return data ? 'activo' : 'inactivo';
    }

    return data;
  }

  onDblClick(index: number, item: unknown): void {
    this.onSelectedRow(index, item);
    this.tsDblClick.emit({ index, item });
  }

  onSelectedRow(index: any, item: any) {

    if (this.multi) {
      const added = this.addOrRemove(this.selectedIndex, index);
      if (added) {
        this.selectedRows.push({ index, item });
      } else {
        this.selectedRows = this.selectedRows.filter(it => it.index !== index);
      }
      return this.tsSelect.emit(this.selectedRows.map(it => it.item));
    }

    const exists = this.selectedIndex.includes(index);

    if (exists) {
      this.selectedIndex = [];
      return this.tsSelect.emit();
    }

    this.selectedIndex = [index];
    this.tsSelect.emit(item);
  }

  addOrRemove(array: number[], value: number) {
    const index = array.indexOf(value);

    if (index === -1) {
      array.push(value);
      return true;
    } else {
      array.splice(index, 1);
      return false;
    }
  }
}
