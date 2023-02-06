import { AfterViewInit, Directive, EventEmitter, QueryList, ViewChildren } from '@angular/core';
import { NsTemplate } from '@app/directives/ns-template.directive';
import { BehaviorSubject } from 'rxjs';

@Directive()
export abstract class BaseReport implements AfterViewInit {
  @ViewChildren(NsTemplate) templatesList: QueryList<NsTemplate>;
  public templates = new BehaviorSubject([]);
  public onToggleLeftPanel = new EventEmitter();
  public onLoadingLeftPanel = new EventEmitter();

  protected onViewInit = new EventEmitter();

  ngAfterViewInit(): void {
    setTimeout(() => {
      const emitedObject = this.templatesList.map(it => it);
      this.templates.next(emitedObject);
    }, 0);

    this.onViewInit.next();
    this.onViewInit.complete();
  }

  toggleLeftPanel() {
    this.onToggleLeftPanel.emit();
  }

  closeLeftPanel() {
    this.onToggleLeftPanel.emit(false);
  }

  openLeftPanel() {
    this.onToggleLeftPanel.emit(true);
  }

  loadingLeftPanel() {
    this.onLoadingLeftPanel.emit();
  }

  startLoadingLeftPanel() {
    this.onLoadingLeftPanel.emit(true);
  }

  stopLoadingLeftPanel() {
    this.onLoadingLeftPanel.emit(false);
  }

  orderedData(data: any[], parentKey = 'parent_id', dataKey = 'id', nombrenivel = 'label') {
    return data.reduce((arr, item) => {
      item.label = item[nombrenivel];
      if (!item[parentKey]) {
        arr = arr.concat(item);
      } else {
        const parent: any = data.find(k => k[dataKey] === item[parentKey]);
        if (parent && !parent.children) {
          parent.children = [];
        }
        parent && (parent.children = [...parent.children, item]);
      }
      return arr;
    }, []);
  }
}
