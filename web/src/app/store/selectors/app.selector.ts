import { CompanyComponent, CompanyConfiguration, CompanyModule, UserConfiguration } from '@app/common/interfaces';
import { AppState } from '@app/common/interfaces/store/app-state.interface';
import { StoreAppState } from '@app/common/interfaces/store/store-state.interface';
import { RecursiveMenu } from '@app/common/utils/recursive-menu.util';
import { RecursiveTree } from '@app/common/utils/recursive-tree.util';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const appState = createFeatureSelector<StoreAppState, AppState>('app');

export const selectCurrentModule = createSelector(appState, app => (app.currentModule || {} as CompanyModule));

export const selectUserConfiguration = createSelector(appState, app => (app.user_configuration || {} as UserConfiguration));
export const selectCompanyConfiguration = createSelector(appState, app => (app.company_configuration || {} as CompanyConfiguration));
export const selectUserPrivileges = createSelector(appState, app => app.user_privileges || []);
export const selectCompanyLevels = createSelector(appState, app => app.levels || []);

export const selectUserConfigurationKey = (key: string) => createSelector(selectUserConfiguration, result => result[key]);
export const selectCompanyConfigurationKey = (key: string) => createSelector(selectCompanyConfiguration, result => result[key]);

export const selectCompanyModules = createSelector(appState, app => app.company_modules || []);
export const selectCompanyComponents = createSelector(appState, app => app.company_components || []);

// export function select2CompanyComponents() {
//   return createSelector(appState, app => app.company_modules);
// }


export const selectCurrentModuleMenu = createSelector(appState, app => {
  if (!app.currentModule || !app.currentModule.id) {
    return [];
  }

  const components = (app.company_components || []).filter(cmp => cmp.module_id === app.currentModule.id && (cmp.isWindow || cmp.isMenu));
  return RecursiveMenu(components);
});

export const selectFullMenu = createSelector(selectCompanyModules, selectCompanyComponents, (modules: CompanyModule[], components: CompanyComponent[]) => {
  return modules.map(mod => {
    return {
      ...mod,
      children: RecursiveMenu(components.filter(c => c.module_id === mod.id))
    };
  });
});

export const selectFullTree = createSelector(selectCompanyModules, selectCompanyComponents, (modules: CompanyModule[], components: CompanyComponent[]) => {
  return modules.map(mod => {
    return {
      data: {
        ...mod,
        name: mod.label,
      },
      children: RecursiveTree(components.filter(c => c.module_id === mod.id))
    };
  });
});

export const selectUserAlias = createSelector(selectUserConfiguration, user => user.alias);

export const selectUser = createSelector(selectUserConfiguration, user => user);

export const selectComponentByPath = (paths: string[]) => createSelector(
  selectCompanyComponents, selectCompanyModules, (components: CompanyComponent[], modules: CompanyModule[]) => {
    const module = modules.find(m => m.path === paths.shift());
    // const component = components.filter(c => paths.includes(c.path));
    const component = paths.map(p => components.find(c => c.path === p));
    return [].concat(module, component);
  }
);
