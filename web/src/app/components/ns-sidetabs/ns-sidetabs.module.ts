import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NsSideTabsComponent } from './sidetabs-group/ns-sidetabs.component';
import { NsSideTabComponent } from './sidetab-item/ns-sidetab.component';

@NgModule({
  declarations: [
    NsSideTabsComponent,
    NsSideTabComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NsSideTabsComponent,
    NsSideTabComponent
  ]
})
export class NsSideTabsModule { }
