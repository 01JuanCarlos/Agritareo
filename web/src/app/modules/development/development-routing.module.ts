import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComponentBuilderComponent } from '@views/development/component-builder/component-builder.component';
import { BasicLayoutComponent } from '@app/layouts/basic-layout/basic-layout.component';

const routes: Routes = [
  {
    path: '',
    component: BasicLayoutComponent,
    children: [
      {
        path: 'component-builder',
        component: ComponentBuilderComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevelopmentRoutingModule { }
