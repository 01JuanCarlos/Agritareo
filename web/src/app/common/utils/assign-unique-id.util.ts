import { UniqueID } from './unique-id.util';
import { SetSecureProperty } from './set-secure-property.util';
/**
 * Crear un unico id por cada registro de una lista o solo a un objeto.
 * @param obj Un Objeto o lista de objetos.
 */
export function AssignUniqueId<T>(obj: T): T {
  return SetSecureProperty(obj, 'id', UniqueID); // [].concat(obj).map(e => ({ ...e, id: UniqueID() }));
}
