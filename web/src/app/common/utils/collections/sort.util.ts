export type SortType = 'asc' | 'desc';

export function Sort<T>(collection: T[], order: SortType = 'asc', property?: string) {
  return collection.sort((a, b) => GetSort(order, a, b, property));
}

function GetSort<T>(t: SortType, a: T, b: T, property = 'order'): number {
  if ('object' === typeof a && 'object' === typeof b) {
    return 'desc' === t ? b[property] - a[property] : a[property] - b[property];
  }

  if ('number' === typeof a && 'number' === typeof b) {
    return 'desc' === t ? b - a : a - b;
  }

  return 1;
}
