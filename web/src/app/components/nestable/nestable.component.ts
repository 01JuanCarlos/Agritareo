import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  Renderer2,
  OnChanges,
  SimpleChanges,
  NgZone
} from '@angular/core';
import 'nestable2';
import { NestableItemComponent, NestableItem } from './nestable-item.component';

@Component({
  selector: 'ns-nestable',
  templateUrl: './nestable.component.html',
  styleUrls: ['./nestable.component.scss']
})
export class NestableComponent implements OnInit, AfterViewInit, OnChanges {
  @HostBinding('class.dd') nestableClass = true;
  @Input() data: NestableItem[] = [];
  @Input() label: string;
  @Input() beforeDragStop: (mainElement, element, toElement, base) => boolean;
  @Input() dataKey = 'id';
  isToggled: boolean;

  @Output() newItem = new EventEmitter();
  @Output() edtItem = new EventEmitter();
  @Output() dltItem = new EventEmitter();
  @Output() addItem = new EventEmitter();
  @Output() dragItem = new EventEmitter();

  constructor(private el: ElementRef, private render: Renderer2, private zone: NgZone) {
    // FIXME: Revisar expandible
    $(() => {
      this.zone.runOutsideAngular(() => {
        $(this.el.nativeElement).nestable({
          scroll: true,
          maxDepth: 10,
          beforeDragStop: (a, b, c) => {
            // console.log('Se lanzó el evento beforeDragStop');
            const d = $(b).data();
            const e = $(c).parent().data();
            const element = this.recursiveSearch(this.data, d.id);
            const toElement = this.recursiveSearch(this.data, e.id);
            if (this.beforeDragStop) {
              return this.beforeDragStop(this.data, element, toElement, !!e.nestableId);
            }
          }
        });
      });
    });
  }

  ngOnInit() { }

  get isEmpty(): boolean {
    return !(this.data && this.data.length > 0);
  }

  addItemChildren(it: any) {
    this.newItem.emit(it);
  }

  editarItem(it: any) {
    this.edtItem.emit(it);
  }

  deleteItem(item: NestableItemComponent) {
    this.dltItem.emit(item.id);
    $('.dd').nestable('remove', item.id);
  }

  collapseAll() {
    this.isToggled = !this.isToggled;
    if (this.isToggled) {
      $(this.el.nativeElement).nestable('collapseAll');
    } else {
      $(this.el.nativeElement).nestable('expandAll');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // $(this.el.nativeElement).nestable('destroy');
    // const { previousValue, currentValue } = changes.data || {};
    // if ( previousValue && currentValue && previousValue.length && currentValue.length && previousValue.length !== currentValue.length) {
    //   $(() => {
    //     $(this.el.nativeElement).nestable({
    //       scroll: true,
    //       maxDepth: 10,
    //       beforeDragStop: (a, b, c) => {
    //         // console.log('Se lanzó el evento beforeDragStop');
    //         const d = $(b).data();
    //         const e = $(c).parent().data();
    //         const element = this.recursiveSearch(this.data, d.id);
    //         const toElement = this.recursiveSearch(this.data, e.id);
    //         if (this.beforeDragStop) {
    //           return this.beforeDragStop(this.data, element, toElement, !!e.nestableId);
    //         }
    //       }
    //     });
    //   });
    // }
  }

  ngAfterViewInit() { }

  serialize() {
    return $(this.el.nativeElement).nestable('serialize');
  }

  recursiveSearch(data: any[], id: string) {
    let element = null;
    for (const it of data) {
      if (it[this.dataKey] === id) {
        element = it;
        break;
      }
      if (it.children && it.children.length && !element) {
        element = this.recursiveSearch(it.children, id);
      }
    }
    return element;
  }
}
