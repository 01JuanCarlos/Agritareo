import { Component, DoCheck, ElementRef, HostBinding, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { Tool, ToolSection } from '@app/common/interfaces/toolbar.interface';
import { ParseClassNames } from '@app/common/utils';
import { ToolAction } from '@app/config/toolbar-actions';
import { ToolBarService } from '@app/services/component-services/toolbar.service';

@Component({
  selector: 'ns-toolbar',
  templateUrl: './ns-toolbar.component.html',
  styleUrls: ['./ns-toolbar.component.scss']
})
export class NsToolBarComponent implements OnInit, DoCheck {
  @ViewChild('search', { static: false }) searchInput: ElementRef;
  @HostBinding('style.display') get visibleTools() {
    const show = this.service.has(this.direction);
    return !show ? 'none' : 'inherit';
  }

  @Input() direction = 'top';

  ngDoCheck() {
    // console.log({ toolbar: 1 });
  }

  constructor(
    public service: ToolBarService
  ) { }

  trackByFn(i: number, t: Tool) {
    return i;
  }

  onsearch(section: ToolSection, text: string) {
    this.service.callAction(this.service.getEventName(section, ToolAction.SEARCH), text);
  }

  ngOnInit() { }


  @HostListener('document:keydown.control.b')
  focusSearch() {
    this.searchInput?.nativeElement?.focus();
  }

  isEnabled(tool: Tool) {
    return !!('function' === typeof tool.enabled ? tool.enabled() : tool.enabled);
  }

  isVisible(tool: Tool) {
    return ('function' === typeof tool.visible ? tool.visible() : tool.visible);
  }

  toolClass(tool: Tool) {
    return {
      disabled: !this.isEnabled(tool),
      hide: !this.isVisible(tool),
      'dropdown-toggle': this.hasItems(tool),
      ...ParseClassNames(tool.settings && tool.settings.class)
    };
  }

  hasItems(tool: Tool): boolean {
    return !!(tool?.items && tool.items.length);
  }

  onAction(tool: Tool, parent?: Tool) {
    if (!this.isEnabled(tool)) {
      return;
    }

    if (void 0 !== tool.action) {
      if ('string' === typeof tool.action) {
        this.service.callAction(tool.action);
      }
    }

    if (void 0 !== tool.callback && 'function' === typeof tool.callback) {
      tool.callback();
    }

    if (void 0 !== parent) {
      if (void 0 !== parent.action) {
        if ('string' === typeof parent.action) {
          this.service.callAction(parent.action, tool.action);
        }
      }

      if (void 0 !== parent.callback && 'function' === typeof parent.callback) {
        parent.callback(tool.action);
      }
    }
  }
}
