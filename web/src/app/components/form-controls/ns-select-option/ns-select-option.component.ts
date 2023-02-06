import { AfterContentInit, ChangeDetectionStrategy, Component, ElementRef, Input } from '@angular/core';
import { NsSelectControlComponent } from '../ns-select-control/ns-select-control.component';

@Component({
  selector: 'ns-select-option',
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NsSelectOptionComponent implements AfterContentInit {
  public selectOption = true;
  @Input() value: any;
  @Input() label: string;
  @Input() selected: boolean;

  constructor(
    private elementRef: ElementRef,
    private select: NsSelectControlComponent
  ) { }

  ngAfterContentInit() {
    this.label = this.elementRef.nativeElement.innerText;
    this.select.addOption(this);
  }
}
