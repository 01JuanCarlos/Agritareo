export interface NavItem {
  header?: boolean;
  children?: NavItem[];
  title: string;
  divider?: boolean;
  loading?: boolean;
  active?: boolean;
  disabled?: boolean;
  expanded?: boolean;
  path?: string;
  icon?: string;
  fragment?: string;
  badge?: string;
  badgeClass?: string;
  id: string;
  level: number;
  isFirstLevel: boolean;
  isParent: boolean;
  parentId?: string;
  index: number;
}
