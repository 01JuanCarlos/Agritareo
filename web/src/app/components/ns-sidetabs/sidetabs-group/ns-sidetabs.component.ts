import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Bool } from '@app/common/decorators';
import { NsSideTabComponent } from '../sidetab-item/ns-sidetab.component';

@Component({
  selector: 'ns-sidetabs',
  templateUrl: './ns-sidetabs.component.html',
  styleUrls: ['./ns-sidetabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NsSideTabsComponent {
  @Input() tabs: NsSideTabComponent[] = [];

  @Input() controlClass: string;
  @Input() @Bool sideTabs: boolean;
  @Input() @Bool tabFill: boolean;
  @Input() @Bool tabPills: boolean;

  constructor() { }

  trackByFn(index: number, tab: NsSideTabComponent) {
    return index + tab.label;
  }

  addTab(tab: NsSideTabComponent) {
    if (this.tabs.length === 0) {
      tab.active = true;
    }

    this.tabs.push(tab);
  }

  onActiveTab(tab: NsSideTabComponent) {
    for (const t of this.tabs) {
      t.setActive(t.id === tab.id);
    }
  }

  get __controlClass() {
    return {
      'nav-fill': this.tabFill
    };
  }

}
