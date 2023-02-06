import { AppState } from '@app/common/interfaces/store';

export const initialAppState: AppState = {
  languages: [],
  corporations: [],
  news: [],
  socialNetworks: [],
  currentLanguage: 'es',
  currentModule: null,
  company_configuration: {
    business_name: 'Nisira ERP',
    company_uid: '',
    company_address: '',
    company_id: 0,
    profile_type_id: 0,
    parameters: [],
    settings: null
  },
  company_components: [],
  company_modules: [],
  user_configuration: {
    settings: null,
    alias: 'Guest',
    email: '',
    profile: '',
    profile_id: 0,
    user_id: 0
  },
  user_privileges: [],
  currentTheme: 'light',
  levels: []
};
