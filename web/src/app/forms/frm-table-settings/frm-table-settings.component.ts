import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { REPORT_DESIGNER_PATH } from '@app/common/constants';

export interface ReportParameter {
  id: number;
  name: string;
  type: string;
  arrayItemType?: string;
  eval?: boolean;
  nullable?: boolean;
  pattern?: string;
  expression?: string;
  showOnlyNameType?: boolean;
  testData?: string;
}

@Component({
  selector: 'frm-table-settings',
  templateUrl: './frm-table-settings.component.html',
  styleUrls: ['./frm-table-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrmTableSettingsComponent implements OnInit {
  @Input() id = '';
  @Input() tableHeader: [];
  form: FormGroup;
  reportFormat = {
    docElements: [],
    parameters: [
      {
        id: 1,
        name: 'page_count',
        type: 'number',
        arrayItemType: 'string',
        eval: false,
        nullable: false,
        pattern: '',
        expression: '',
        showOnlyNameType: true,
        testData: ''
      },
      {
        id: 2,
        name: 'page_number',
        type: 'number',
        arrayItemType: 'string',
        eval: false,
        nullable: false,
        pattern: '',
        expression: '',
        showOnlyNameType: true,
        testData: ''
      }
    ],
    styles: [],
    version: 2,
    documentProperties: {
      pageFormat: 'A4',
      pageWidth: '',
      pageHeight: '',
      unit: 'mm',
      orientation: 'portrait',
      contentHeight: '',
      marginLeft: '20',
      marginTop: '20',
      marginRight: '20',
      marginBottom: '10',
      header: true,
      headerSize: '60',
      headerDisplay: 'always',
      footer: true,
      footerSize: '60',
      footerDisplay: 'always',
      patternLocale: 'en',
      patternCurrencySymbol: 'S/.'
    }
  };

  reportList = [];

  componentId: string;


  constructor(
    private fb: FormBuilder,
    // @Inject(MODAL_REF) private modalRef: ModalRef
  ) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      header: [[]],
      perPage: [10],
      headerFixed: [false],
      showIndicators: [false],
      allowAdjust: [false],
      fixedCols: [false],
      allowSearch: [false],
      allowSort: [false],
      allowSelection: [false]
    });
    // console.log(this.modalRef)
    // TODO: No se puede obtener el id de la tabla.
    // this.service.getPrintFormats(this.id).subscribe(data => this.reportList = data);
  }

  createReport() {
    this.tableHeader.forEach((element: { label: '', type: '' }, idx) => {
      this.reportFormat.parameters.push({
        id: idx + 3,
        name: element.label,
        type: element.type.toString() === 'mixed' ? 'string' : element.type,
        eval: false,
        showOnlyNameType: false,
        arrayItemType: 'string',
        nullable: true,
        pattern: '',
        expression: '',
        testData: ''
      });
    });
    // this.printformat.addPrintFormat(this.id, this.reportFormat).subscribe(idReporte => {
    //   if (!!idReporte) {
    //     window.open(REPORT_DESIGNER_PATH + '/' + idReporte.id, '_blank');
    //   }
    // });
    // window.open('/report-designer/nuevo', '_blank');
    // this.router.navigate(['/report-designer/nuevo']);
  }

  onSubmit() {
    console.log('Enviar el formulario!!');
  }
}
