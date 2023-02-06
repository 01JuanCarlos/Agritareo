import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, AbstractControl } from '@angular/forms';
import { numberValidator } from '@app/validators/number-validator';

@Directive({
  selector: '[nsNumberValidator]',
  providers: [{provide: NG_VALIDATORS, useExisting: NumberValidatorDirective, multi: true}]
})
export class NumberValidatorDirective {
  // @Input('nsNumberValidator') number: string;

  validate(control: AbstractControl): {[key: string]: any} | null {
    return numberValidator()(control);
  }

  constructor() { }

}
