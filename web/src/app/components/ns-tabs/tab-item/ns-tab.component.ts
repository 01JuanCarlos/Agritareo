import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { NsTabsComponent } from '../tabs-group/ns-tabs.component';
import { Id } from '@app/common/decorators';

@Component({
  selector: 'ns-tab',
  template: `<ng-content></ng-content>`
})
export class NsTabComponent implements OnInit {
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

  constructor(private tabs: NsTabsComponent) { }

  ngOnInit() {
    this.tabs.addTab(this);
  }

}
