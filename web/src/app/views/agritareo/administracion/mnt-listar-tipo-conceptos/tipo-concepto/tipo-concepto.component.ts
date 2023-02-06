import { Component, Injector } from '@angular/core';
import { AbstractDocument, DocumentProvider } from '@app/common/classes';
import { TIPO_CONCEPTO } from '@app/common/constants/agritareo.constants';
import { NsDocument } from '@app/common/decorators/document.decorator';

@Component({
  selector: 'ns-tipo-concepto',
  templateUrl: './tipo-concepto.component.html',
  styleUrls: ['./tipo-concepto.component.scss'],
  providers: [
    DocumentProvider(TipoConceptoComponent)
  ]
})

@NsDocument({
  formControllerId: TIPO_CONCEPTO,
  isDocument: true,
})
export class TipoConceptoComponent extends AbstractDocument {
  form = this.fb.group({
    codigo: '',
    nombre: '',
    descripcion: '',
    estado: '',
  });

  constructor(injector: Injector) {
    super(injector);
  }
}
