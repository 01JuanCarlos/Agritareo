import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Bool } from '@app/common/decorators';

@Component({
  selector: 'ns-button',
  templateUrl: './ns-button.component.html',
  styleUrls: ['./ns-button.component.scss']
})
export class NsButtonComponent {
  @Input() href: string;
  @Input() icon: string;
  @Input() label: string;
  @Input() type: string;
  @Input() disabled: boolean;
  @Output() btClick = new EventEmitter();

  @Input() material = true;
  @Input() @Bool mini: boolean;

  constructor() { }
}
