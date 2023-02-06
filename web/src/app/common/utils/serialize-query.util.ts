export function SerializeQuery(obj: object, prefix?: string) {
  const str = [];
  for (const p in obj) {
    if (obj.hasOwnProperty(p)) {
      const k = prefix ? prefix + '[' + p + ']' : p;
      const v = Array.isArray(obj[p]) ? obj[p].length ? obj[p] : '' : obj[p];
      if (undefined !== v) {
        str.push((v !== null && typeof v === 'object') ? SerializeQuery(v, k) : encodeURIComponent(k) + '=' + encodeURIComponent(v));
      }
    }
  }
  return str.join('&');
}
