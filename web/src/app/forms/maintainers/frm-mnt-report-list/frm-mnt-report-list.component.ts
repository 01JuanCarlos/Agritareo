import { Component, Injector, OnInit } from '@angular/core';
import { FormGroupDirective, Validators } from '@angular/forms';
import { AbstractFormGroup } from '@app/common/classes/abstract-form-group.class';
import { FrmMntReportListService } from './frm-mnt-report-list.service';

@Component({
  selector: 'frm-mnt-report-list',
  templateUrl: './frm-mnt-report-list.component.html',
  styleUrls: ['./frm-mnt-report-list.component.scss'],
  providers: [
    FormGroupDirective,
    { provide: AbstractFormGroup, useExisting: FrmMntReportListComponent }
  ]
})
export class FrmMntReportListComponent extends AbstractFormGroup implements OnInit {
  titleOnCreate = 'Guardar';
  titleOnEdit = 'Editar';
  components = [];
  componentId = 'FrmMntReportListComponent';

  data = {
    report: {
      docElements: [],
      parameters:
        [
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
        ]
      , styles: [],
      version: 2,
      documentProperties:
      {
        pageFormat: 'A4',
        pageWidth: '',
        pageHeight: '',
        unit: 'mm',
        orientation: 'portrait',
        contentHeight: '',
        marginLeft: '',
        marginTop: '',
        marginRight: '',
        marginBottom: '',
        header: true,
        headerSize: '80',
        headerDisplay: 'always',
        footer: true,
        footerSize: '80',
        footerDisplay: 'always',
        patternLocale: 'en',
        patternCurrencySymbol: '$'
      }
    }, outputFormat: 'pdf',
    data: {},
    isTestData: true
  };

  form = this.fb.group({
    moduleId: ['', Validators.required],
    componentId: [{ value: '', disabled: true }, Validators.required],
    name: [{ value: '', disabled: true }, Validators.required],
    data: [JSON.stringify(this.data)]
  });

  constructor(injector: Injector, public reportService: FrmMntReportListService) {
    super(injector);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  loadComponents(item: any) {
    this.form.get('componentId').enable();
    this.components = this.reportService.getComponents(item.data.id);
  }

  isFilled() {
    this.form.get('name').enable();
  }
}
