import { GetSecureProperty } from './get-secure-property.util';

/**
 * Obtener propiedades desde la metadata de un objeto.
 * @param target Objeto desde donde se obtendrá las propiedades
 * @param property Clave de la propiedad
 * @param def Valor por defecto en caso no exista la propiedad
 */
export function GetMetaProperty(target: any, property: string, def?: unknown) {
  const meta = target || { constructor: {} };
  return GetSecureProperty({ ...meta.constructor }, property, def);
}
