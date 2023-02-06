export function ParseClassNames(classNames: string | string[], val = true) {
  classNames = !classNames ? [] : ('string' === typeof classNames ? classNames.split(' ') : classNames);
  return classNames.reduce((o, k) => ({ ...o, [k]: val }), {});
}

