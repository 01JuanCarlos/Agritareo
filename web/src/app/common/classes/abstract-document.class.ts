import { Directive, EventEmitter, InjectionToken, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup, FormGroupDirective } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { FormRequest } from '@app/services/util-services/form.service';
import { SweetAlertService } from '@app/services/util-services/sweet-alert.service';
import { cloneDeep, isEmpty } from 'lodash-es';
import { Subscription } from 'rxjs';
import { MNTHANDLER_API_PATH } from '../constants';
import { NsMetadata } from '../decorators';
import { AbstractForm } from './abstract-form.class';

export const initToken = new InjectionToken('init');

@Directive()
@NsMetadata({ isDocument: true })
// tslint:disable-next-line: directive-class-suffix
export abstract class AbstractDocument extends AbstractForm implements OnInit, OnDestroy {
  @Input() title: string;

  /** ID del mantendor para la gestion de ventanas */
  public documentId: string;

  public documentTitle: string;

  public isNotFoundDocument: boolean;
  public isNewDocument = true;

  /** Se ejecuta cuando el evento OnInit es llamado. */
  protected onInit: () => void;
  private formStatus$: Subscription;

  protected http: AppHttpClientService;
  protected route: ActivatedRoute;
  protected router: Router;
  protected alert: SweetAlertService;

  protected onLoadFetchData = new EventEmitter();

  constructor(private injector: Injector) {
    super(injector);
    this.documentId = this.options.id;
    this.formControllerId = this.options.formControllerId ?? MNTHANDLER_API_PATH;

    this.http = injector.get(AppHttpClientService);
    this.route = injector.get(ActivatedRoute);
    this.router = injector.get(Router);
    this.alert = injector.get(SweetAlertService);

    this.route.params
      .subscribe((params) => !params?.id || this.getDataById(params.id));
  }

  ngOnDestroy() { }

  ngOnInit() {
    if (this.onInit) {
      this.onInit.call(this);
    }

    this.formStatus$ = this.fs.formStatus.subscribe(({ status, data }) => {
      if (!status) {
        return;
      }

      if (status === FormRequest.DONE) {
        if (isEmpty(data)) {
          return this.isNotFoundDocument = true;
        }

        this.isNotFoundDocument = false;
        this.onLoadFetchData.emit(data);
        this.patchFormValue(data);
      }
    });
  }

  /** Obtener data en singular, con un ID. Llamada a procedimientos F */
  getDataById(id: number | string) {
    this.isLoading = true;
    this.isNewDocument = false;
    setTimeout(() => this.fs.get(id).subscribe(), 0);
  }

  backClicked() {
    const route = this.router.url.split('/');
    route.pop();
    this.router.navigateByUrl(route.join('/'));
  }

  // TODO: Evaluar la función validate
  validate(fValidate) {

  }

  saveDocument(formObj?) {
    const formValue = formObj || this.form.value;
    this.http.post(this.formControllerId, formValue, { isTransaction: true }).subscribe((data) => {
      const route = this.router.url.split('/');
      route.pop();
      route.push(data);
      this.router.navigateByUrl(route.join('/'));
    });
  }

  updateDocument(formObj?) {
    const formValue = formObj || this.form.value;
    this.http.put(this.formControllerId, this.formId, formValue, { isTransaction: true }).subscribe(() => {
      this.getDataById(this.formId);
    });
  }

  addFormArrayItem(formKey: string | any[], method: FormGroup, index?: number): void {
    const items = this.form.get(formKey) as FormArray;
    if (!items) {
      return;
    }
    items.removeAt(index ?? items.length);
    items.insert(index ?? items.length, cloneDeep(method));
  }

  deleteTab(formKey: string | any[], index: number, text = 'Deseas eliminar el registro', title = 'Eliminar'): void {
    this.alert.confirmDelete(text, title, {
      callback: (result) => {
        if (result) {
          const items = this.form.get(formKey) as FormArray;
          items.removeAt(index);
        }
      }
    });
  }

  // REFACTOR
  selectedIndex(formKey: string | any[], index): number {
    const totalLength = (this.form.get(formKey) as FormArray).length - 1;
    return index > totalLength ? totalLength : index;
  }
}


export function Provider(frmClass: any) {
  return [
    FormGroupDirective,
    { provide: AbstractDocument, useExisting: frmClass }
  ];
}

export const DocumentProvider = Provider;
