
function getRandomId() {
  function chr4() {
    return Math.random().toString(16).slice(-4);
  }
  return 'ns_' + chr4() + '-' + chr4() + '-' + chr4() + chr4() + chr4();
}

/**
 * Decorador para generar ID únicos por componente.
 * @param target Componente
 * @param propertyKey Propiedad para setear
 */
export function Id(target, propertyKey: string): void {
  const accessor = `${propertyKey}$`;
  const secret = `_${propertyKey}$`;

  Object.defineProperty(target, accessor, {
    get() {
      if (this[secret]) { return this[secret]; }
      this[secret] = getRandomId();
      return this[secret];
    },
    set() { throw new Error('No puedes setear esta propiedad en el componente si usas @Id'); }
  });

  Object.defineProperty(target, propertyKey, {
    get() {
      return this[accessor];
    },
    set(value: string) {
      this[secret] = value;
    },
    enumerable: true
  });
}
