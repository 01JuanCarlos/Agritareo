import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { NsTabComponent } from '../tab-item/ns-tab.component';
import { Bool } from '@app/common/decorators';
import { ParseClassNames } from '@app/common/utils';

@Component({
  selector: 'ns-tabs',
  templateUrl: './ns-tabs.component.html',
  styleUrls: ['./ns-tabs.component.scss']
})
export class NsTabsComponent implements OnInit {
  tabs: NsTabComponent[] = [];

  @Input() controlClass: string;
  @Input() @Bool sideTabs: boolean;
  @Input() @Bool tabFill: boolean;
  @Input() @Bool tabPills: boolean;

  constructor() { }

  ngOnInit() { }

  addTab(tab: NsTabComponent) {
    if (this.tabs.length === 0) {
      tab.active = true;
    }

    this.tabs.push(tab);
  }

  get __controlClass() {
    return {
      'nav-fill': this.tabFill,
      'nav-tabs-bottom': !this.tabPills && !this.sideTabs,
      'flex-nowrap': !this.sideTabs,
      'mb-0': !this.sideTabs,
      'nav-tabs-vertical': this.sideTabs,
      'flex-column': this.sideTabs,
      ...ParseClassNames(this.controlClass)
    };
  }

}
