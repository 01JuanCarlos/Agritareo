import { CompanyComponent } from '../interfaces';

/**
 * Crear menu recursivamente desde un arreglo de un solo nivel
 * @param data Lista de componentes flat
 * @param parentId Id del padre, inicialmente es undefined
 */
export function RecursiveTree(data: CompanyComponent[], parentId?: string) {
  const menu = [];
  for (const obj of data) {
    if (obj.parent_id === parentId) {
      const children = RecursiveTree(data, obj.id);
      if (children.length) {
        obj.isParent = true;
        obj.children = children;
      }
      menu.push(obj);
    }
  }

  return menu;
}
