import { Directive, ElementRef, Input, AfterViewInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appModal]'
})
export class ModalDirective implements AfterViewInit {

  @Input('appModal') modalId: string;

  constructor(private el: ElementRef, private render: Renderer2) { }

  ngAfterViewInit() {
    this.render.setAttribute(this.el.nativeElement, 'data-toggle', 'modal');
    this.render.setAttribute(this.el.nativeElement, 'data-target', '#modal' + this.modalId);
  }

}
