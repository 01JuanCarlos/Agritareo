import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NestableComponent } from './nestable.component';
import { NestableItemComponent } from './nestable-item.component';

@NgModule({
  declarations: [
    NestableComponent,
    NestableItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    NestableComponent,
    NestableItemComponent
  ]
})
export class NestableModule { }
