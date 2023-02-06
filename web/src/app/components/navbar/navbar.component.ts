import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { WSSERVER } from '@app/common/constants';
import { StoreAppState } from '@app/common/interfaces/store/store-state.interface';
import { SidebarService } from '@app/services/component-services/sidebar.service';
import { ToolBarService } from '@app/services/component-services/toolbar.service';
import { AppWsClientService } from '@app/services/util-services/app-ws-client.service';
import { AppActions } from '@app/store/actions';
import * as appSelector from '@app/store/selectors/app.selector';
import { GetWindows } from '@app/store/selectors/wintab.selector';
import { select, Store } from '@ngrx/store';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit, AfterViewInit {
  @Output() moreOptionsClick = new EventEmitter();
  @Output() modulesClick = new EventEmitter();
  @Output() userClick = new EventEmitter();

  @Output() moreOptions = new EventEmitter();

  @Output() openTabsClick = new EventEmitter();



  shrinkSidebar = false;
  moduleMenu = [];
  speechStatus = false;
  isFullscreen = false;
  userAlias$
  modules$
  fullMenu$
  currentModule$
  viewsData$
  constructor(
    private store: Store<StoreAppState>,
    public toolbar: ToolBarService,
    private sidebar: SidebarService,
    private wss: AppWsClientService
    ) {
      this.store.pipe(select(appSelector.selectCurrentModuleMenu)).subscribe(data => {
        this.moduleMenu = data;
      });

      this.wss.on(WSSERVER.NOTIFY).subscribe(message => {
        console.log({ message });
    });
  }

  ngOnInit() {
    this.userAlias$ = this.store.pipe(select(appSelector.selectUserAlias));
    this.modules$ = this.store.pipe(select(appSelector.selectCompanyModules));
    this.fullMenu$ = this.store.pipe(select(appSelector.selectFullMenu));
    this.currentModule$ = this.store.pipe(select(appSelector.selectCurrentModule));
    this.viewsData$ = this.store.pipe(select(GetWindows));
    $('.navbar').on('hide.bs.dropdown', (e: any) => {
      if (e.clickEvent) {
        e.preventDefault();
      }
    });
  }

  ngAfterViewInit() {
    const ngThis = this;
    setTimeout(() => {
      $('.dropdown-submenu .navbar-nav-link').on('click', function (e) {
        e.preventDefault();
        this.classList.toggle('active');
        $(this.closest('.dropdown-submenu')).find('.dropdown-menu')[0].classList.toggle('show');
        e.stopPropagation();
      });
    }, 0);

    $('.custom-link').on('click', function () {
      setTimeout(() => {
        ngThis.markDropdown();
      }, 0);
    });

    setTimeout(() => {
      this.markDropdown();
    }, 0);
  }

  markDropdown() {
    $('.dropdown-submenu .navbar-nav-link').each(function (element) {
      // this.classList.remove('active');
      $(this.closest('.dropdown-submenu')).find('.dropdown-menu')[0].classList.remove('show');
    });

    $('.custom-link').each(function (element) {
      if (this.classList.contains('active')) {
        const dropdownMenu = $(this).closest('.dropdown-menu');
        dropdownMenu.addClass('show');
        $(dropdownMenu.closest('.dropdown-submenu')[0]).find('.navbar-nav-link').addClass('active');
      }
    });
  }

  openSidebar() {
    this.sidebar.toggle();
  }

  // get homeModule() {
  //   return this.modules$.pipe(
  //     map(o => o.filter(m => true === m.home || '/' === m.path))
  //   );
  // }

  hasChildren(it: any) {
    return it && it.children && it.children.length;
  }

  isParent(it: any): boolean {
    return !!this.hasChildren(it);
  }

  logout() {
    this.store.dispatch(AppActions.Logout());
  }

  openTabs() {
    this.openTabsClick.emit();
  }

  onTabsHover(target: HTMLElement) {
    const ddbtn = target.querySelector('a[data-toggle="dropdown"]');
    $(ddbtn).dropdown('toggle');
  }
}
