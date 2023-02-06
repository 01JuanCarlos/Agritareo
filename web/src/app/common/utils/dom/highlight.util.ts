import { escapeRegExp } from 'lodash-es';

export function Highlight(nodes: NodeList[] | string, text: string): void {
  const list: HTMLElement[] = [].slice.call('string' === typeof nodes ? document.querySelectorAll(nodes) : nodes);
  list.forEach(el => {
    if (!!text) {
      el.innerHTML = el.innerText.replace(new RegExp(escapeRegExp(text), 'gi'), m => `<span style="background: yellow;">${m}</span>`);
    } else {
      el.innerHTML = el.innerText;
    }
  });
}
