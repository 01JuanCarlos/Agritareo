import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Bool, Id } from '@app/common/decorators';
import { ParseClassNames } from '@app/common/utils';

/**
 * Traduce automaticamente las etiquetas.
 */
@Component({
  selector: 'ns-label-control',
  templateUrl: './ns-label-control.component.html',
  styleUrls: ['./ns-label-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NsLabelControlComponent {
  @ViewChild('templateContent', { static: true }) templateContent: ElementRef;
  @Input() @Id id: string;
  @Input() controlClass: string;
  @Input() @Bool inline: boolean;
  @Input() @Bool required: boolean;
  @Input() size = 'sm';
  @Input() class: string;
  @Input() for: string;
  @Input() icon: string;
  @Input() message: string;
  @Input() messageTitle: string;
  @Input() messageType: string;
  @Input() messageClass: string;
  @Input() messagePlacement: 'left' | 'right';

  constructor() { }

  /**
   * Obtiene el texto del label desde el contenido proyectado.
   */
  public getLabel() {
    return this.templateContent.nativeElement.innerText;
  }

  public setLabel(value: string) {
    this.templateContent.nativeElement.innerText = value;
  }

  get __controlClass() {
    return {
      required: this.required,
      'col-form-label': this.inline && !this.size,
      ['col-form-label-' + this.size]: this.inline && this.size,
      ...ParseClassNames(this.controlClass)
    };
  }

  get messageIconClass() {
    return {
      'icon-question4': !this.messageType || 'question' === this.messageType,
      'icon-warning22': 'warning' === this.messageType,
      'icon-notification2': 'info' === this.messageType,
    };
  }

}
