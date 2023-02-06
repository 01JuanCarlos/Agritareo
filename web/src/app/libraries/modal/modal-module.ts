import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ModalDialogComponent} from './modal.component';
import {ResizableModule} from '../resizable';
import {DraggableModule} from '../draggable';

@NgModule({
  imports: [
    CommonModule,
    ResizableModule,
    DraggableModule,
  ],
  declarations: [
    ModalDialogComponent,
  ],
  exports: [
    ModalDialogComponent,
  ],
  providers: []
})
export class ModalDialogModule {}
