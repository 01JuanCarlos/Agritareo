import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { NavItem } from '@app/common/interfaces/nav-item.interface';
import { UniqueID } from '@app/common/utils/unique-id.util';
import { TreeContainerLayoutComponent } from '@app/layouts/tree-container-layout/tree-container-layout.component';
import { AppService } from '@app/services/app.service';

@Component({
  selector: 'app-tree-layout',
  templateUrl: './tree-layout.component.html',
  styleUrls: ['./tree-layout.component.scss']
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeLayoutComponent implements OnInit, AfterViewInit {
  @ViewChild('dynamiccontent') content;
  items: any[] = [];
  fillingTimeout: any = null;
  title = '...';
  icon: string;
  showGlobalSaveBtn = false;

  constructor(private route: ActivatedRoute, private changeDectorRef: ChangeDetectorRef, private router: Router, private app: AppService) {
    this.setCurrentStatus(route.snapshot.firstChild);
    this.router.events.subscribe(revent => {
      if (revent instanceof NavigationEnd) {
        const tree = router.parseUrl(router.url);
        if (tree.fragment) {
          const element = document.querySelector('#' + tree.fragment);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
          }
        }
        this.setCurrentStatus(route.snapshot.firstChild);
      }
    });
  }

  setCurrentStatus(route: any) {
    if (route.data) {
      this.title = route.data.title;
      this.icon = route.data.icon;
    }
  }

  ngOnInit() {
    if (this.route && this.route.routeConfig) {
      if (this.route.routeConfig.children && this.route.routeConfig.children.length) {
        const children = this.route.routeConfig.children.filter(route => !route.redirectTo);
        this.items = this.items.concat(children.map(route => {
          return {
            path: route.path,
            ...route.data
          };
        }));
      }
    }
  }

  addChildren(parentPath: string, children: TreeContainerLayoutComponent) {
    const parent = this.items.find(it => it && it.path === parentPath);

    if (parent && !parent.filled) {
      parent.loading = true;
      parent.children = [].concat(parent.children || []);
      // Fill children menú
      parent.children.push({
        icon: children.icon,
        title: children.title,
        path: parentPath,
        fragment: children.fragment,
        id: UniqueID(),
        level: parent.level + 1,
        isForm: children.isForm,
        parentId: parent.id
      });

      clearTimeout(this.fillingTimeout);

      this.fillingTimeout = setTimeout(() => {
        parent.loading = false;
        parent.filled = true;
        parent.isParent = !!parent.children.length;
        this.changeDectorRef.detectChanges();
      }, 250);
    }
  }

  onSelectItem(item: NavItem) {
    console.log('onSelectItem', item);
    // this.showGlobalSaveBtn = this.items.some(it => (it.children || []).some(itc => !!itc.isForm));
    // console.log('Setear value ', item, this.showGlobalSaveBtn);
    if (item.parentId) {
      const parent = this.items.find(it => it.id === item.parentId);
      this.showGlobalSaveBtn = ((parent || {}).children || []).some(it => !!it.isForm);
      return;
    }
    this.showGlobalSaveBtn = (item.children || []).some((it: any) => !!it.isForm);
  }

  ngAfterViewInit() {
  }

  submitForm() {
    this.app.SaveTreeLayout.next(this.router.url);
  }

}
