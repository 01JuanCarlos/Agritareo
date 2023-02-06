import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  DoCheck,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { FORMAT_PREVIEW_PATH } from '@app/common/constants';
import { MONTHS } from '@app/common/constants/months-options.const';
import { Bool, Id } from '@app/common/decorators';
import { THeaderColumn } from '@app/common/interfaces/theader-column.interface';
import { HideFloatingWindow, ShowFloatingWindow, UniqueID } from '@app/common/utils';
import { Brightness } from '@app/common/utils/brightness.util';
import { TABLE_TOOLBAR_ID } from '@app/config';
import { ToolAction } from '@app/config/toolbar-actions';
import { PermissionService } from '@app/services/auth-services/permission.service';
import { TableService, TableServiceManager } from '@app/services/component-services/table.service';
import { ToolBarService } from '@app/services/component-services/toolbar.service';
import { SweetAlertService } from '@app/services/util-services/sweet-alert.service';
import * as JSZip from '@static/js/plugins/tables/datatables/extensions/jszip/jszip.min.js';
import * as $ from 'jquery';
import 'datatables.net';
import 'datatables.net-buttons';
import 'datatables.net-buttons/js/buttons.flash.min.js';
import 'datatables.net-buttons/js/buttons.html5.min.js';
import 'datatables.net-buttons/js/buttons.print.min.js';
import 'datatables.net-select';
import { assign, debounce, forEach } from 'lodash-es';
import * as moment from 'moment';
import { ModalService } from '../ns-modal/ns-modal.service';

(window as any).JSZip = JSZip;
// DESACTIVAR ADVERTENCIAS DEL PLUGIN
$.fn.dataTable.ext.errMode = 'none';

export const MIN_COL_WIDTH = 80;

interface TableComponentParams { [param: string]: any; }
interface NsTableGroup {
  [param: string]: any;
  columns: (string | number)[];
}

