import { AfterViewInit, Component, ComponentFactoryResolver, ElementRef, Input, isDevMode, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { SidebarService } from '@app/services/component-services/sidebar.service';

@Component({
  selector: 'ns-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit {
  @ViewChild('development', { static: true, read: ViewContainerRef })
  developmentContainer: ViewContainerRef;

  @ViewChild('chat', { static: true, read: ViewContainerRef })
  chatContainer: ViewContainerRef;

  @ViewChild('activity', { static: true, read: ViewContainerRef })
  activityContainer: ViewContainerRef;

  // @ViewChild(ActivityListComponent, { static: true }) activity: ActivityListComponent;
  @Input() isOnRTL: boolean;
  @Input() opened: boolean;

  public isDevMode = false;
  public tabsComponents = [];

  constructor(
    private elRef: ElementRef,
    private cfr: ComponentFactoryResolver,
    private service: SidebarService
  ) {
    this.isDevMode = isDevMode();
    this.service.onStatus.subscribe(x => {
      this.opened = this.service.isOpen;
      if (this.opened && void 0 === this.service.selectedTabIndex) {
        this.createComponent(0);
      }
    });
  }

  ngOnInit() {
    this.tabsComponents = [
      { containter: this.chatContainer, file: `ns-chat` },
      { containter: this.activityContainer, file: `activity-list` }
    ];

    if (this.isDevMode) {
      this.tabsComponents.unshift(
        { containter: this.developmentContainer, file: `ns-development-tab` }
      );
    }

  }

  createComponent(index: number) {
    if (this.service.isOpen && index in this.tabsComponents) {
      const tab = this.tabsComponents[index];
      if (tab && tab.containter) {
        import(`./${tab?.file}/${tab?.file}.component`).then(cmpImport => {
          const [cmpKey] = Object.keys(cmpImport);
          const component = this.cfr.resolveComponentFactory(cmpImport[cmpKey]);
          const componentRef = tab.containter.createComponent(component);
          componentRef.changeDetectorRef.detectChanges();
          delete this.tabsComponents[index];
        });
      }
    }
  }

  ngAfterViewInit() {
    const self = this;
    $(this.elRef.nativeElement)
      .find('a[data-toggle="tab"]')
      .on('shown.bs.tab', function(e) {
        const index = $(this).parent().index();
        self.createComponent(index);
        self.service.onTab(index);
      });
  }
}
