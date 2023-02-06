import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { PermissionService } from '@app/services/auth-services/permission.service';

@Directive({
  selector: '[hideIfUnauthorized]'
})
export class HideIfUnauthorizedDirective implements OnInit {
  @Input('hideIfUnauthorized') permission: string;
  @Input() componentId: string;
  private hasView = false;
  private snapshot: ActivatedRouteSnapshot;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authorizationService: PermissionService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    // console.log('Busqueda... ', {
    //   componentId: this.componentId,
    //   permission: this.permission,
    //   templateRef: this.templateRef,
    //   viewContainer: this.viewContainer
    // });
    this.snapshot = this.route.snapshot;
    const parentRoute = this.snapshot.parent;

    if (parentRoute && parentRoute.routeConfig) {
      const parentConfig = parentRoute.routeConfig || { path: '' };
      const hasPermission = this.authorizationService.hasPermission(this.componentId, this.permission, parentConfig.path);
      if (!this.hasView && hasPermission) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (hasPermission && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    }
  }
}
