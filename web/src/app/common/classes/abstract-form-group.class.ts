import { ElementRef, Injector, Input, ViewChild, Directive } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';
import { HttpFormServiceService } from '@app/services/util-services/http-form-service.service';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { GetSecureProperty } from '../utils';

@Directive()
export abstract class AbstractFormGroup {
  @Input() ajaxPath: string;
  @Input() dataKey = 'id';
  @ViewChild(FormGroupDirective, { static: true }) formGroupDirective: FormGroupDirective;

  // Propiedades requeridas
  abstract form: FormGroup;
  abstract componentId: string;
  //
  protected titleOnCreate: string;
  protected titleOnEdit: string;
  protected titleOnPreview: string;

  // Servicio injectados
  protected element: any;
  protected fb: FormBuilder;
  protected formService: HttpFormServiceService;

  protected inModal = false;
  protected inWizard = false;
  protected initialFormValue: string;
  protected formValueId: string | number;

  // Variables locales
  private showSaveButton = true;

  public isEditMode = false;
  public isLoading = false;

  @Input() get showSave() {
    return this.showSaveButton || !this.inModal;
  }

  set showSave(value: boolean) {
    this.showSaveButton = value;
  }

  constructor(inject: Injector) {
    this.fb = inject.get(FormBuilder);
    this.formService = inject.get(HttpFormServiceService);
    this.element = inject.get(ElementRef).nativeElement;

  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngOnInit() {
    if (!!this.form && !this.initialFormValue) {
      this.initialFormValue = JSON.stringify(this.form.value);
    }
  }

  /**
   * Metodo que puede ser invocado por otros componentes para indicar
   * que el componente padre acaba de iniciar y por lo tanto deberia
   * informar a sus hijos, en este caso el formulario.
   */
  public init?(data: any): void;

  submitForm() {
    this.formGroupDirective.ngSubmit.emit();
  }

  // Sobreescribir esta clase para exteder caracteristicas.
  patchFormValue(data: any) {
    if (!this.form.get('transaction_uid')) {
      this.form.addControl('transaction_uid', new FormControl(data.transaction_uid));
    }

    if (!this.form.get('id')) {
      this.form.addControl('id', new FormControl(data.id));
    }

    this.form.patchValue(data);

    if (data && this.dataKey in data) {
      this.formValueId = data[this.dataKey];
    }
    this.isEditMode = true;
  }

  _formServiceSuccess(response: any) {

  }

  setLoading(value: boolean) {
    const form: HTMLFormElement = this.element.querySelector('form');
    if (form && value) {
      form.classList.add('form-loading');
    } else if (form && !value) {
      form.classList.remove('form-loading');
    }
  }

  createForm() {
    const { id, ...formValue } = this.form.value;
    return this.formService
      .create(this.ajaxPath, formValue, { componentId: this.componentId });
  }

  replaceForm() {
    return this.formService
      .replace(this.ajaxPath, GetSecureProperty(this.form.value, 'id', null), this.form.value, { componentId: this.componentId });
  }

  validateForm(): boolean | Observable<boolean> {
    return this.form.valid;
  }

  // Sobreescribir esta clase para exteder caracteristicas.
  onSubmit() {
    if (this.inModal) {
      this.form.markAllAsTouched();
      return console.log('El formulario será validado desde el componente Modal.');
    }

    if (!this.validateForm()) {
      return console.warn('El formulario no es valido.', this.form);
    }

    this.setLoading(!0);

    if (this.isEditMode) {
      this.replaceForm()
        .pipe(finalize(() => this.setLoading(!1)))
        .subscribe(this._formServiceSuccess.bind(this));
      return;
    }

    this.createForm()
      .pipe(finalize(() => this.setLoading(!1)))
      .subscribe(this._formServiceSuccess.bind(this));

  }

  // Sobreescribir esta clase para exteder caracteristicas.
  resetForm() {
    this.form.removeControl('transaction_uid');
    this.form.removeControl('id');
    this.form.reset(JSON.parse(this.initialFormValue || '{}'));
    this.form.markAsPristine();
    this.isEditMode = false;
  }
}


export function Provider(frmClass: any) {
  return [
    FormGroupDirective,
    { provide: AbstractFormGroup, useExisting: frmClass }
  ];
}

export const FormGroupProvider = Provider;
