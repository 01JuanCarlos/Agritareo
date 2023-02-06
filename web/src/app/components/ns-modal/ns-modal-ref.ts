import { ApplicationRef, ComponentRef } from '@angular/core';
import { NsModalComponent } from './ns-modal.component';
import { UniqueID } from '@app/common/utils';

export class ModalRef {
  public refId = UniqueID();

  constructor(
    private appRef: ApplicationRef,
    private componentRef: ComponentRef<any>,
    private container: NsModalComponent
  ) { }

  hasId(id: string) {
    return this.container?.id === id;
  }

  hasSelector(selector: string) {
    return this.container?.dynamicContentSelector === selector;
  }

  close() {
    this.container.close();
  }

  onCloseModal() {
    return this.container.hide;
  }

  onOpenModal() {
    return this.container.show;
  }

  removeComponentModal() {
    this.appRef.detachView(this.componentRef.hostView);
    this.componentRef.destroy();
  }
}
