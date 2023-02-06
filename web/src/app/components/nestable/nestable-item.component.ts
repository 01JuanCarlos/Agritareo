import { Component, HostBinding, Input, OnInit, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { Id } from '@app/common/decorators';

export interface NestableItem {
  id: string;
  label: string;
  icon?: string;
  tooltip?: string;
  target?: string;
  link?: string;
  children?: NestableItem[];
}

@Component({
  selector: '[ns-nestable-item]',
  template: `
    <div class="dd-handle">
      <div class="dd-text-container">
      <div class="header-elements-inline">
        <div class="text-container">
          <i *ngIf="icon" [ngClass]="icon"></i>
          {{label}}
        </div>
        <div class="header-elements dd-nodrag">
            <div class="list-icons">
                <a href="#" class="list-icons-item" (click)="$event.preventDefault();addItemChildren()"><i class="icon-plus3"></i></a>
                <a href="#" class="list-icons-item" (click)="$event.preventDefault();editItem()"><i class="icon-pencil6"></i></a>
                <a href="#" class="list-icons-item" (click)="$event.preventDefault();deleteItem(label)"><i class="icon-trash"></i></a>
                <!--<div class="list-icons-item dropdown">
                  <a href="#" class="list-icons-item dropdown-toggle" data-toggle="dropdown"><i class="icon-github4"></i></a>
                  <div class="dropdown-menu dropdown-menu-right">
                    <a href="#" class="dropdown-item">Action</a>
                    <a href="#" class="dropdown-item">Another action</a>
                    <a href="#" class="dropdown-item">Something else here</a>
                    <div class="dropdown-divider"></div>
                    <a href="#" class="dropdown-item">One more separated line</a>
                  </div>
                </div>-->
              </div>
            </div>
          </div>
      </div>
    </div>
    <ng-content></ng-content>
  `,
  styleUrls: ['./nestable-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NestableItemComponent implements OnInit {
  @HostBinding('class.dd-item') isNestableItem = true;
  @HostBinding('class.dd-empty') isNestableItemEmpty;
  @HostBinding('class.dd-placeholder') isNestableItemPlaceholder;
  @HostBinding('attr.data-id') itemId: string;

  @Input() label: string;
  @Input() icon: string;
  @Input() link: string;
  @Input() target: string;
  @Input() tooltip: string;
  @Input() idnivelconfiguracion;
  @Input() parentId: string;
  @Input() @Id id: string;
  @Input() children: NestableItemComponent[];
  @Input() data: any;
  @Input() dataKey = 'id';

  // PASANDO ID DEL MODULO
  @Input() idmodulo: string;
  /** Event editar item. */
  @Output() newItem = new EventEmitter<any>();
  @Output() edtItem = new EventEmitter<any>();
  @Output() delItem = new EventEmitter<any>();
  @Output() addItem = new EventEmitter<any>();


  constructor() { }

  ngOnInit() {
    this.itemId = this.data[this.dataKey] || this.id;
  }

  addItemChildren() {
    this.newItem.emit(this.toObject());
  }
  editItem() {
    this.edtItem.emit(this.toObject());
  }
  deleteItem(title: string) {
    const r = confirm('¿Eliminar Item? ' + title);
    if (r === true) {
      this.delItem.emit(this.toObject());
    }
  }
  toObject() {
    return {
      title: this.label,
      icon: this.icon,
      link: this.link,
      target: this.target,
      parentId: this.parentId,
      module_id: this.idmodulo, // TODO: Camel case!
      tooltip: this.tooltip,
      id: this.id,
      idnivelconfiguracion: this.idnivelconfiguracion,
      children: this.children || [],
      ... this.data
    };
  }
}
