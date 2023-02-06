import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ComponentBuilderComponent } from '@views/development/component-builder/component-builder.component';
import { SharedModule } from '../shared/shared.module';
import { DevelopmentRoutingModule } from './development-routing.module';

@NgModule({
  declarations: [
    ComponentBuilderComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DevelopmentRoutingModule
  ],
})
export class DevelopmentModule { }
