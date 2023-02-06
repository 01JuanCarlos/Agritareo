import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { PermissionService } from '@app/services/auth-services/permission.service';

@Directive({
  selector: '[disableIfUnauthorized]'
})
export class DisableIfUnauthorizedDirective implements OnInit {
  @Input('disableIfUnauthorized') permission: string;
  @Input() componentId: string;

  constructor(private el: ElementRef, private authorizationService: PermissionService) { }

  ngOnInit() {
    if (!this.authorizationService.hasPermission(this.componentId, this.permission)) {
      this.el.nativeElement.disabled = true;
    }
  }
}
