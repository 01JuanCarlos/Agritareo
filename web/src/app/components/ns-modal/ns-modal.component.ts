import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostBinding,
  Injector,
  Input,
  isDevMode,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ComponentRef
} from '@angular/core';
import { AbstractFormGroup } from '@app/common/classes/abstract-form-group.class';
import { Bool, Id } from '@app/common/decorators';
import { SerializeClassNames, SetSecureProperty } from '@app/common/utils';
import { CallSecureMethod } from '@app/common/utils/call-secure-method.util';
import { NsTemplate } from '@app/directives/ns-template.directive';
import 'bootstrap/js/dist/modal';
import { BehaviorSubject, forkJoin, isObservable, of, Subject } from 'rxjs';
import { every, finalize, flatMap } from 'rxjs/operators';
import { ModalConfig } from './ns-modal-config';
import { ModalInjector } from './ns-modal-injector';

@Component({
  selector: 'ns-modal',
  templateUrl: './ns-modal.component.html',
  styleUrls: ['./ns-modal.component.scss']
})
export class NsModalComponent implements OnInit, OnDestroy, AfterViewInit, AfterContentInit {
  @HostBinding('attr.id') get attrId() {
    return `modal${this.id}`;
  }

  @HostBinding('attr.role') get attrRole() {
    return `dialog`;
  }

  @HostBinding('attr.tabindex') get attrTabsIndex() {
    return -1;
  }

  @HostBinding('class') get _class() {
    return SerializeClassNames({
      modal: !0,
      fade: !0,
      ns__modal: !0,
      right: this.isRight,
      left: this.isLeft
    });
  }

  @ViewChild('dynamicContent', { read: ViewContainerRef })
  private dynamicContent: ViewContainerRef;

  @Input() @Id id: string;
  /** El modal se muestra desde la izquierda */
  @Input() @Bool isLeft: boolean;
  /** El modal se muestra desde la derecha */
  @Input() @Bool isRight: boolean;
  /** Mostrar los botones de la cabecera */
  @Input() @Bool showHeaderButtons: boolean;
  /** Mostrar el pie del modal */
  @Input() @Bool showFooter = true;
  @Input() @Bool serializeForm: boolean;
  /** Cerrar el modal cuando se guarda un formulario */
  @Input() @Bool closeOnSave = true;
  @Input() table: NsModalComponent;
  /** Tamaño del modal sm | md | lg */
  @Input() size = 'md';
  /** Titulo del modal */
  @Input() title: string;
  /** Desactivar que se oculte cuando se clickea afuera, 'static' para dejar el fondo. */
  @Input() backdrop: any = true;
  /** Desactivar que se oculte usando el teclado. */
  @Input() keyboard = true;
  /** Mostrar la cabcera del modal */
  @Input() showHeader = true;
  /**
   * Evento se emite cuando se presiona el boton de guardar,
   * si contiene un formulario entonces pera que el servicio termine
   */
  @Output() submit = new EventEmitter();
  @Output() show = new EventEmitter();
  @Output() shown = new EventEmitter();
  @Output() hide = new EventEmitter();
  @Output() hidden = new EventEmitter();

  /** Obtener todos los templates que usan la directia [NsTemplate] */
  @ContentChildren(NsTemplate) templates: QueryList<NsTemplate>;
  /** Obtener todos los componentes que heredan de la clase abstracta "AbstractFormGroup" */
  @ContentChildren(AbstractFormGroup) forms: QueryList<AbstractFormGroup>;

  public headerTemplate: TemplateRef<any>;
  public bodyTemplate: TemplateRef<any>;
  public footerTemplate: TemplateRef<any>;

  private element: HTMLElement;
  private initdata = new Subject();
  private isLoading$ = new BehaviorSubject(false);

  public initialdata = this.initdata.asObservable();
  public isLoading = this.isLoading$.asObservable();

  public isDynamicContent = false;
  public dynamicContentSelector: string;
  public dynamicContentRef: ComponentRef<any>;
  public config: ModalConfig = {};

  constructor(
    private cfr: ComponentFactoryResolver,
    private injector: Injector,
    private cdr: ChangeDetectorRef,
    el: ElementRef) {
    this.element = el.nativeElement;
  }

  async addDynamicContent(compRef: any, config: ModalConfig, injector: WeakMap<any, any>) {
    if ('string' === typeof compRef) {
      this.dynamicContentSelector = compRef;
      compRef = await import(`../${compRef}/${compRef}.component`);
      const [key] = Object.keys(compRef);
      compRef = compRef[key];
    }

    config?.title && (this.title = config.title);
    config?.id && (this.id = config.id);
    config?.size && (this.size = config.size);
    config?.backdrop && (this.backdrop = config.backdrop);

    const component = this.cfr.resolveComponentFactory(compRef);
    const inject = new ModalInjector(this.injector, injector);
    // assign to property
    this.dynamicContentRef = this.dynamicContent.createComponent(component, null, inject);
    this.isDynamicContent = !0;
    this.config = config;
    this.showModal();
  }

