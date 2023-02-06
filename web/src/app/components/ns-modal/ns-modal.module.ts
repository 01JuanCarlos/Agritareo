import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NsModalComponent } from './ns-modal.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ModalService } from './ns-modal.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [NsModalComponent],
  declarations: [NsModalComponent],
  entryComponents: [NsModalComponent],
  providers: [ModalService]
})
export class NsModalModule { }
