
export interface FloatWindowOptions {
  dir?: 'left' | 'right';
  container?: HTMLElement;
}

const initialFloatWindowOptions: FloatWindowOptions = {
  dir: 'right'
};

/**
 * Ubicar una ventana en el documento.
 * @param target Elemento de la ventana
 * @param x Posicion X donde se desea mostrar con respecto al contenedor
 * @param y Posicion Y donde se desea mostrar con respecto al contenedor
 * @param container Contenedor sobre donde se desea ubicar el elemento
 */
export function ShowFloatingWindow(target: HTMLElement, x = 0, y = 0, options = initialFloatWindowOptions) {
  if (!target) { return; }
  const { left = 0, top = 0 } = !!options.container ? options.container.getBoundingClientRect() : {};
  let dirLeft = 0;

  target.style.setProperty('display', 'block', 'important');
  target.style.setProperty('position', 'absolute');

  if ('left' === options.dir) {
    const boxMenu = target.getBoundingClientRect();
    dirLeft = boxMenu.width;
  }

  target.style.setProperty('top', `${y - top}px`);
  target.style.setProperty('left', `${(x - left) - dirLeft}px`);
}

/**
 * Ocultar una ventana del documento,
 * @param target Elemento de la ventana
 */
export function HideFloatingWindow(target: HTMLElement) {
  if (!target) { return; }
  target.style.setProperty('display', 'none', 'important');
}