  ngOnInit() {
    if (this.isLeft || this.isRight) {
      this.isRight = !this.isLeft;
      this.isLeft = !this.isRight;
    }

    this.initdata.subscribe(data => {
      this.callChildMethod('patchFormValue', data);
    });

    if (!this.isDynamicContent) {
      const elBackdrops: HTMLElement[] = [].slice.call(document.querySelectorAll('.modal-backdrop'));
      elBackdrops.forEach(el => {
        el.parentNode.removeChild(el);
      });

      document.body.appendChild(this.element);
    }
  }

  ngAfterViewInit() {
    this.jQueryModalElement.on({
      'show.bs.modal': e => this.show.emit(e),
      'shown.bs.modal': e => this.shown.emit(e),
      'hide.bs.modal': e => this.hide.emit(e),
      'hidden.bs.modal': e => {
        this.hidden.emit(e);
        this.callChildMethod('resetForm');
      }
    });
  }

  /**
   * Setear templates si es que se pasa con la directiva [nsTemplate]
   */
  ngAfterContentInit() {
    this.templates.forEach(template => {
      switch (template.getType()) {
        case 'header': this.headerTemplate = template.template; break;
        case 'body': this.bodyTemplate = template.template; break;
        case 'footer': this.footerTemplate = template.template; break;
      }
    });

    this.forms.forEach(form => {
      SetSecureProperty(form, 'inModal', true);
    });
  }

  /**
   * El elemento JQuery del modal.
   */
  get jQueryModalElement() {
    return $(this.element);
  }

  /**
   * Ejecutar un metodo en todos los formularios.
   * @param method Metodo que se desea ejecutar
   * @param args Los argumentos para el metodo
   */
  callChildMethod(method: string, ...args: any[]) {
    this.forms.forEach(form => CallSecureMethod(form, method, ...args));
  }

  /**
   * Valida todos los hijos del modal que sean formularios.
   */
  private isValidChildren() {
    // Ejecutar el metodo validateForm en todos los hijos del modal.
    return forkJoin(this.forms.toArray().map(form => {
      const isValid = form.validateForm();
      return !isObservable(isValid) ? of(isValid) : isValid;
    })).pipe(
      flatMap(val => val),
      every(val => true === !!val)
    );
  }

  /**
   * Guardar formularios.
   */
  onSubmitChildren() {
    this.isValidChildren().subscribe(async isValid => {
      if (!isValid) {
        return console.log('No se ha completado las validaciónes de los formularios.');
      }

      this.isLoading$.next(true);
      let transactionError = false;
      const resultData = [];
      let result = null;

      try {
        for (const form of this.forms.toArray()) {
          if (form.ajaxPath) {
            result = await (form.isEditMode ? form.replaceForm() : form.createForm()).pipe(
              finalize(() => console.log('Modal[onSubmitChildren]' + form.componentId))
            ).toPromise();
          } else {
            // TODO: Puede que se use distinto en ciertos casos.
            // Obtener el form modificado del formulario.
            result = form.form.value;
          }
          resultData.push(result);
        }
      } catch (error) {
        transactionError = true;
        console.log('Modal[onSubmitForms]: ', error);
      }

      if (!transactionError) {
        // Emitir evento [submit]
        this.submit.emit(...resultData);

        // Cerrar el modal automaticamente.
        if (this.closeOnSave) {
          this.close();
        }
      }

      this.isLoading$.next(false);
    });
  }

  /**
   * Abrir el modal
   * @param data Data opcional
   */
  open(data?: any) {
    if (!!data && 'object' === typeof data) {
      this.initdata.next(data);
    }

    setTimeout(() => {
      this.showModal();
    }, 100);

  }

  /**
   * Cerrar el modal.
   * @param saved Bandera indica si fue un exito
   */
  close() {
    this.hideModal();
  }

  private showModal() {
    try {
      this.jQueryModalElement.modal({
        backdrop: this.backdrop,
        keyboard: this.keyboard
      });
    } catch (error) {
      // tslint:disable-next-line: no-unused-expression
      isDevMode() && console.warn('Error open modal ', error.message);
    }
  }

  private hideModal() {
    try {
      this.jQueryModalElement.modal('hide');
      this.dynamicContent.clear();
    } catch (error) {
      // tslint:disable-next-line: no-unused-expression
      isDevMode() && console.warn('Error hide modal ', error.message);
    }
  }

  onSaveModal() {
    this.callChildMethod('submitForm');
    this.onSubmitChildren();
  }

  ngOnDestroy() {
    this.element.remove();
  }
}
