import { Directive, ElementRef, Input, AfterViewInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appPopover]'
})
export class PopoverDirective implements AfterViewInit {
  @Input('appPopover') contentText: string;
  @Input() title: string;
  @Input() type: string;
  @Input() placement: 'top' | 'bottom' | 'left' | 'right';

  constructor(private el: ElementRef, private render: Renderer2) { }

  ngAfterViewInit() {
    $(this.el.nativeElement).popover({
      title: this.title || '-',
      content: this.contentText || '',
      trigger: 'hover',
      html: true,
      placement: this.placement || 'auto',
      template: `
        <div class="popover">
          <div class="arrow"></div>
          <h3 class="popover-header popover-${this.type || 'question'}"></h3>
          <div class="popover-body"></div>
        </div>`
    });
  }
}
