import { AfterContentInit, Component, ContentChildren, EventEmitter, forwardRef, Input, OnInit, Output, QueryList, TemplateRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Bool } from '@app/common/decorators';
import { SetSecureProperty, UniqueID } from '@app/common/utils';
import { NsTemplate } from '@app/directives/ns-template.directive';

interface ItemList {
  id: string;
  label: string;
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean;
}

@Component({
  selector: 'ns-group-list',
  templateUrl: './ns-group-list.component.html',
  styleUrls: ['./ns-group-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NsGroupListComponent),
      multi: true
    }
  ]
})
export class NsGroupListComponent implements OnInit, ControlValueAccessor, AfterContentInit {
  public data: ItemList[] = [];
  @Input() title: string;
  @Input() @Bool checkbox: boolean;
  @Input() @Bool removable: boolean;
  @Input() @Bool collapsible: boolean;
  @Input() dataKey = 'id';
  @Input() labelKey = 'label';
  @Input() checkedKey = 'checked';
  @Input() disabled: boolean;

  @Output() deletedItem = new EventEmitter<string | number>();

  @ContentChildren(NsTemplate) templates: QueryList<NsTemplate>;
  @Input() set items(value: ItemList[]) {
    value = SetSecureProperty(value, 'checked', (it: ItemList) => it[this.checkedKey]);
    this.data = value.map(it => {
      if (!('id' in it)) {
        it = SetSecureProperty(it, 'id', UniqueID);
      }
      return it;
    });
  }

  get items(): ItemList[] {
    return this.data;
  }

  public itemTpl: TemplateRef<any>;
  public value = null;
  private onChange = (_: any) => { };
  private onTouched = (_: any) => { };

  constructor() { }

  ngOnInit() { }

  ngAfterContentInit() {
    this.templates.forEach(template => {
      if (template.getType() === 'detail') {
        this.itemTpl = template.template;
      }
    });
  }

  trackByFn(index: number, item: any) {
    return index + item.id;
  }

  get totalSelected() {
    return this.items.reduce((a, b) => a + (+!!(this.checkbox ? b.checked : b.selected)), 0);
  }

  selectItemList(item: any) {
    if (item && 'object' === typeof item) {
      for (const it of this.items) {
        it.selected = item.id === it.id;
      }
    }
  }

  onCheckboxChange(item: any) {
    if (item && 'object' === typeof item) {
      item.checked = !(!!item.checked);
      item[this.checkedKey] = item.checked;

      if (item.checked) {
        this.onChange(this.items);
      }
    }
  }

  writeValue(value: any): void {
    this.items = value || [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onRemoveItem(it: number) {
    this.data.splice(it, 1);
    this.deletedItem.emit(it);
  }
}
