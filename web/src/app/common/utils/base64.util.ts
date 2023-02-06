export function Base64Encode(data: string | object) {
  return btoa('string' === typeof data ? data : JSON.stringify(data));
}
