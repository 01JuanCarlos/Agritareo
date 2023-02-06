import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Bool } from '@app/common/decorators';
import { NavItem } from '@app/common/interfaces/nav-item.interface';
import { UniqueID } from '@app/common/utils/unique-id.util';
import { endsWith } from 'lodash-es';

const NAVCLASS = 'nav-sidebar';
const NAVITEMCLASS = 'nav-item';
const NAVITEMOPENCLASS = 'nav-item-open';
const NAVLINKCLASS = 'nav-link';
const NAVSUBMENUCLASS = 'nav-group-sub';
const NAVSLIDINGSPEED = 250;

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  @Input() type = 'accordion'; // collapsible, accordion
  @Input() @Bool bordered: boolean;
  @Input() @Bool rightIcons: boolean;
  @Input() navSlidingSpeed = NAVSLIDINGSPEED;
  @Input() items: NavItem[] = [];
  @Output() itemSelect = new EventEmitter<any>();
  @Output() indexSelect = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    this.items = this.parseNavProperties(this.items);
    // setInterval(() => {
    //   const $navSidebarMini = $('.sidebar-xs').not('.sidebar-mobile-main').find('.sidebar-main .nav-sidebar').children('.nav-item');
    //   console.log({ $navSidebarMini })
    // }, 1e3);
  }

  private parseNavProperties(items: NavItem[], level = 0) {
    return items.map(it => {
      it.id = it.id || UniqueID();
      it.level = level;
      it.isFirstLevel = 0 === level;

      if (it && it.children && it.children.length) {
        it.children = this.parseNavProperties(it.children, ++level);
        it.isParent = true;
      }
      return it;
    });
  }

  get __rootClass() {
    return {
      'nav-sidebar-bordered': this.bordered,
      'nav-sidebar-icons-reverse': this.rightIcons
    };
  }

  isFragmentActive(fragment: string) {
    return endsWith(window.location.href, '#' + fragment);
  }

  hasChildren(item: NavItem) {
    return item && item.children && item.children.length;
  }

  onItemClick(item: NavItem, itemSiblings: NavItem[], target: HTMLElement, e: Event) {
    e.preventDefault();
    setTimeout(() => {
      this.toggleChildren(target, item, itemSiblings);
      this.itemSelect.emit(item);
    });
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

  trackByFn(index: number, item: NavItem) {
    return item.title;
  }
}
