/**
 * Obtener una propiedad de forma segura desde un objeto.
 * @param obj Objeto desde donde se va a obtener las propiedades
 * @param property La propiedad que desea obtener
 */
export function GetSecureProperty(obj: object, property: string, def?: unknown) {
  return obj && 'object' === typeof obj ? obj[property] : def;
}
