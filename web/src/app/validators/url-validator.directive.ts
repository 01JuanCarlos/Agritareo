import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, AbstractControl } from '@angular/forms';
import { urlValidator } from '@app/validators/url-validator';

@Directive({
  selector: '[nsUrlValidator]',
  providers: [{provide: NG_VALIDATORS, useExisting: UrlValidatorDirective, multi: true}]
})
export class UrlValidatorDirective {
  // @Input('nsUrlValidator') url: string;

  validate(control: AbstractControl): {[key: string]: any} | null {
    return urlValidator()(control);
  }

  constructor() { }

}
