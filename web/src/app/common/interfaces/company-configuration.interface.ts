import { ModuleParameter } from './module-parameter.interface';

export interface CompanyConfiguration {
  business_name: string;
  company_address: string;
  company_uid: string;
  company_id: number;
  profile_type_id: number;
  parameters: ModuleParameter[];
  settings: object;
}
