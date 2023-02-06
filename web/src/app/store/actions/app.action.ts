import { CompanyComponent, CompanyModule } from '@app/common/interfaces';
import { createAction, props } from '@ngrx/store';

export const SetCorporations = createAction(
  '[App] Set Corporations', props<{ corporations: any[] }>()
);

export const SetLanguages = createAction(
  '[App] Set Languages', props<{ languages: any[] }>()
);

export const SetCurrentLanguage = createAction(
  '[App] Set Current Language', props<{ language: string }>()
);

export const ChangeTheme = createAction(
  '[App] change theme', props<{ theme: string }>()
);

export const SetUserConfiguration = createAction(
  '[App] Set user configuration', props<{ user_configuration: any }>()
);

export const SetCompanyConfiguration = createAction(
  '[App] Set company configuration', props<{ company_configuration: any }>()
);

export const SetCompanyModules = createAction(
  '[App] Set company modules', props<{ modules: CompanyModule[] }>()
);

export const SetCompanyComponents = createAction(
  '[App] Set company components', props<{ components: CompanyComponent[] }>()
);

export const SetUserPrivileges = createAction(
  '[App] Set user privileges', props<{ privileges: any }>()
);

export const SetCompanyLevels = createAction(
  '[App] Set company levels', props<{ levels: any }>()
);

export const SetCurrentModule = createAction(
  '[App] Set current module', props<{ module: number | CompanyModule }>()
);

export const ClearApp = createAction('[App] clear app');
export const Logout = createAction('[App] logout app');
export const ToLoginPath = createAction('[App] to login path app');
export const ToSecurePath = createAction('[App] to logout path app');
export const Login = createAction('[App] login app');
