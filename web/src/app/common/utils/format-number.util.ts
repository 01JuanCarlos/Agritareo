/**
 * Formatear numeros para llenar ceros.
 * @param num Numero
 * @param zeros Ceros a la izquierda
 */
export function FormatNumber(num: number, zeros = 3): string {
  return String(Number(num) + Math.pow(10, zeros)).slice(1);
}
