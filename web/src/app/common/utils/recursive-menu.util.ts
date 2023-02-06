import { CompanyComponent } from '../interfaces';
/**
 * Crear menu recursivamente desde un arreglo de un solo nivel
 * @param data Lista de componentes flat
 * @param parentId Id del padre, inicialmente es undefined
 */
export function RecursiveMenu(data: CompanyComponent[], parentId?: string, path?: string) {
  const menu = [];
  for (const obj of data) {
    const item = { ...obj };
    if (item.parent_id === parentId) {
      if (!!path) {
        item.path = `${path}/${item.path}`;
      }

      const children = RecursiveMenu(data, item.id, item.path);

      if (children.length) {
        item.isParent = true;
        item.children = children;
      }
      menu.push(item);
    }
  }

  return menu;
}
