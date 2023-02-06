import { CompanyComponent } from '@app/common/interfaces';
import { AppState } from '@app/common/interfaces/store/app-state.interface';
import { Action, createReducer, on } from '@ngrx/store';
import * as appActions from '../actions/app.action';
import { initialAppState } from '../state/app.state';

function ConcatComponentPath(cmp: CompanyComponent, data: CompanyComponent[], path = '') {
  const parent = data.find(c => c.id === cmp.parent_id);
  if (parent && cmp.parent_id) {
    path = ConcatComponentPath(parent, data, parent.path) + '/' + path;
  }
  return path;
}

export const reducer = createReducer(
  initialAppState,

  on(appActions.SetCorporations, (state, { corporations }) => ({ ...state, corporations })),
  on(appActions.SetLanguages, (state, { languages }) => ({ ...state, languages })),
  on(appActions.SetCurrentLanguage, (state, { language }) => ({ ...state, currentLanguage: language })),
  on(appActions.SetUserConfiguration, (state, { user_configuration }) => ({ ...state, user_configuration })),
  on(appActions.SetCompanyConfiguration, (state, { company_configuration }) => ({ ...state, company_configuration })),

  on(appActions.SetCompanyModules, (state, { modules }) => {
    return {
      ...state,
      company_modules: modules.map(mod => {
        return { isModule: !0, ...mod };
      })
    };
  }),
  // TODO: Añadir el id de empresa para evitar data basura
  // TODO: Crear funciones, evitar replicar codigo.
  on(appActions.SetCompanyComponents, (state, { components }) => {
    for (const mod of state.company_modules) {
      const filteredComponents = components.filter(c => c.module_id === mod.id);

      for (const cmp of filteredComponents) {
        cmp.moduleId = cmp.module_id;
        cmp.isMenu = 'MENU' === cmp.type;
        cmp.isTable = 'TABLA' === cmp.type;
        cmp.isForm = 'FORMULARIO' === cmp.type;
        cmp.isWindow = 'VENTANA' === cmp.type;

        if (cmp.isMenu || cmp.isWindow) {
          cmp.parentId = `${cmp.parent_id}`;
          cmp.fullPath = `/${mod.path}/` + ConcatComponentPath(cmp, components, cmp.path);
          cmp.fullPath = cmp.fullPath.replace(/\/+/, '\x2f');
          cmp.isParent = filteredComponents.some(c => c.parent_id === cmp.id);
          cmp.isChild = !!cmp.parent_id;
        }
      }
    }
    // FIXME: Verificar si ls UUId son los indentificadores unicos de componentes.
    const company_components = state.company_components;
    for (const component of components) {
      if (!company_components.some(cmp => cmp.uuid === component.uuid)) {
        company_components.push(component);
      }
    }

    return { ...state, company_components };
  }),

  on(appActions.SetUserPrivileges, (state, { privileges }) => {
    // FIXME: Verificar si ls UUId son los indentificadores unicos de privilegios.
    const user_privileges = state.user_privileges;
    for (const privilege of privileges) {
      if (!user_privileges.some(a => a.cid === privilege.cid)) {
        user_privileges.push(privilege);
      }
    }

    return { ...state, user_privileges };
  }),

  on(appActions.SetCurrentModule, (state, { module }) => {
    if ('number' === typeof module) {
      const mod = state.company_modules.find(m => m.id === module);
      return { ...state, currentModule: mod };
    }
    return { ...state, currentModule: module };
  }),

  on(appActions.ClearApp, state => {
    const langs = state.languages;
    const corporations = state.corporations;

    return {
      ...state,
      ...initialAppState,
      // currentModule: null,
      // user_configuration: null,
      // company_configuration: null,
      company_modules: [],
      company_components: [],
      user_privileges: [],
      languages: langs,
      corporations
    };
  }),

  on(appActions.SetCompanyLevels, (state, { levels }) => {
    return {
      ...state,
      levels
    }
  }),

);

export function appReducers(state: AppState | undefined, action: Action) {
  return reducer(state, action);
}
