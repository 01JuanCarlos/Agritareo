import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Self,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Id } from '@app/common/decorators';
import { DataGridColumn } from '@app/common/interfaces';
import { UniqueID } from '@app/common/utils';
import { SweetAlertService } from '@app/services/util-services/sweet-alert.service';
// import 'clusterize.js';
import { BehaviorSubject } from 'rxjs';
import Tabulator from 'tabulator-tables';


@Component({
  selector: 'ns-datagrid',
  template: ``,
  styleUrls: ['./ns-datagrid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NsDatagridComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() @Id id: string;
  @Input() header: DataGridColumn[] = [];
  @Input() data = [];
  @Input() rowIndexKey = 'id';
  @Input() layout = 'fitColumns';
  @Input() formEditor = true;
  @Input() disabled: boolean;
  @Input() editable = true;

  @HostBinding('attr.id') get _id() {
    return this.id;
  }

  @Output() cellEdited = new EventEmitter<any>();
  @Output() cellSelected = new EventEmitter<any>();
  @Output() rowSelected = new EventEmitter<any>();
  @Output() rowUpdated = new EventEmitter<any>();

  ///

  @Input() formControlName = '';
  @Input() autoload = true;

  public loading = new BehaviorSubject(true);
  tableHeader = [];
  tableApi = null;

  constructor(
    @Self() @Optional() private controlContainer: ControlContainer,
    private zone: NgZone,
    private elementRef: ElementRef,
    private alert: SweetAlertService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.tableHeader = this.header.filter(it => false !== it.visible).map(e => {
      const it: any = {
        title: e.label,
        field: e.field,
        editor: e.editable ?? this.editable
      };

      if (e.isBoolean) {
        it.hozAlign = 'center';
        it.formatter = 'tickCross';
        it.headerSort = false;
      }

      if (this.rowIndexKey === it.field && !it.editor) {
        it.formatter = (cell, formatterParams, onRendered) => {
          const { __isNew, ...data } = cell.getData() ?? {};
          return __isNew ? '??' : data[this.rowIndexKey];
        };
        it.editor = false;
      }

      return it;
    });

    if (this.controlContainer && !this.data.length) {
      this.data = this.controlContainer.control.value;
      this.controlContainer.valueChanges.subscribe(data => {
        data = data?.filter(it => !it?.__deleted);
        this.tableApi?.replaceData(data);
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.data) {
      if (Array.isArray(changes.data.previousValue)) {
        this.data = changes.data.currentValue;
        if (void 0 !== this.tableApi) {
          this.tableApi.replaceData(this.data);
          return;
        }
        // $("#sample_div").tabulator("destroy");
        this.initPlugin();
      }
    }
  }

  ngAfterViewInit() {
    this.initPlugin();
  }


  private initPlugin() {
    this.zone.runOutsideAngular(() => {
      this.tableApi = new Tabulator(this.elementRef.nativeElement, {
        columns: this.tableHeader,
        data: this.data ?? [],
        layout: this.layout,
        index: this.rowIndexKey, // Identficador unico de la data.
        placeholder: 'No se se han añadido elementos.',

        cellEdited: this.onCellEdited.bind(this),
        tabEndNewRow: this.onTabEnd.bind(this),
        rowDeleted: this.onDelRow.bind(this),

        rowClick: (e, row) => {
          this.rowSelected.emit(row.getData());
        },

        rowContextMenu: [
          {
            label: `<i class='fas fa-trash'></i> Delete Row`,
            action: (e, row) => {
              const { __isNew } = row?.getData() ?? {};

              if (__isNew) {
                return row.delete();
              }

              this.alert.confirmDelete('Remover Item', '¿Estás seguro?', {
                confirmButtonText: '¡Sí, remover!',
                confirmButtonClass: 'btn btn-warning',
                cancelButtonClass: 'btn btn-default',
                callback: (result: boolean) => {
                  result && row.delete();
                }
              });

            }
          }
        ],

      });
    });
  }

  onDelRow(row) {
    if (this.formEditor && this.controlContainer && row) {
      const ArrayControl = this.controlContainer.control as FormArray;
      const rowIndex = row.getIndex();
      let searchIndex = 0;

      for (const rowControl of ArrayControl.controls) {
        if (rowIndex === rowControl.value[this.rowIndexKey]) {
          if (rowControl.value?.__isNew) {
            ArrayControl.removeAt(searchIndex);
          } else {
            if (rowControl instanceof FormGroup) {
              const control = new FormControl(rowControl.get(this.rowIndexKey).value);
              control.markAsDirty();
              // TODO: El id se envia constantemente frente a una modificacion y/o eliminación
              rowControl.removeControl(this.rowIndexKey);
              rowControl.addControl(this.rowIndexKey, control);
              rowControl.addControl('__deleted', new FormControl(!0));
            }
          }
          break;
        }
        searchIndex++;
      }
    }
  }

  addRow(row?: any, append = true) {
    console.log('Añadir nueva fila');
    row = row ?? this.tableApi?.getRows()[0];
    const rowData = row?.getData() ?? {};

    if (void 0 === row) {
      // create properties
      this.header.reduce((a, h) => Object.assign(a, { [h.field]: null }), rowData);
    } else {
      // manual reset
      for (const k of Object.keys(rowData)) {
        rowData[k] = null;
      }
    }

    const { __deleted, __updated, ...data } = rowData ?? {};

    data[this.rowIndexKey] = UniqueID();
    data.__isNew = true;

    if (this.formEditor && this.controlContainer) {
      const ArrayControl = this.controlContainer.control as FormArray;
      const group = this.fb.group(data);
      group.markAsDirty();

      ArrayControl.insert(ArrayControl.length, group);
    }

    append && this.tableApi.addRow(data, false);

    return data;
  }

  selectedCell() {
    this.cellSelected.emit({ id: '', field: '', value: '' });
    // !!cell && this.cellEdited.emit({ id: cell.getRow().getIndex(), field: cell.getField(), value: cell.getValue() });
  }

  onTabEnd(prevRow) {
    return this.addRow(prevRow, false);
  }

  // TODO: Refactor...
  onCellEdited(cell: any) {
    if (this.formEditor && this.controlContainer && cell) {
      const ArrayControl = this.controlContainer.control as FormArray;
      const index = cell.getRow().getIndex();
      const { __isNew } = cell.getData() ?? {};

      for (const row of ArrayControl.controls) {
        if (index === row.value[this.rowIndexKey]) {
          if (row instanceof FormGroup) {
            const control = new FormControl(cell.getValue());
            control.markAsDirty();
            row.removeControl(cell.getField());
            row.addControl(cell.getField(), control);

            // TODO: El id se envia constantemente frente a una modificacion y/o eliminación
            const idControl = new FormControl(row.get(this.rowIndexKey).value);

            if (void 0 === __isNew) {
              idControl.markAsDirty();
              row.removeControl(this.rowIndexKey);
              row.addControl(this.rowIndexKey, idControl);
            }
          }
          break;
        }
      }
    }

    !!cell && this.rowUpdated.emit({ id: cell.getRow().getIndex(), data: cell.getData() });
    !!cell && this.cellEdited.emit({ id: cell.getRow().getIndex(), field: cell.getField(), value: cell.getValue() });
  }

  updateCell(id: unknown, field: string, value: any) {
    this.tableApi.updateData([{ id, [field]: value }]);
  }

  ngOnDestroy() {
    // console.log({ destroy: 1 })
  }

}
