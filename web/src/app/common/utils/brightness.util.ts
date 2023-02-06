export function Brightness(hex: string) {
  const color = +('0x' + hex.slice(1).replace(hex.length < 5 && /./g, '$&$&'));
  // tslint:disable-next-line: no-bitwise
  const r = color >> 16;
  // tslint:disable-next-line: no-bitwise
  const g = color >> 8 & 255;
  // tslint:disable-next-line: no-bitwise
  const b = color & 255;

  const hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
  );

  return hsp > 127.5 ? 'light' : 'dark';

}
