/**
 * Genera un hash tipo checksum para la data
 * @param str Data para generar el hash
 */
export function HashCode(str: string) {
  const hash = (str || '').split('').reduce((h: number, k: string) => {
    const code = k.charCodeAt(0);
    // tslint:disable-next-line: no-bitwise
    return (((h << 5) - h) + code) | 0; // bot bitwise ((h * 31) + code)
  }, 0);
  return btoa(String(hash));
}
