import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from './nav/nav.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    NavComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
  ],
  exports: [
    NavComponent,
    TranslateModule
  ]
})
export class NavigationModule { }
// FIXME: CONSIDERAR MOVER NAV COMO COMPONENTE INDENPENDIENTE.
