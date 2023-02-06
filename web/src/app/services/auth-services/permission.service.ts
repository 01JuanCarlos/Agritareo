import { Injectable, isDevMode } from '@angular/core';
import { INITIAL_API_PATH, PKEY } from '@app/common/constants';
import { CompanyComponent, CompanyModule } from '@app/common/interfaces';
import { StoreAppState } from '@app/common/interfaces/store';
import { SetCompanyComponents, SetCompanyModules, SetUserPrivileges, SetCompanyLevels } from '@app/store/actions/app.action';
import { selectCompanyComponents, selectCompanyModules, selectUserPrivileges, selectCompanyLevels } from '@app/store/selectors/app.selector';
import { select, Store } from '@ngrx/store';
import { AppHttpClientService } from '../util-services/app-http-client.service';
import { BlockUIService, BlockUIType } from '../util-services/blockui.service';
import { PersistenceService } from '../util-services/persistence.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private loadedModules = [];
  private permissions = [];
  private components: CompanyComponent[] = [];
  private modules: CompanyModule[] = [];

  constructor(
    private store: Store<StoreAppState>,
    private http: AppHttpClientService,
    private blockui: BlockUIService,
    private persistence: PersistenceService
  ) {
    this.store.pipe(select(selectUserPrivileges)).subscribe(privileges => {
      this.permissions = privileges;
    });

    this.store.pipe(select(selectCompanyComponents)).subscribe(components => {
      this.components = components;
    });

    this.store.pipe(select(selectCompanyModules)).subscribe(modules => {
      this.modules = modules;
    });
  }

  cleanPermissions() {
    this.loadedModules = [];
    this.permissions = [];
    this.components = [];
    this.modules = [];
  }

  isLoadedModule(path: string) {
    return this.loadedModules.includes(path);
  }

  getModuleId(path: string) {
    const mod = this.modules.find(m => m.path === path);
    return mod ? mod.id : null;
  }

  componentExists(path: string) {
    return this.components.some(c => c.path === path);
  }

  initializePermissions(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.getModuleId(path)) {
        if (this.componentExists(path)) {
          this.loadedModules.push(path);
          return resolve(true);
        }
      }
      this.blockui.show('Obteniendo información de Módulo');
      this.http.post(INITIAL_API_PATH, {
        module: String(this.getModuleId(path) || path),
        load_module: !0,
        time: Date.now()
      }).subscribe({
        next: result => {
          const { components = [], privileges = [], modules = [], levels = [] } = result || {};
          if (components.length && components.length) {
            // Store component and privileges
            // this.store.dispatch(SetCompanyModules({ modules }));
            this.store.dispatch(SetCompanyComponents({ components }));
            this.store.dispatch(SetUserPrivileges({ privileges }));
            this.store.dispatch(SetCompanyLevels({ levels }));
            this.loadedModules.push(path);
            resolve(result);
          }
        },
        error: (err: any) => {
          this.blockui.setMessage('Error cargando información del módulo.', BlockUIType.ERROR);
          reject(err);
        },
        complete: () => this.blockui.hide()
      });
    });
  }

  hasModulePermission(path: string): boolean {
    if (!this.getModuleId(path)) {
      return this.componentExists(path);
    }
    return this.getModuleId(path) && this.isLoadedModule(path);
  }

  hasPermission(componentId: string, privilege: string, parentPath?: string): boolean {
    if (isDevMode() && !this.persistence.get(PKEY.PRIVIGELES)) {
      return true;
    }

    let component = null;

    if (!componentId && !!parentPath) {
      component = this.components.find(cmp => cmp.path === parentPath);
    } else {
      component = this.components.find(cmp => cmp.id === componentId);
    }

    if (!!component && component.id) {
      const privileges = this.permissions.find(priv => priv.cid === component.id);
      const dprivileges = privileges ? (privileges.dprivileges || '').split(',') : [];
      return dprivileges.some(priv => priv === privilege);
    }
  }
}
