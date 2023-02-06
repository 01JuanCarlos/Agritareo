import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TREE_TOOLBAR_ID } from '@app/config';
import { ToolAction } from '@app/config/toolbar-actions';
import { ToolBarService } from '@app/services/component-services/toolbar.service';
import { NsTreeService } from './ns-tree.service';

class NavigationModel {
  public children: NavigationModel[];
  [propName: string]: any;
}

@Component({
  selector: 'ns-tree',
  templateUrl: './ns-tree.component.html',
  styleUrls: ['./ns-tree.component.scss'],
  providers: [NsTreeService]
})

export class NsTreeComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('tree', { static: true }) tree: ElementRef;

  @Input() labelKey = 'label';
  // Primera opcion y segunda opcion
  @Input() iCollapse = 'icon-chevron-right' || 'icon-folder5';
  @Input() iExpand = 'icon-chevron-down' || 'icon-folder-open2';
  @Input() iSingle = 'icon-primitive-square' || 'icon-dash';
  @Input() componentId: string;
  @Input() controllerId: string;
  @Input() parentKey = 'idpadre';
  @Input() dataKey = 'id';

  @Output() addNode = new EventEmitter<object>();
  @Output() delNode = new EventEmitter<object>();
  @Output() selNode = new EventEmitter<object>();
  @Output() unselNode = new EventEmitter<object>();
  @Output() dblSelNode = new EventEmitter<object>();

  @Input() data: NavigationModel[] = [];

  public treeData: NavigationModel[] = [];

  public selectedItem;

  constructor(private toolbar: ToolBarService, private service: NsTreeService) { }

  ngOnInit() {
    const toolbar = this.toolbar.getSection(TREE_TOOLBAR_ID);
    toolbar.use(ToolAction.NEW, () => this.newItem());
    toolbar.use(ToolAction.DELETE, () => this.deleteItem());
    toolbar.use(ToolAction.EXPAND, () => this.expandAll());
    toolbar.use(ToolAction.COLLAPSE, () => this.collapseAll());

    toolbar.enable(ToolAction.NEW, true);
    toolbar.enable(ToolAction.COLLAPSE, true);
    toolbar.enable(ToolAction.EXPAND, true);

    this.componentId && this.loadData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.data?.currentValue?.length) {
      this.treeData = this.orderedData(changes.data.currentValue).filter(Boolean);
    }
  }

  orderedData(data: NavigationModel | any[]) {
    return data.reduce((arr, item) => {
      if (!item[this.parentKey]) {
        arr = arr.concat(item);
      } else {
        const parent: any = data.find(k => k[this.dataKey] === item[this.parentKey]);
        if (parent && !parent.children) {
          parent.children = [];
        }
        parent.children = [...parent.children, item];
      }
      return arr;
    }, []);
  }

  deleteItem() {
    this.delNode.emit(this.selectedItem);
  }

  newItem() {
    if (this.selectedItem) {
      this.addNode.emit({ title: this.selectedItem.nombre, data: this.selectedItem });
    } else {
      this.addNode.emit();
    }
  }

  loadData() {
    this.service.getTreeData(this.componentId).subscribe(({ data }) => {
      this.treeData = this.orderedData(data ?? []).filter(Boolean);
    });
  }

  collapseAll() {
    this.recursiveUl(this.tree, false);
  }

  expandAll() {
    this.recursiveUl(this.tree, true);
  }

  open(item) {
    this.selectedItem = item;
    this.dblSelNode.emit(this.selectedItem);
  }

  recursiveUl(li: any, action: boolean) {
    let list = null;
    if (li.nativeElement) {
      list = li.nativeElement.getElementsByTagName('ul');
      if (list) {
        Array.from(list).forEach(k => {
          if (action === true) {
            (k as HTMLElement).classList.remove('collapse');
          } else {
            (k as HTMLElement).classList.add('collapse');
          }
          const list2 = (k as HTMLElement).getElementsByTagName('li');
          Array.from(list2).forEach(k2 => {
            this.recursiveUl(k2, action);
          });
        });
      } else {
        return;
      }
    } else {
      return;
    }
  }

  selected(item: NavigationModel) {
    if (this.selectedItem !== item) {
      this.selectedItem = item;
      this.selNode.emit(item);
      this.toolbar.enable(TREE_TOOLBAR_ID, ToolAction.DELETE, true);
    } else {
      this.selectedItem = null;
      this.unselNode.emit(item);
      this.toolbar.enable(TREE_TOOLBAR_ID, ToolAction.DELETE, false);
    }
  }

  toggle(e) {
    const element = e.target.parentElement.children as HTMLCollection;
    const children = Array.from(element).find(item => item.nodeName.toLowerCase() === 'ul') as HTMLUListElement;
    const icon = Array.from(element).find(item => item.nodeName.toLowerCase() === 'i') as HTMLUListElement;
    this.toggleIcon(icon);
    if (children) {
      const find = Array.from(children.classList).find(childrenClass => childrenClass === 'collapse');
      if (find) {
        children.className = children.className.replace(' collapse', '');
      } else {
        children.className = children.className.concat(' collapse');
      }
    }
  }

  toggleIcon(icon: HTMLUListElement) {
    const iClass = Array.from(icon.classList).find(childrenClass => childrenClass === this.iCollapse || childrenClass === this.iExpand);
    if (iClass === this.iCollapse) {
      icon.className = icon.className.replace(this.iCollapse, this.iExpand);
    } else {
      icon.className = icon.className.replace(this.iExpand, this.iCollapse);
    }
  }

  ngOnDestroy() {
    this.toolbar.delSection(TREE_TOOLBAR_ID);
  }

}
