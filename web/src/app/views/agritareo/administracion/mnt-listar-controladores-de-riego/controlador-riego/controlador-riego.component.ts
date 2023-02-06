import { Component, Injector } from '@angular/core';
import { AbstractDocument, DocumentProvider } from '@app/common/classes';
import { CONTROLADOR_RIEGO } from '@app/common/constants/agritareo.constants';
import { NsDocument } from '@app/common/decorators/document.decorator';

@Component({
  selector: 'ns-controlador-riego',
  templateUrl: './controlador-riego.component.html',
  styleUrls: ['./controlador-riego.component.scss'],
  providers: [
    DocumentProvider(ControladorRiegoComponent)
  ]
})

@NsDocument({
  formControllerId: CONTROLADOR_RIEGO,
  isDocument: true,
})

export class ControladorRiegoComponent extends AbstractDocument {

  form = this.fb.group({
    codigo: [''],
    nombre: [''],
  });

  constructor(injector: Injector) {
    super(injector);
  }



}
