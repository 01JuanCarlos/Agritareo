export const METADATA_PREFIX = '__ns_meta__';
/**
 * Definir meta propiedades a una clase.
 * @param meta Propiedades meta.
 */
export function NsMetadata(meta?: any) {
  return (target: any) => {
    SetMetadata(target, meta);
  };
}


export function SetMetadata(target: any, meta: any) {
  if ('object' === typeof meta) {
    for (const k in meta) {
      if (meta.hasOwnProperty(k)) {
        const prop = `${METADATA_PREFIX}${k}`;
        const accesor = `md${prop}$`;
        const secret = `_md${prop}$`;
        const value = meta[k];

        Object.defineProperty(target, accesor, {
          get() {
            if (this[secret]) {
              return this[secret];
            }
            this[secret] = value;
            return this[secret];
          }
        });

        Object.defineProperty(target, prop, {
          get() { return this[accesor]; },
          set(val) {
            this[secret] = val;
          },
          enumerable: true
        });
      }
    }
  }
}
