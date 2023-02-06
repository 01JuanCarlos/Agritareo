import { Directive, Injector } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormRequest, FormService } from '@app/services/util-services/form.service';
import { ID_FIELD, TRANSACTION_UID_FIELD } from '../constants';
import { ComponentMode } from '../enums/component-mode.enum';
import { UniqueID } from '../utils';
import { deepPatch } from '../utils/form.util';
import { AbstractComponent } from './abstract-component.class';

/**
 * Clase abstracta para los componente de tipo formulario
 * Sientete libre de sobreescribir los metodos de esta clase para extender las funcionalidades
 */

@Directive()
// tslint:disable-next-line: directive-class-suffix
export abstract class AbstractForm extends AbstractComponent {
  public static FORM_ID_KEY = 'id';
  /** Ruta Ajax del manejador o CRUD del formulario */
  protected formControllerId: string;

  protected fs: FormService;
  protected fb: FormBuilder;

  public formId: string | number;
  public transactionId: string;

  abstract form: FormGroup;

  constructor(
    injector: Injector,
  ) {
    super(injector);
    this.fs = injector.get(FormService);
    this.fb = injector.get(FormBuilder);

    setTimeout(() => {
      this.fs.setControllerId(this.formControllerId);
      this.fs.setViewComponentId(this.componentId);

      if (!this.transactionId && this.isCreateMode) {
        this.transactionId = UniqueID().toUpperCase();
      }

      this.fs.setTransactionId(this.transactionId);
      this.fs.setDocumentId(this.formId);

      this.fs.formStatus.subscribe(({ status }) => {
        if (status === FormRequest.CREATED || status === FormRequest.UPDATED || FormRequest.PATCHED === status) {
          this.form.markAsPristine();
          this.changeMode(ComponentMode.VIEW);
        }

        this.isLoading = FormRequest.LOADING === status;
      });

    }, 0);
  }

  get onChangeFormStatus() {
    return this.fs.formStatus.asObservable();
  }

  setTransactionId(transactionId: string) {
    this.transactionId = transactionId;
  }

  /** Envia los campos del formulario para registrar */
  createForm(form: any) {
    return this.fs.create(form);
  }

  /** Envia los campos del formulario para reemplazar el contenido */
  replaceForm(form: any) {
    return this.fs.update(this.formId, form);
  }

  /** Enviar parte de los campos modificados del documento */
  patchForm(form: any) {
    return this.fs.patch(this.formId, form);
  }

  submitForm() { }

  patchFormValue(data: any) {
    const formdata = { ...data };
    // Validación extra para sacar el valor de ID del cuerpo
    if (undefined === this.formId && formdata[ID_FIELD]) {
      this.formId = formdata[ID_FIELD];
    }

    // Validación extra para sacar el valor de TransactionId del cuerpo
    if (undefined === this.transactionId && formdata[TRANSACTION_UID_FIELD]) {
      this.transactionId = formdata[TRANSACTION_UID_FIELD];
    }

    // if (!this.form.get(ID_FIELD)) {
    //   this.form.addControl(ID_FIELD, new FormControl(this.formId));
    // }

    deepPatch(formdata, this.form);
  }

  validateForm() { }

  onSubmit() {
    if (this.form.valid) {
      return this.saveForm();
    }

    // if (!this.hasFormChanged) {
    //   console.log('No ha cambiado...');
    //   return;
    // }

    // for (const name in this.form.controls) {
    //   if (this.form.controls[name].invalid) {
    //     this.form.get(name).markAsDirty();
    //   }
    // }

    // const nodes: HTMLElement[] = GetElements(this.element, '.ng-invalid');
    // const [node] = nodes.filter(it => 'FORM' !== it.tagName);
    // const [control] = GetElements(node, 'input,select,textarea');

    // if (control) {
    //   control.focus();
    // }

    // console.log('Formulario no es valido.', this.form, { aca: this.form.getRawValue() }, this.form.errors);
  }

  resetForm() { }

  saveForm() {
    // Guardar formulario.
    const value = this.form.getRawValue();
    // console.log(value);
    // const formMethod = (this.isCreateMode ? this.createForm : (this.isPartialUpdate ? this.patchForm : this.replaceForm));

    // formMethod.call(this, this.isPartialUpdate && !this.isCreateMode ? this.getPatchValue(this.form.controls, value) : value).subscribe();
  }

  printForm() { }

  deleteForm() {
    return this.fs.delete(this.formId);
  }
}
