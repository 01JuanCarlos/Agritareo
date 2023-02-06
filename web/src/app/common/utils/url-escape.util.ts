/**
 * Reemplazar y escapar caracteres de url
 * @param str Cadena para escapar
 */
export function UrlEscape(str: string) {
  // tslint:disable-next-line: object-literal-key-quotes
  const v = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' };
  str = str.replace(new RegExp(`[${Object.keys(v)}]`, 'g'), (search: string, index: number) => {
    return v[search];
  });
  return str.replace(/[^\w]/g, '-').toLocaleLowerCase();
}
