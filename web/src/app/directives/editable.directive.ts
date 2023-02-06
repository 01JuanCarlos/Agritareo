import { Directive, AfterViewInit, ElementRef, Renderer2, Input } from '@angular/core';

@Directive({
  selector: '[appEditable]'
})
export class EditableDirective implements AfterViewInit {

  @Input('appEditable') editableId: string;

  constructor(private el: ElementRef, private render: Renderer2) {

    // console.log('Injectando ID ', this.el);
   }

  ngAfterViewInit() {
    // this.render.setAttribute(this.el.nativeElement, 'id', this.editableId);
  }
}
