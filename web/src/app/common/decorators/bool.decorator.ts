/**
 * Decorador para hacer que una propiedad de entrada sea booleana.
 */
export function Bool(target, propertyKey: string) {
  const accessor = `${propertyKey}$`;
  const secret = `_${propertyKey}$`;

  Object.defineProperty(target, accessor, {
    get() {
      if (this[secret]) { return this[secret]; }
      this[secret] = false;
      return this[secret];
    },
    set() { throw new Error('No puedes setear esta propiedad en el componente si usas @BoolInput'); }
  });

  Object.defineProperty(target, propertyKey, {
    get() {
      return this[accessor];
    },
    set(value: any) {
      this[secret] = !value && 'string' === typeof value ? !0 : !!value;
    },
    enumerable: true
  });
}
