import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NsMapComponent } from './ns-map.component';

@NgModule({
  declarations: [NsMapComponent],
  exports: [NsMapComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule]
})

export class NsMapModule {

}
