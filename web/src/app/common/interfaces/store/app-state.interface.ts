import { CompanyComponent } from '../company-component.interface';
import { CompanyConfiguration } from '../company-configuration.interface';
import { CompanyModule } from '../company-module.interface';
import { UserConfiguration } from '../user-configuration.interface';

export interface AppState {
  languages: any[];
  currentLanguage: string;
  currentTheme: string;
  currentModule: CompanyModule;
  news: any[];
  socialNetworks: any[];
  corporations: any[];
  company_configuration: CompanyConfiguration;
  company_modules: CompanyModule[];
  company_components: CompanyComponent[];
  user_configuration: UserConfiguration;
  user_privileges: any[];
  levels: any[];
}
