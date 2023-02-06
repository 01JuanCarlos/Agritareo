import { EventEmitter, Injectable } from '@angular/core';
import { Tool, ToolSection } from '@app/common/interfaces/toolbar.interface';
import { ObjectClone } from '@app/common/utils';
import { toolbarConfig } from '@app/config';
import { ToolAction } from '@app/config/toolbar-actions';
import { BehaviorSubject, Subject } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ToolBarService {
  public actions = new EventEmitter<{ action: string | ToolAction }>();
  private events: { [key: string]: { fn: (...args: any[]) => void, rx: Subject<any> } } = {};

  direction: 'top' | 'bottom' | 'left' | 'right' = 'top';
  sections: ToolSection[] = [];
  toolbar = new BehaviorSubject<ToolSection[]>([]);

  constructor() { }

  public getEventName(section: ToolSection, action: ToolAction) {
    return `${section.id}::${ToolAction.SEARCH}_${ToolAction[action]}`;
  }

  private use(sectionId: string, action: ToolAction, fn?: boolean | ((...args: any[]) => void), enable?: boolean) {
    let toolbarList = Object.keys(toolbarConfig).map(k => ObjectClone(toolbarConfig[k]));
    toolbarList = toolbarList.sort((a, b) => a.order - b.order);

    toolbarList.forEach((t, si) => {
      if (undefined !== toolbarConfig[t.id] && sectionId === toolbarConfig[t.id].id) {
        const section = this.sections.find(s => sectionId === s.id) || t || ObjectClone(toolbarConfig[t.id]);

        for (const group of section.toolGroup) {
          for (const tool of group.tools) {
            if (action === tool.action) {
              tool.use = true;
              tool.action = `${t.id}::${tool.action}_${ToolAction[tool.action]}`;
              tool.eventName = `${t.id}::${tool.action}_${ToolAction[tool.action]}`;
              tool.visible = !0;
              tool.enabled = 'boolean' === typeof fn ? fn : !!enable;
              if (void 0 !== tool.toggle) {
                tool.toggle = `${t.id}::${tool.toggle}_${ToolAction[tool.toggle]}`;
              }
            }
          }

          group.enabled = true;
        }

        section.maxTools = section.maxTools || 10;
        section.enabled = true;
        section.order = undefined === t.order ? si : t.order;

        this.sections = this.sections.filter(s => s.id !== section.id);
        this.sections = this.sections.concat(section);
        this.sections = this.sections.sort((a, b) => a.order - b.order);
        this.toolbar.next(this.sections.slice());
      }
    });
    return this.on(sectionId, action, 'function' === typeof fn ? fn : void 0);
  }

  callAction(action: ToolAction | string, ...args: any[]) {
    this.actions.emit({ action });
    if (void 0 !== this.events[action]) {
      if (void 0 !== this.events[action].fn) {
        this.events[action].fn(...args);
      }

      this.events[action].rx.next(args);
    }
  }

  public on(sectionId: string, action: ToolAction, fn?: (...args: any[]) => void) {
    const actionStr = `${sectionId}::${action}_${ToolAction[action]}`;

    if (undefined !== fn && void 0 !== this.events[actionStr]) {
      this.events[actionStr].fn = fn;
    }

    if (void 0 === this.events[actionStr]) {
      this.events[actionStr] = {
        fn,
        rx: new Subject()
      };
    }
    return this.events[actionStr].rx.asObservable().pipe(first());
  }

  has(direction: string): boolean {
    return this.direction === direction && this.sections.filter(s => s.enabled).length > 0;
  }

  tool(sectionId: string, action: ToolAction, options?: Partial<Tool>): Tool;
  tool(sectionId: string, action: ToolAction, order?: number, options?: Partial<Tool>): Tool;
  tool(sectionId: string, action: ToolAction, a?: Partial<Tool> | number, b?: Partial<Tool>): Tool {
    const sections = this.sections.slice(0);
    const options = 'object' === typeof a ? a : b || {};
    const order = 'number' === typeof a ? a : undefined;
    let result: Tool;

    for (const section of sections) {
      if (sectionId === section.id && section.toolGroup.length) {
        for (const group of section.toolGroup) {
          if (group && void 0 !== order ? order === group.order : !0) {
            for (let i = 0, len = group.tools.length; i < len; i++) {
              if (group.tools[i] && group.tools[i].action === `${sectionId}::${action}_${ToolAction[action]}`) {
                if (group.tools[i].use) {
                  !!options && (group.tools[i] = { ...group.tools[i], ...options });
                  result = group.tools[i];
                }
              }
            }
          }
        }
      }
    }

    this.toolbar.next(sections);
    return result;
  }

  enable(sectionId: string, action: ToolAction, status: boolean) {
    return this.tool(sectionId, action, {
      enabled: status
    });
  }

  visible(sectionId: string, action: ToolAction, status: boolean) {
    return this.tool(sectionId, action, {
      visible: status
    });
  }

  getSection(sectionId: string) {
    return {
      enable: (action: ToolAction, status: boolean) => this.enable(sectionId, action, status),
      visible: (action: ToolAction, status: boolean) => this.visible(sectionId, action, status),
      use: (action: ToolAction, fn?: boolean | ((...args: any[]) => void), enable?: boolean) => this.use(sectionId, action, fn, enable)
    };
  }

  delSection(sectionId: string) {
    this.sections = this.sections.filter(s => s.id !== sectionId);
    this.toolbar.next(this.sections.slice());
  }
}
