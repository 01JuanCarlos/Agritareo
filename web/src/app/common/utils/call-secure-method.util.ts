/**
 * Ejecutar un metodo de forma segura.
 * @param obj El objeto en donde se encuentra el metodo
 * @param method Nombre del metodo que se desea ejecutar
 * @param args Los argumentos para pasar el metodo
 */
export function CallSecureMethod(obj: any, method: string, ...args: any[]) {
  if (obj && method in obj && 'function' === typeof obj[method]) {
    return obj[method].apply(obj, args);
  }
}
