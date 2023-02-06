export interface CompanyComponent {
  description: string;
  id: string;
  label: string;
  module_id: number;
  moduleId: number;
  parent_id?: string;
  parentId?: string;
  children?: CompanyComponent[];
  isParent: boolean;
  isChild: boolean;
  type: string;
  path?: string;
  uuid: string;
  fullPath: string;
  parentPath: string;
  isMenu?: boolean;
  isTable?: boolean;
  isForm?: boolean;
  isWindow?: boolean;
  icon?: string;
  layout: 'TREE' | 'BASIC';
}
