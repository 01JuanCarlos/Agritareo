import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';

export function  urlValidator(): ValidatorFn {
  // tslint:disable-next-line: max-line-length
  const url = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;
  return (control: AbstractControl): {[key: string]: any} | null => {
    if (control.pristine || !control.value) {
      return null;
    }

    control.markAsTouched();
    const invalidUrl: boolean = url.test(control.value);
    return !invalidUrl ? { invalidUrl: { value: control.value } } : Validators.nullValidator;
  };
}
