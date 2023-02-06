import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NsTabsComponent } from './tabs-group/ns-tabs.component';
import { NsTabComponent } from './tab-item/ns-tab.component';

@NgModule({
  declarations: [
    NsTabsComponent,
    NsTabComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NsTabsComponent,
    NsTabComponent
  ]
})
export class NsTabsModule { }
