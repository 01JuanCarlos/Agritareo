import { Component, ContentChild, Input, OnInit, Optional } from '@angular/core';
import { Bool } from '@app/common/decorators';
import { NsTemplate } from '@app/directives/ns-template.directive';
import { NsInputControlComponent } from '../ns-input-control/ns-input-control.component';

@Component({
  selector: 'ns-addon-control',
  template: '<ng-content></ng-content>'
})
export class NsAddonControlComponent implements OnInit {
  @ContentChild(NsTemplate, { static: true }) template: NsTemplate;
  @Input() icon: string;
  @Input() text: string;
  @Input() class: string;
  @Input() @Bool append: boolean;
  @Input() @Bool prepend: boolean;
  @Input() @Bool isBtn: boolean;
  @Input() callback: () => void;

  constructor(
    @Optional() private inputControl: NsInputControlComponent
  ) {
  }

  ngOnInit() {
    if (this.inputControl) {
      this.append = !this.prepend;
      this.inputControl.addAddon(this);
    }
  }
}
