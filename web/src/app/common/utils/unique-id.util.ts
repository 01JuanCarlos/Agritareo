/**
 * Generar un ID unico
 */
export function UniqueID() {
  function chr4() {
    return Math.random().toString(16).slice(-4);
  }

  const UUID_VERSION = 4;

  return chr4() + chr4() +
    '-' + chr4() +
    '-' + UUID_VERSION + chr4().slice(1) +
    // tslint:disable-next-line: no-bitwise
    '-' + (((0 | Math.random() * 16) & 0x3) | 0x8).toString(16) + chr4().slice(1) +
    '-' + chr4() + chr4() + chr4();
}
