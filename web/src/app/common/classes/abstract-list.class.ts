import { Directive, Injector, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableSimpleComponent } from '@app/components/table-simple/table-simple.component';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { SweetAlertService } from '@app/services/util-services/sweet-alert.service';
import { NsMetadata } from '../decorators';
import { NsDocumentOptions } from '../decorators/document.decorator';
import { THeaderColumn } from '../interfaces';
import { GetMetaOptions } from '../utils/get-meta.util';
import { Logger } from '../utils/logger.util';

@Directive()
@NsMetadata({ isList: true })
export abstract class AbstractList implements OnInit {
  @ViewChild('table', { static: false }) table: TableSimpleComponent;

  protected http: AppHttpClientService;
  protected alert: SweetAlertService;
  protected options: NsDocumentOptions;
  abstract tableHeader: THeaderColumn[];

  private router: Router;
  private route: ActivatedRoute;


  protected onInit: () => void;

  viewURL: string;
  selectedItem: any;

  constructor(injector: Injector) {
    this.options = { ...this.options, ...GetMetaOptions(this) };
    this.viewURL = this.options.viewURL;
    this.http = injector.get(AppHttpClientService);
    this.alert = injector.get(SweetAlertService);
    this.router = injector.get(Router);
    this.route = injector.get(ActivatedRoute);
  }


  ngOnInit() {
    if (this.onInit) {
      this.onInit.call(this);
    }
  }

  deleteItem(id: number | string, title = '¿Desea eliminar el registro?', text = 'El registro no podrá ser recuperado'): void {
    this.alert.confirmDelete(text, title).then(resp => {
      !resp || this.http.delete(this.viewURL, id, { isTransaction: true }).subscribe({
        complete: () => {
          this.table?.reaload();
        }
      });
    });
  }

  goEditMode({ item } = { item: void 0 }) {
    if (item && item?.id) {
      this.router.navigate(['./', item?.id], { relativeTo: this.route });
      return;
    }

    Logger.warn('No existe un ID para esta URL');
  }
}
