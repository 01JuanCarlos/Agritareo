import { Component, HostBinding, Input, OnInit, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UrlEscape } from '@app/common/utils';
import { Id, Bool } from '@app/common/decorators';
import { TreeLayoutComponent } from '@app/layouts/tree-layout/tree-layout.component';

@Component({
  selector: 'ns-tree-container',
  template: `
    <ng-content></ng-content>
    <hr class="my-1">`,
  styleUrls: ['./tree-container-layout.component.scss']
})
export class TreeContainerLayoutComponent implements OnInit {
  @HostBinding('class.container')
  @HostBinding('class.d-block')
  @HostBinding('class.py-2') container = true;
  @HostBinding('attr.id') containerId: string;

  @Input() @Id id: string;
  @Input() title: string;
  @Input() icon: string;
  @Input() fragment: string;
  @Input() @Bool isForm = true;

  constructor(@Optional() private layout: TreeLayoutComponent, private route: ActivatedRoute) { }

  updateFragment(fragment: string) {
    this.fragment = fragment;
    this.id = fragment;
  }

  ngOnInit() {
    this.fragment = this.fragment || UrlEscape(this.title || '') || this.id;
    this.id = this.fragment;
    this.containerId = this.id;

    if (this.route.routeConfig && this.route.routeConfig.path) {
      if (this.layout && this.layout.addChildren) {
        this.layout.addChildren(this.route.routeConfig.path, this);
      }
    }
  }

}
