import { ApplicationRef, ComponentFactoryResolver, ComponentRef, EmbeddedViewRef, Injectable, InjectionToken, Injector } from '@angular/core';
import { ModalConfig } from './ns-modal-config';
import { ModalRef } from './ns-modal-ref';
import { NsModalComponent } from './ns-modal.component';

export const DATA_MODAL = new InjectionToken<any>('NsDataModal');
export const MODAL_REF = new InjectionToken<any>('NsModalRef');

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals: ModalRef[] = [];

  constructor(
    private cfr: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) { }

  private openModal(compRef: any, config: ModalConfig = { data: {} }) {
    const componentRef = this.appendComponentToBody(NsModalComponent);
    const container = componentRef.instance;
    // Set dynamic flag component.
    container.isDynamicContent = !0;

    const modalRef = new ModalRef(this.appRef, componentRef, container);
    const injector = this._createInjector(config, modalRef);

    container.addDynamicContent(compRef, config, injector);
    modalRef.onCloseModal().subscribe(() => {
      modalRef.removeComponentModal();
    });

    this.addModalRef(modalRef);
    return modalRef;
  }

  private _createInjector(config: ModalConfig, modalRef: ModalRef): Injector {
    const injectionTokens = new WeakMap();
    // added to the injection tokens.
    injectionTokens
      .set(MODAL_REF, modalRef);
    if (config.hasOwnProperty('data')) {
      injectionTokens.set(DATA_MODAL, config.data);
    }

    return injectionTokens;
  }

  private appendComponentToBody(component: any): ComponentRef<any> {
    // 1. Create a component reference from the component
    const componentRef = this.cfr
      .resolveComponentFactory(component)
      .create(this.injector);
    componentRef.changeDetectorRef.detectChanges();

    // 2. Attach component to the appRef so that it's inside the ng component tree
    this.appRef.attachView(componentRef.hostView);

    // 3. Get DOM element from component
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    // 4. Append DOM element to the body
    document.body.appendChild(domElem);

    // 5. Wait some time and remove it from the component tree and from the DOM
    // setTimeout(() => {
    //     this.appRef.detachView(componentRef.hostView);
    //     componentRef.destroy();
    // }, 3000);
    return componentRef;
  }

  private addModalRef(modal: any) {
    this.modals.push(modal);
  }

  private getModalRef(compRef: unknown): ModalRef {
    let modalRef: ModalRef;
    if ('string' === typeof compRef && compRef.startsWith('#')) {
      modalRef = this.modals.find(m => m.hasId(compRef));
    } else if ('string' === typeof compRef) {
      modalRef = this.modals.find(m => m.hasSelector(compRef));
    }
    return modalRef;
  }

  remove(compRef: unknown) {
    const modalRef = this.getModalRef(compRef);
    if (undefined !== modalRef) {
      modalRef.close();
      this.modals = this.modals.filter(m => m.refId !== modalRef.refId);
    }
  }

  open(compRef: unknown, config: ModalConfig) {
    this.openModal(compRef, config);
  }

  close(compRef: unknown) {
    this.getModalRef(compRef)?.close();
  }
}
