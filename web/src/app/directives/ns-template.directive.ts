import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[nsTemplate]'
})
// tslint:disable-next-line: directive-class-suffix
export class NsTemplate {
  @Input() type: string;
  @Input('nsTemplate') name: string;

  constructor(public template: TemplateRef<any>) { }

  getType(): string {
    return this.name;
  }

}
