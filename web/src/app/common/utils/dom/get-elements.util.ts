export function GetElements(target: HTMLElement, selector: string): HTMLElement[] {
  return !!target ? [].slice.call(target.querySelectorAll(selector)) : [];
}
