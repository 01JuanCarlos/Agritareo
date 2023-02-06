import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { Bool } from '@app/common/decorators';
import { NavItem } from '@app/common/interfaces/nav-item.interface';
import { UniqueID } from '@app/common/utils';
import { endsWith } from 'lodash-es';

const NAVITEMCLASS = 'nav-item';
const NAVSUBMENUCLASS = 'nav-group-sub';

@Component({
  selector: 'ns-nav',
  templateUrl: './ns-nav.component.html',
  styleUrls: ['./ns-nav.component.scss']
})
export class NsNavComponent implements OnInit {
  @Input() type = 'accordion'; // collapsible, accordion
  @Input() @Bool bordered: boolean;
  @Input() @Bool rightIcons: boolean;
  @Input() navSlidingSpeed = 250;
  @Input() items: NavItem[] = [];
  @Input() itemSelect = new EventEmitter<{ item: NavItem, index: number, parent: NavItem }>();

  constructor() { }

  ngOnInit() {
    this.items = this.parseNavProperties(this.items);
  }

  private parseNavProperties(items: NavItem[], level = 0) {
    return items.map((it, index) => {
      it.id = it.id || UniqueID();
      it.level = level;
      it.isFirstLevel = 0 === level;
      it.index = index;

      if (it && it.children && it.children.length) {
        it.children = this.parseNavProperties(it.children, ++level);
        it.isParent = true;
      }
      return it;
    });
  }

  isFragmentActive(fragment: string) {
    return endsWith(window.location.href, '#' + fragment);
  }

  get __rootClass() {
    return {
      'nav-sidebar-bordered': this.bordered,
      'nav-sidebar-icons-reverse': this.rightIcons
    };
  }

  hasChildren(item: NavItem) {
    return item && item.children && item.children.length;
  }

  toggleChildren(target: HTMLElement, item: NavItem, itemSiblings: NavItem[]) {
    if (item && !item.disabled && this.hasChildren(item) && target) {
      if (target.nextElementSibling) {
        $(target.nextElementSibling)[item.expanded ? 'slideUp' : 'slideDown'](this.navSlidingSpeed);
        item.expanded = !item.expanded;

        if (this.type === 'accordion') {
          const $siblings = $(target).parent(`.${NAVITEMCLASS}`).siblings(`:has(.${NAVSUBMENUCLASS})`);
          for (let i = 0, len = itemSiblings.length; i < len; i++) {
            if (this.hasChildren(itemSiblings[i]) && item !== itemSiblings[i]) {
              itemSiblings[i].expanded = false;
            }
          }
          $siblings.children(`.${NAVSUBMENUCLASS}`).slideUp(this.navSlidingSpeed);
        }
      }
    }
  }

  onItemClick(item: NavItem, itemSiblings: NavItem[], target: HTMLElement, e: Event) {
    e.preventDefault();
    // setTimeout(() => {
    this.toggleChildren(target, item, itemSiblings);
    this.itemSelect.emit({ item, index: item.index, parent: null });
    // });
  }

  trackByFn(index: number, item: NavItem) {
    return item.title;
  }

}
