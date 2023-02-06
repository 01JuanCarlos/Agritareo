export function Closest(elm: any, selector: string): HTMLElement {
  for (; elm && elm !== document; elm = elm.parentNode) {
    if (elm.matches(selector)) {
      return elm;
    }
  }
  return null;
}
