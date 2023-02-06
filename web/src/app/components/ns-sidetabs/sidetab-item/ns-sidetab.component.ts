import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Id } from '@app/common/decorators';
import { NsSideTabsComponent } from '../sidetabs-group/ns-sidetabs.component';

@Component({
  selector: 'ns-sidetab',
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NsSideTabComponent implements OnInit {
  @HostBinding('class.tab-pane') isTabPane = true;
  @HostBinding('class.fade') isTabFade = true;
  @HostBinding('class.active') get TabActive() {
    return this.active;
  }
  @HostBinding('class.show') get TabShow() {
    return this.active;
  }
  @HostBinding('attr.id') get tabId() {
    return this.id;
  }
  @Input() @Id id: string;
  @Input() label: string;
  @Input() icon: string;
  @Input() active: boolean;
  @Input() description: string;

  @Output() select = new EventEmitter<NsSideTabComponent>();

  constructor(private tabs: NsSideTabsComponent) { }

  ngOnInit() {
    this.tabs.addTab(this);
  }

  setActive(status: boolean) {
    this.active = status;
    if (true === this.active) {
      this.select.emit(this);
    }
  }

}
