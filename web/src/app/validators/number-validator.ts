import { ValidatorFn, AbstractControl, Validators } from '@angular/forms';

export function numberValidator(): ValidatorFn {
  const reg = /^-?[\d.]+(?:e-?\d+)?$/;
  return (control: AbstractControl): {[key: string]: any} | null => {
    if (control.pristine || !control.value) {
      return null;
    }

    control.markAsTouched();
    const invalidNumber: boolean = reg.test(control.value);
    return !invalidNumber ? { invalidNumber: { value: control.value } } : Validators.nullValidator;
  };
}
