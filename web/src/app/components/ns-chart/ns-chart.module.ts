import { NgModel, FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NsChartComponent } from './ns-chart.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [NsChartComponent],
  exports: [NsChartComponent]
})
export class NsChartModule { }
