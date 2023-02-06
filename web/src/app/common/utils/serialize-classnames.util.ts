import { ParseClassNames } from './parse-classnames.util';
/**
 * Convierte un objeto o una lista de nombres de clases a una cadena seguido de espacios.
 * @param classNames Una lista con los nombres de clases o un objeto
 */
export function SerializeClassNames(classNames: object | string[]) {
  classNames = Array.isArray(classNames) ? ParseClassNames(classNames) : classNames;
  return Object.keys(classNames).reduce((o, k) => {
    return k && (k in classNames) && !!classNames[k] ? o + ' ' + k : o;
  }, '').trim();
}