@Component({
  selector: 'ns-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy, DoCheck {
  @ViewChild('tableTpl', { static: true }) tableRef: ElementRef;
  @ViewChild('contextMenuTpl', { static: true }) contextMenuRef: ElementRef;
  @ViewChild('columnOptions', { static: true }) columnOptionsRef: ElementRef;
  // @ViewChild('modal', { static: true }) modalRef: NsModalComponent;
  @HostBinding('attr.tabindex') get tabIndexTable() {
    return -1;
  }
  @ViewChild('tableSettings', { static: true, read: ViewContainerRef }) tableSettings: ViewContainerRef;
  /** ID dinamico de la tabla */
  @Input() @Id id: string;
  /** Identificador del componente en la base de datos */
  @Input() componentId: string;
  /** Identificador de metadata remota de la tabla ejm: DATOS_TABLA */
  @Input() procId: string;
  /** Parametros por defecto que se enviar al iniciar la data. */
  @Input() componentParams: TableComponentParams | (() => TableComponentParams) = {};
  /** Ruta del contenido remoto de la tabla ejm: GET: api/datostabla */
  @Input() path: string;
  /** Ruta del contenido remoto de la tabla ejm: GET: api/datostabla */
  @Input() controllerId: string;

  /**
   * La clave con cual se identifica cada registro de la tabla como único.
   * Si no se establece se usa "id" como identificador único de cada registro.
   */
  @Input() dataKey = 'id';
  /** Arreglo de datos que se muestran en la tabla */
  @Input() data: object[];
  /** Lista de campos de la cabecera */
  @Input() header: THeaderColumn[] = [];

  /** Habilitar paginación de la tabla */
  @Input() @Bool isPaging: boolean;
  /** Habilitar informacion de la tabla */
  @Input() @Bool showInformation: boolean;
  /** Cantidad de registros por página. */
  @Input() pageLength = 40;

  /** Fijar columna x iniciando desde la izquierda */
  @Input() staticLeftColumn: number;
  /** Fijar columna x iniciando desde la derecha */
  @Input() staticRightColumn: number;
  /** Tipo de selección: os, multi, single */
  @Input() selectType = 'os';

  @Input() scrollY = '400px';
  @Input() scrollX = true;

  /** Opciones adicionales para el menú de contexto. */
  @Input() contextMenu = [];
  @Input() @Bool showEditOption = true;
  @Input() @Bool showDeleteOption = true;
  @Input() @Bool showViewOption: boolean;

  /** Muestra los filtros avanzados en la tabla. */
  @Input() @Bool isFilterable: boolean;
  /** Muestra la lista de opciones de formato de descarga. */
  @Input() @Bool isExportable: boolean;

  /** Permite realizar modificaciones a un registro directamente desde la tabla. */
  @Input() @Bool isEditable: boolean;

  /** Habilitar el cuadro de buqueda en la tabla */
  @Input() @Bool isSearchable = false;

  @Input() @Bool ordering: boolean;
  @Input() @Bool disabled: boolean;
  @Input() @Bool readonly: boolean;

  /** Cargar la tabla al iniciar el componente. */
  @Input() @Bool autoload: boolean;
  /** La tabla es responsiva */
  @Input() @Bool isResponsive: boolean;
  /** Habilita la opción de seleccionar filas de la tabla */
  @Input() @Bool isSelectable: boolean;
  /** Se sobrea la fila al pasar el mouse */
  @Input() @Bool isHover = true;
  /** Se sobrea cada registro del a tabla. */
  @Input() @Bool isStriped = true;
  /** Los campos tienen bordes */
  @Input() @Bool isBordered = true;

  @Input() dblClickAction: 'VIEW' | 'EDIT' = 'VIEW';

  @Input() showToolbar: boolean;

  @Input() groups: NsTableGroup[] = [];

  /** Se emite al seleccionar un registro */
  @Output() dtSelect = new EventEmitter<object>();
  /** Se emite al deseleccionar un registro */
  @Output() dtDeSelect = new EventEmitter<object>();
  /** Se emite al presionar en el boton/menu editar un registro */
  @Output() dtEditRow = new EventEmitter<object>();
  /** Se emite al presionar en el boton/menu ver un registro */
  @Output() dtViewRow = new EventEmitter<object>();
  /** Se emite al presionar en el boton/menu add un registro */
  @Output() dtAddRow = new EventEmitter<object>();
  /** Se emite al presionar en el boton/menu del un registro */
  @Output() dtDelRow = new EventEmitter<object>();
  /** Se emite al actualizar un control de la fila de la pagina */
  @Output() dtEditField = new EventEmitter<{ id: string, field: string, value: boolean }>();

  @Output() dtLoading = new EventEmitter<boolean>();
  @Output() dtNextRow = new EventEmitter<number>();
  @Output() dtPrevRow = new EventEmitter<number>();

  /** Muestra tabla cargando */
  loading = false;
  /** Api de la tabla */
  apiTable: DataTables.Api;
  /** Filas seleccionadas */
  selected = null;

  tableErrorMessage: string;
  tableErrorType: string;

  private resizeCurCol: HTMLElement;
  private resizeNxtCol: HTMLElement;
  private resizePageX: number;
  private resizeCurColWidth: number;
  private resizeNxtColWidth: number;
  private currentColWidth = undefined;
  private nextColWidth = undefined;
  private nextColMax = 0;
  private resizeTimeout = null;

  filterBy = [
    { value: 0, label: 'Filtrar por periodo' },
    { value: 1, label: 'Filtrar por fecha' }
  ];

  months = MONTHS;

  years = [
    { value: 0, label: '2016' },
    { value: 0, label: '2017' },
    { value: 0, label: '2018' },
    { value: 0, label: '2019' },
    { value: 0, label: '2020' },
  ];

  public btnAddRowVisible: boolean;
  public btnEditRowVisible: boolean;
  public btnViewRowVisible: boolean;
  public btnDelRowVisible: boolean;

  public showHeaderOptions: boolean;
  public filterSelected: number;
  private tblElement: HTMLTableElement;

  private tableClientWidth = document.body.clientWidth;
  private tableClientHeight = document.body.clientHeight;

  public serviceManager: TableServiceManager;
  public colgroup: any[] = [];

  @Input() @Bool get showOptions() {
    return this.isRemote || this.showHeaderOptions;
  }

  set showOptions(value: boolean) {
    this.showHeaderOptions = value;
  }

  @HostListener('document:click', ['$event'])
  outsideClick(event: Event) {
    if (!this.contextMenuRef.nativeElement.contains(event.target)) {
      this.hideContextMenu();
    }

    if (!this.columnOptionsRef.nativeElement.contains(event.target)) {
      this.hideColumnFilter();
    }
  }

  @HostListener('window:resize', ['$event'])
  resizeTable(event: Event) {
    if (document.body.clientHeight !== this.tableClientHeight || document.body.clientWidth !== this.tableClientWidth) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.apiTable.columns.adjust().draw();
      }, 200);
    }
  }

  constructor(
    private cfr: ComponentFactoryResolver,
    private service: TableService,
    private zone: NgZone,
    private alert: SweetAlertService,
    private render: Renderer2,
    private permission: PermissionService,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef,
    private toolbar: ToolBarService,
    private modal: ModalService
  ) { }

  ngOnInit() {
    this.tblElement = this.tableRef.nativeElement;
    // TODO: VALIDAR SI LA CONFIGURACIÓN DE LA TABLA ES CORRECTA.
    if (this.isRemote) {
      this.serviceManager = this.service.registerComponent(this);
    }

    this.header = this.formatHeaderData(this.header);
    this.colgroup = this.parseColGroup(this.groups);

    this.btnAddRowVisible = !!this.dtAddRow.observers.length;
    this.btnEditRowVisible = !!this.dtEditRow.observers.length;
    this.btnViewRowVisible = !!this.dtViewRow.observers.length;
    this.btnDelRowVisible = !!this.dtDelRow.observers.length;

    this.showHeaderOptions = this.btnAddRowVisible || this.btnEditRowVisible || this.btnViewRowVisible || this.btnDelRowVisible;

    // this.tableErrorType = 'CONFIGURATION';
    // if (!this.dataKey) {
    //   this.tableErrorMessage = 'La propiedad dataKey no puede estar vacio.';
    //   return;
    // }

    // if (!this.header.some(h => h.data === this.dataKey)) {
    //   console.log({ dataKey: this.dataKey });
    //   this.tableErrorMessage = 'La propiedad dataKey no se encuentra en la cabecera.';
    //   return;
    // }

    // if (this.componentId) {
    //   this.db.insert('tables', {
    //     _id: this.componentId,
    //     user_id: 10,
    //     algo: 1
    //   }).subscribe({
    //     next: response => {
    //       console.log({ response });
    //     },
    //     error: err => { }
    //   });
    // }

    if (this.showToolbar) {
      const toolbar = this.toolbar.getSection(TABLE_TOOLBAR_ID);
      toolbar.use(ToolAction.NEW, this.onAddRow.bind(this), true);
      toolbar.use(ToolAction.EDIT, this.onEditSelectedRow.bind(this));
      // toolbar.use(ToolBarActions.DELETE, this.onDelSelectedRow.bind(this));
      // FIXME: LA TABLA NO SE ACTUALIZA LA PRIMERA VEZ.
      toolbar.use(ToolAction.PREVIEW, () => this.previewDocument());
      toolbar.use(ToolAction.UPDATE, this.reload.bind(this), true);
      toolbar.use(ToolAction.PRINT, () => this.onPrintRows());
      toolbar.use(ToolAction.DOWNLOAD, type => {
        switch (type) {
          case ToolAction.DOWNLOAD_PDF:
            this.exportTo('pdf');
            break;

          case ToolAction.DOWNLOAD_EXCEL:
            this.exportTo('excel');
            break;
        }
      });
      this.toolbar.on(TABLE_TOOLBAR_ID, ToolAction.SEARCH, (text) => {
        this.onSearch(text);
      });
    }

  }

  parseColGroup(groups: NsTableGroup[]) {
    const colgroup = [];

    const getGroup = (index: number, g: NsTableGroup[]) => {
      for (let i = 0; i < groups.length; i++) {
        const { columns, ...props } = groups[i];
        if (columns.includes(index)) {
          return { id: i, props };
        }
      }
    };

    for (const h of this.header) {
      const group = getGroup(h.index, groups);
      const prevCol = colgroup[colgroup.length - 1];

      if (colgroup.length && prevCol?.id === group?.id) {
        colgroup[colgroup.length - 1] = { ...prevCol, span: (prevCol?.span ?? 0) + 1 };
      } else {
        colgroup.push({ span: 1, ...group });
      }
    }

    if (void 0 === colgroup[colgroup.length - 1]?.id) {
      colgroup.pop();
    }

    return colgroup;
  }

  ngDoCheck() {
    this.toolbar.enable(TABLE_TOOLBAR_ID, ToolAction.EDIT, this.isRowSelected);
    // this.toolbar.enable(TABLE_TOOLBAR_ID, ToolAction.DELETE, this.isRowSelected);
    this.toolbar.enable(TABLE_TOOLBAR_ID, ToolAction.PRINT, this.hasPrivilege('FDOWNLOAD') && !!this.componentId);
    this.toolbar.enable(TABLE_TOOLBAR_ID, ToolAction.PREVIEW, true);
    this.toolbar.enable(TABLE_TOOLBAR_ID, ToolAction.SEARCH, true);
    this.toolbar.enable(TABLE_TOOLBAR_ID, ToolAction.DOWNLOAD, true);
  }

  ngOnDestroy() {
    this.service.destroyComponent(this.componentId);
    this.toolbar.delSection(TABLE_TOOLBAR_ID);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (void 0 !== changes.data) {
      const data: any[] = changes.data.currentValue;
      const prevvalue: any[] = changes.data.previousValue;

      if (prevvalue && data) {
        if (this.hasPluginInitialized) {
          $(`#${this.id}`).DataTable().destroy();
        }

        $(`#${this.id} tbody`).empty();

        // this.zone.runOutsideAngular(() => {
        this.initPluginTable();
        // });

        this.cdr.detectChanges();
      }
    }
  }

  get isRowSelected(): boolean {
    return !!this.selectedCount;
  }

  hasPrivilege(privilege: string) {
    return this.permission.hasPermission(this.componentId, privilege);
  }

  // get tableSettings() {
  //   return {
  //     header: this.header,
  //     perPage: [{ label: '10', value: 10 }]
  //   };
  // }

  private get hasPluginInitialized() {
    return ($.fn.DataTable as any).isDataTable(`#${this.id}`);
  }

  /**
   * Inicializa el plugin datatables
   */
  private initPluginTable() {
    if (this.hasPluginInitialized) {
      $(`#${this.id}`).DataTable().destroy();
    }

    const self = this;

    this.apiTable = $(`#${this.id}`)
      .on('xhr.dt', (e, settings, json, xhr) => {
        forEach((json || { data: [] }).data, row => {
          if (row && row.id === undefined) {
            row.id = row[this.dataKey] || UniqueID();
          }
        });
      })

      .on('processing.dt', (e, settings, processing) => {
        this.loading = processing;
        this.dtLoading.emit(processing);
      })

      .DataTable({
        ...this.dtPluginOptions,
        dom: `
          <'table-responsive'tr>
          <'card-footer d-flex page-footer-info justify-content-between align-items-center'
            <
              <'list-icons footer-tools'>
            >
            <i>
            <p>
          >
          <'download-buttons'B>`
      });
    // card-footer bg-white d-sm-flex justify-content-sm-between align-items-sm-center
    // datatable-scroll
    // this.apiTable.on('buttons-action', function(e, buttonApi, dataTable, node, config) {
    //   console.log('Button ' + buttonApi.text() + ' was activated');
    // });
    // (this.apiTable as any).button('2-1').trigger();

    if (this.isSelectable) {
      this.apiTable.on('select', (e: Event, ...args: [DataTables.Api, string, number[]]) => {
        this.selected = this.getSelected();
        this.cdr.detectChanges();
        if (this.isRemote && this.serviceManager) {
          this.serviceManager.selected = this.selected;
        }
        this.dtSelect.emit(this.selected);
      });

      this.apiTable.on('deselect', (e: Event, ...args: [DataTables.Api, string, number[]]) => {
        this.selected = null;
        this.cdr.detectChanges();
        if (this.isRemote && this.serviceManager) {
          this.serviceManager.selected = this.selected;
        }
        this.dtDeSelect.emit();
      });

      $(`#${this.id} tbody`).on('dblclick', 'tr', function () {
        if (self.getData().length) {
          self.selectRows(this);
          if (self.dblClickAction === 'EDIT') {
            self.onEditSelectedRow();
          } else {
            self.onViewSelectedRow();
          }
        }
      });
    }
    return this.apiTable;
  }

  trackByFn(index: number, it: any) {
    return index + it.id;
  }

  trackByHeaderFn(index: number, it: any) {
    return index + it.label;
  }

  onPrintRows() {
    this.service.printRows(this.componentId);
  }

  onAddRow() {
    this.dtAddRow.emit();
  }

  onEditSelectedRow(row?: any) {
    if (row || this.selectedCount > 0) {
      this.dtEditRow.emit(row || this.getSelected());
    }
  }

  onViewSelectedRow(row?: any) {
    if (this.selectedCount > 0) {
      this.dtViewRow.emit(this.getSelected());
    }
  }

  onDelSelectedRow() {
    this.deleteSelectedRows();
  }

  get showHeader() {
    return this.isSearchable || this.showOptions;
  }

  /**
   * Configura el formato de las propiedades de la cabecera.
   * @param header Cabecera de la tabla
   */
  formatHeaderData(header: THeaderColumn[]) {
    header = header || [];

    for (let i = 0, len = header.length; i < len; i++) {
      const h = header[i];
      h.field = h.data || h.field;
      h.data = h.field; // Datatable no reconoce field como nombre de propiedad
      h.index = i;
      h.visible = undefined === h.visible || h.visible;
      h.label = h.label || h.field;
      h.filter = h.filter;

      // TODO: Obtener más información cabecera desde la data....
      h.isBoolean = h.isBoolean || 'boolean' === h.type;
      h.isNumeric = h.isNumeric || 'number' === h.type;
      h.isString = h.isString || 'string' === h.type;
      h.isMixed = 'mixed' === h.type || (undefined === h.isMixed || h.isMixed);

      h.isBoolean && (h.type = h.type = 'boolean');
      h.isNumeric && (h.type = h.type = 'number');
      h.isString && (h.type = h.type = 'string');
      h.isDate && (h.type = h.type = 'date');
      h.isColored && (h.type = h.type = 'color');

      h.type = h.type || (h.badge ? 'badge' : 'mixed');
      h.className = `is-${h.type}`;

      h.textAlign && (h.className += ' text-' + h.textAlign);
      h.upper && (h.className += ' text-uppercase');
      h.lower && (h.className += ' text-lowercase');
      h.capitalize && (h.className += ' text-capitalize');

      if (h.isBoolean) {
        h.width = undefined === h.width ? 80 : h.width;
        h.render = (data: any, type: string, row: any, meta: any) => {
          return `<input class="dt__check" ${this.isEditable ? '' : 'disabled'} type="checkbox" ${!!data ? 'checked' : ''}>`;
        };
      }

      if (h.isColored) {
        h.width = undefined === h.width ? 80 : h.width;
        h.render = (data: string, type: string, row: any, meta: any) => {
          data = data || '#FFFFFF';
          data = data.length < 6 ? (data + data.slice(1)).substr(0, 7) : data;
          const cell = this.apiTable?.cell({ row: meta.row, column: meta.col }).node();
          if (cell) {
            this.render.setStyle(cell, 'backgroundColor', data);
          }
          return `<span style="color:${Brightness(data) === 'dark' ? '#fff' : '#333'} ">${data}</span>`;
        };
      }

      if (true === h.date || typeof h.date === 'string') {
        h.render = (data: string) => {
          return moment(data).format('string' === typeof h.date ? h.date : 'DD/MM/YYYY');
        };
      }

      if (true === h.badge || 'string' === typeof h.badge) {
        h.render = data => {
          return `<span class="badge badge-${'string' === typeof h.badge ? h.badge : 'light'}">${data}</span>`;
        };
      }

      // Habilitar ordenación en el campo.
      h.orderable = i === 0 || !!h.orderable || !!h.sort;
      // Activar la busqueda en el campo.
      h.searchable = !!h.searchable;
    }
    return header;
  }

  /**
   * Obtiene el Api del plugin datatables.
   */
  get Api() {
    return this.apiTable;
  }

  get HeaderSize() {
    return this.header.length || 1;
  }

  public get isRemote(): boolean {
    return !!(this.procId || this.componentId) && !this.data;
  }

  /**
   * Recarga el contenido de la tabla
   * @param fn callback
   * @param resetPaging regresa a la pagina número 1
   */
  reload(fn: () => void = null, resetPaging = false) {
    if (this.isRemote) {
      if (this.serviceManager && this.apiTable) {
        this.serviceManager.clearPage(this.apiTable.page.info().page);
      }
      this.apiTable?.ajax.reload(fn, resetPaging);
    }
  }

  /**
   * Obtiene las filas seleccionada
   */
  getSelected() {
    const [first, ...data] = this.selectedRows;
    return this.selectType === 'multi' ? [first, ...data] : first;
  }

  getData() {
    return [].slice.call(this.apiTable?.data() ?? []);
  }

  /**
   * Mostrar paginación
   */
  get showPaging() {
    return this.isRemote || this.isPaging;
  }

  /**
   * Ocultar le menú de contexto
   */
  hideContextMenu(): void {
    HideFloatingWindow(this.contextMenuRef.nativeElement);
  }

  getExportFilename() {
    const usplit = location.href.split('/');
    return `${usplit[usplit.length - 1]}_${new Date().toLocaleDateString().replace(/\//g, '')}`;
  }

  /**
   * Preparar la configuración del plugin Datatables
   */
  get dtPluginOptions() {
    // tslint:disable-next-line: variable-name
    const _this = this;
    const props: any = {
      responsive: this.isResponsive && !(this.staticLeftColumn || this.staticRightColumn),
      serverSide: this.isRemote,
      processing: true,
      scrollY: (this.tableClientHeight - 190) + 'px',
      scrollX: true,
      scrollCollapse: true,
      // paging: false,
      ordering: this.isRemote || this.ordering,
      bInfo: this.isRemote || this.showInformation,
      paging: this.showPaging,
      autoWidth: false,
      select: this.isSelectable ? this.selectType || 'single' : false,
      // rowId: this.dataKey,
      oLanguage: {
        sSearch: '',
        sLoadingRecords: '&nbsp;',
        sProcessing: 'Cargando...',
        sZeroRecords: 'No se encuentran resultados.',
        sInfoFiltered: '(Filtrado de _MAX_ entradas totales)',
        sInfo: 'Registros _START_ - _END_ de _TOTAL_',
        sInfoEmpty: 'Registros 0',
        select: {
          rows: {
            _: '<span class="badge badge-secondary mr-2">%d filas seleccionadas</span>',
            0: '',
            1: ''
          }
        },
        oPaginate: {
          sFirst: 'First',
          sLast: 'Last',
          sNext: $('html').attr('dir') === 'rtl' ? '<i class="icon-arrow-left12"></i>;' : '<i class="icon-arrow-right13"></i>',
          sPrevious: $('html').attr('dir') === 'rtl' ? '<i class="icon-arrow-right13"></i>' : '<i class="icon-arrow-left12"></i>'
        }
      },
      renderer: 'bootstrap',
      columns: this.header,
      buttons: [
        {
          extend: 'pdfHtml5',
          title: '',
          // orientation: 'landscape',
          filename: () => _this.getExportFilename(),
          customize: doc => {
            doc.defaultStyle.fontSize = 8;
            doc.styles.tableHeader.fontSize = 10;
            doc.styles.tableHeader.alignment = 'left';
            const columns = _this.header;
            const columnSizes = columns.map(col => {
              return `${col.isColored || col.isBoolean ? '10%' : '*'}`;
            });
            doc.content[0].table.widths = columnSizes;
          }
        },
        {
          extend: 'excelHtml5',
          title: '',
          filename: () => _this.getExportFilename()
        },
        // 'excel',
        'copy',
        'csv',
        // 'pdf',
        'print'
      ],
      drawCallback: () => {
        // TODO: Resetear con la pagina actuall...
        // this.currentAjaxPage = this.Api.page.info().page;

        $(`#${this.id} tbody tr`).on('contextmenu', function (event) {
          event.stopPropagation();
          _this.selectRows(this, true);
          ShowFloatingWindow(_this.contextMenuRef.nativeElement, event.pageX, event.pageY, {
            container: _this.elementRef.nativeElement
          });
          return false;
        });
      },
      // columnDefs: [{ visible: false }],
      initComplete: (settings, json: any) => {
        if (!($('.footer-tools a.tbl-settings').length)) {
          $(`<a href="#" class="list-icons-item tbl-settings"><i class="icon-cog"></i></a>`)
            .on('click', event => {
              event.preventDefault();
              _this.modal.open('ns-lazy-table-settings', {
                title: 'Configuración de la tabla',
                data: {
                  componentId: _this.componentId,
                  fields: _this.header
                }
              });
            })
            .prependTo('.footer-tools');
        }

        // Mostrar/Ocultar el footer cuando no e encuentran registros.
        const $footer = $(`#${this.id}_wrapper .page-footer-info`);
        if ($footer && $footer.length) {
          if (json && this.isRemote) {
            const fnVisibility = $footer[!json.recordsTotal && !json.data.length ? 'hide' : 'show'];
            if ('function' === typeof fnVisibility) {
              fnVisibility.call($footer);
            }
          }
          if (!$footer.children().length) {
            $footer.first().hide();
          }
        }
        // Mostrar y ocultar la paginación.
        if (json && json.data) {
          const $pagination = $(`#${this.id}_paginate`);
          if (Math.ceil(json.recordsFiltered / this.pageLength) <= 1) {
            $pagination.hide();
          } else {
            $pagination.show();
          }
        }

        // setTimeout(() => {
        //   const ps = new PerfectScrollbar('.dataTables_scrollBody', {
        //     wheelSpeed: 2,
        //     wheelPropagation: true
        //   });
        // }, 0);
        // $('.dataTables_scrollBody').perfectScrollbar();
        // $(window).on('resize', () => $('.dataTables_scrollBody').perfectScrollbar('update'));
        $(`#${this.id} input.dt__check`).on('click', (event) => {
          event.stopPropagation();

          const target = event.target as HTMLInputElement;
          const parent = $(target).parent('td');
          const cell = _this.apiTable.cell(parent);

          if (cell.data() !== target.checked) {
            const index = cell.index();
            const column = _this.header[index.column];
            const [data] = _this.apiTable.rows(index.row).data().toArray();
            if (data && column && column.data) {
              data[column.data] = !cell.data();
              _this.dtEditField.emit({ id: data.id, field: column.data, value: data[column.data] });
              // _this.apiTable.row(index.row).data(data).draw(true);
              // _this.service.UpdateFieldRow(_this.path, data.id, { [column.data]: !cell.data() }).subscribe(result => {
              //   _this.reload();
              // });
              // console.log(data);
            }
          }
        });


        // Recuperar el estado de la tabla.
        if (this.serviceManager) {
          // Recuperar el último o los ultimos seleccionados.
          if (this.serviceManager.selected) {
            const selected = this.serviceManager.selected;
            for (const row of (Array.isArray(selected) ? selected : [selected])) {
              this.apiTable?.row((i: number, data: any, node: HTMLElement) => {
                return row.id === data.id;
              }).select();
            }
          }
        }
      },
      order: [[0, 'asc']],
      createdRow: (row, data, index) => {
        if (data.enabled === false) {
          $(row).addClass('disabled');
        }
      }
    };

    if (this.isRemote && this.serviceManager) {
      props.iDisplayLength = this.pageLength,
        props.iDisplayStart = this.pageLength * this.serviceManager.currentPage;
    }

    if (this.isRemote && !this.data) {
      props.ajax = function LoadFromAjaxPath(data, callback, settings) {
        const order = (data.order || []).map(c => ({ column: data.columns[c.column].data, dir: c.dir }));
        _this.service
          .getRows(_this.componentId, data.start, data.length, data && data.search ? data.search.value : '', order, _this.componentParams)
          .then((result: any) => {
            callback({
              draw: data.draw,
              data: result.data,
              ...result.meta
            });
          }, err => {
            callback({
              draw: data.draw,
              data: [],
              recordsFiltered: 0,
              recordsTotal: 0
            });

            console.error(err);

            $('.dataTables_empty').addClass('text-danger').text('Ocurrio un error cargando la información de la data.');
          });
      };
    }

    if (!this.isRemote && this.data) {
      props.data = (this.data || []).map((row: any) => {
        if (row && undefined === row.id && this.dataKey) {
          row.id = row[this.dataKey];
        }
        return row;
      });
    }

    if (this.showPaging) {
      props.pageLength = this.pageLength;
    }

    if (!!this.staticLeftColumn || !!this.staticRightColumn) {
      props.fixedColumns = {
        leftColumns: this.staticLeftColumn || 0,
        rightColumns: this.staticRightColumn || 0
      };
    }

    // if (!!this.staticLeftColumn || !!this.staticRightColumn || this.scrollX || this.scrollY) {
    //   if (!this.showPaging) {
    //     props.scrollY = this.scrollY;
    //   }
    //   props.scrollX = this.scrollX;
    //   props.scrollCollapse = true;
    // }

    return props;
  }

  onSearch(value: string) {
    debounce(this.apiTable.search(value).draw, 200)();
  }

  deleteRow(it?: any) {
    it = it || this.getSelected();
    this.dtDelRow.emit(it);
  }

  ngAfterViewInit(): void {
    // Iniciar el plugin la tabla

    // this.zone.runOutsideAngular(() => {
    this.initPluginTable();
    // });

    const table = this.tblElement;
    const cols: NodeListOf<Element> = this.tblElement.querySelectorAll('thead > tr th');
    if (table && cols.length) {
      for (const th of Array.from(cols)) {
        const div = this.createDragElement(table.offsetHeight);
        th.appendChild(div);
        (th as HTMLElement).style.position = 'relative';
        this.addListenerDragElement(div);
      }
    }
  }

  onMouseMoveCol(e: MouseEvent) {
    if (this.resizeCurCol) {
      const diffX = e.pageX - this.resizePageX;
      if (!!this.resizeNxtCol) {
        this.nextColWidth = this.resizeNxtColWidth - diffX;
        if (this.currentColWidth <= MIN_COL_WIDTH) {
          if (this.currentColWidth !== undefined && 0 === this.nextColMax) {
            this.nextColMax = this.nextColWidth;
          }
          this.nextColWidth = this.nextColMax;
        }

        if (this.nextColWidth <= MIN_COL_WIDTH) {
          this.nextColWidth = MIN_COL_WIDTH;
        }

        this.resizeNxtCol.style.width = this.nextColWidth + 'px';
      }

      this.currentColWidth = this.resizeCurColWidth + diffX;

      if (this.currentColWidth <= MIN_COL_WIDTH) {
        this.currentColWidth = MIN_COL_WIDTH;
      }

      this.resizeCurCol.style.width = this.currentColWidth + 'px';
    }
  }

  onMouseUp(event: MouseEvent) {
    this.zone.run(() => {
      this.resizeCurCol = undefined;
      this.resizeNxtCol = undefined;
      this.resizePageX = undefined;
      this.resizeNxtColWidth = undefined;
      this.resizeCurColWidth = undefined;
      this.currentColWidth = undefined;
      this.nextColWidth = undefined;
      this.nextColMax = 0;
    });
    document.removeEventListener('mousemove', this.onMouseMoveCol);
  }

  addListenerDragElement(el: HTMLDivElement) {
    el.addEventListener('click', e => e.stopPropagation());
    el.addEventListener('mousedown', e => {
      this.resizeCurCol = (e.target as HTMLElement).parentElement;
      this.resizeNxtCol = this.resizeCurCol.nextElementSibling as HTMLElement;
      this.resizePageX = e.pageX;
      this.resizeCurColWidth = this.resizeCurCol.offsetWidth;
      // tslint:disable-next-line:no-unused-expression
      this.resizeNxtCol && (this.resizeNxtColWidth = this.resizeNxtCol.offsetWidth);
    });

    this.zone.runOutsideAngular(() => {
      document.addEventListener('mousemove', this.onMouseMoveCol.bind(this));
    });
  }

  createDragElement(height: number) {
    const div = document.createElement('div');
    div.style.top = '0';
    div.style.right = '0';
    div.style.width = '5px';
    div.style.position = 'absolute';
    div.style.cursor = 'col-resize';
    div.style.userSelect = 'none';
    /* table height */
    div.style.height = height + 'px';
    div.className = 'columnSelector';
    return div;
  }

  onSaveSettings(data: any) {
    console.log('Wardar configuración de la tabla. ', data);
    if (data && data.header) {
      for (const col of data.header) {
        const column = this.apiTable?.column(col.index);
        if (column?.visible() !== col.visible) {
          column.visible(col.visible);
        }
      }
    }
  }


  /**
   * Seleccionar campos de la tabla.
   * @param it Columna de la tabla
   * @param e MouseEvent
   */
  onToggleColumn(it: THeaderColumn, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const column = this.apiTable?.column(it.index);
    if (column) {
      assign(it, { visible: !it.visible });
      column.visible(!column.visible());
    }
    // this.apiTable.columns.adjust().draw();
  }


  //
  showTableSettings() {
    import('../ns-lazy-table-settings/ns-lazy-table-settings.component').then(({ NsLazyTableSettingsComponent }) => {
      const component = this.cfr.resolveComponentFactory(NsLazyTableSettingsComponent);
      const componentRef = this.tableSettings.createComponent(component);
      componentRef.changeDetectorRef.detectChanges();
    });
  }

  destroyTableSettings() {
    this.tableSettings.clear();
  }

  collapse(target: HTMLSpanElement) {
    const collapse = this.render.nextSibling(target);
    $(collapse).toggleClass('show');
    const icon = target.querySelector('i');

    this.render.removeClass(
      icon, $(collapse).hasClass('show') ? 'icon-arrow-right5' : 'icon-arrow-down5'
    );

    this.render.addClass(
      icon, $(collapse).hasClass('show') ? 'icon-arrow-down5' : 'icon-arrow-right5'
    );
  }

  exportTo(type: string) {
    const el = this.elementRef.nativeElement.querySelector(`.download-buttons button.buttons-${type}`);
    if (el && type) {
      el.click();
    }
  }

  deleteSelectedRows() {
    if (!this.selected) { return; }

    this.alert.confirmDelete(`No podrás recuperar ${Array.isArray(this.selected) ? 'estos registros' : 'este registro'}!`, '¿Estás seguro?', {
      callback: result => {
        if (result) {
          this.deleteRow(this.selected);
          this.selected = null;
        }
      }
    });
  }

  private get selectedCount(): number {
    return this.selectedIndexes.length;
  }

  private selectRows(selector: any, clearSelected = true) {
    if (clearSelected) {
      this.apiTable?.rows().deselect();
    }

    this.apiTable?.row(selector).select();
  }

  private get selectedIndexes(): number[] {
    return [].slice.call(this.apiTable?.rows({ selected: true }).indexes() ?? []);
  }

  private get selectedRows(): { [key: string]: any }[] {
    return [].slice.call(this.apiTable?.rows({ selected: true }).data() ?? []);
  }

  // @HostListener('keydown.delete')
  onKeyDelete() {
    this.deleteSelectedRows();
  }

  @HostListener('keydown.enter')
  onKeyEnter() {
    if (this.selectedCount > 0) {
      this.onViewSelectedRow();
    }
  }

  @HostListener('keydown.arrowup')
  onKeyUp() {
    if (this.selectedCount) {
      const minIndex = this.selectedIndexes.reduce((a, b) => a <= b ? a : b);
      if (minIndex > 0) {
        this.dtPrevRow.emit(minIndex - 1);
        this.selectRows(minIndex - 1);
      }
    }
    return false;
  }

  @HostListener('keydown.arrowdown')
  onKeyDown() {
    const maxIndex = this.selectedIndexes.reduce((a, b) => a >= b ? a : b, -1);
    if (-1 !== maxIndex && (maxIndex < this.pageLength - 1)) {
      this.dtNextRow.emit(maxIndex + 1);
      this.selectRows(maxIndex + 1);
    }
    return false;
  }

  showColumnFilter(event: MouseEvent) {
    const target = event.target as HTMLElement;
    let element = target;
    if (target.nodeName !== 'BUTTON') {
      element = target.parentElement;
    }

    const { top, left } = element.getBoundingClientRect();
    ShowFloatingWindow(this.columnOptionsRef.nativeElement, left, top, {
      container: this.tblElement
    });
  }

  hideColumnFilter() {
    HideFloatingWindow(this.columnOptionsRef.nativeElement);
  }

  applyFilters() {

  }

  previewDocument() {
    console.log('Acción de Previsualizar form');
    console.log(FORMAT_PREVIEW_PATH);
    // console.log('CID', this.document.componentId);
    // console.log('Orden', this.table.value);
    // console.log('Filtro', this.formGroupDirective.value);
  }

}
