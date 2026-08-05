import { createElement } from 'lucide';

export type IconDefinition = Parameters<typeof createElement>[0];

export function renderIcon(iconDef: IconDefinition, extraClass: string = ''): string {
  try {
    if (!iconDef) return '';
    const iconEl = createElement(iconDef);
    if (extraClass) {
      iconEl.classList.add(...extraClass.split(' '));
    }
    return iconEl.outerHTML;
  } catch (error) {
    console.warn('[Ticketera] Error al renderizar icono:', error);
    return '';
  }
}