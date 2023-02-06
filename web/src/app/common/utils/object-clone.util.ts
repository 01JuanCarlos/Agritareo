export function ObjectClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
