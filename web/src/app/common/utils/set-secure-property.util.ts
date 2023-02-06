/**
 * Establecer valor a una propiedad de forma segura desde un objeto.
 * @param obj Objeto desde donde se va a setear las propiedades
 * @param property La propiedad que desea setear
 * @param value El valor que se desea setear al objeto
 */
export function SetSecureProperty<T>(obj: T, property: string, value: unknown) {
  [].concat(obj).forEach(e => {
    if (e && !!property && 'object' === typeof e) {
      e[property] = 'function' === typeof value ? value.call(value, e) : value;
    }
  });
  return obj;
}
