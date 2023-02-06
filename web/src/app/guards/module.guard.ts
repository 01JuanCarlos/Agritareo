import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanLoad, Route, RouterStateSnapshot, UrlSegment } from '@angular/router';
import { LOGIN_PATH } from '@app/common/constants';
import { AppService } from '@app/services/app.service';
import { PermissionService } from '@app/services/auth-services/permission.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModuleGuard implements CanLoad {
  constructor(
    private location: Location,
    private app: AppService,
    private permission: PermissionService
  ) { }

  canLoad(route: Route & { data: any }, segments: UrlSegment[]): boolean | Observable<boolean> | Promise<boolean> {
    if (this.app.user.isAuthenticated) {
      if (!this.app.initialAppLoaded) {
        return this.app.waitInitialData();
      }
      // TODO: Realizar una solicitud, para verificar permiso al módulo y estado del módulo.
      return true;
    }

    if (this.location.path() !== LOGIN_PATH) {
      this.app.user.logout();
    }
    return false;
  }

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<Observable<boolean> | Promise<boolean> | boolean> {
    await this.app.waitInitialData().toPromise();
    const perm = await this.hasRequiredModulePermission(next.routeConfig.path);

    return perm;
  }

  hasRequiredModulePermission(path: string) {
    if (this.permission.isLoadedModule(path)) {
      return this.permission.hasModulePermission(path);
    } else {
      return new Promise<boolean>((resolve, reject) => {
        this.permission.initializePermissions(path).then(() => {
          resolve(this.permission.hasModulePermission(path));
        }).catch(err => {
          resolve(false);
        });
      });
    }
  }
}
