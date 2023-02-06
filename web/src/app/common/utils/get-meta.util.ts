import { NsDocumentOptions } from '../decorators/document.decorator';
import { METADATA_PREFIX } from '../decorators';

export function GetMeta(target: any, prefix: string, isConstructor = false) {
  const meta = target || { constructor: {} };
  const properties = !isConstructor ? { ...meta.constructor } : meta;
  return Object.keys(properties).reduce((a, b) => {
    if (b.startsWith(prefix)) {
      a[b.replace(prefix, '')] = properties[b];
    }
    return a;
  }, {});
}


export function GetMetaOptions(target: any, isConstructor = false): NsDocumentOptions {
  return GetMeta(target, METADATA_PREFIX, isConstructor);
}
