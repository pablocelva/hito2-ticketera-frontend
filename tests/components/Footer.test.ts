import { describe, it, expect } from 'vitest';
import { createFooterElement } from '../../src/components/Footer/Footer';

describe('Footer Component', () => {
  it('debe renderizar la marca con el ícono de ticket', () => {
    const el = createFooterElement();
    expect(el.tagName).toBe('FOOTER');
    expect(el.textContent).toContain('TICKETERA');
    expect(el.querySelector('svg')).not.toBeNull();
    expect(el.textContent).toContain('Boletería independiente');
  });

  it('debe incluir las secciones de información y contacto', () => {
    const el = createFooterElement();
    expect(el.textContent).toContain('Información');
    expect(el.textContent).toContain('Términos y condiciones');
    expect(el.textContent).toContain('Contacto');
    expect(el.textContent).toContain('soporte@ticketera.cl');
    expect(el.textContent).toContain('Santiago, Chile');
    expect(el.querySelectorAll('a').length).toBeGreaterThanOrEqual(4);
  });

  it('debe incluir las insignias de confianza y el pie inferior', () => {
    const el = createFooterElement();
    expect(el.textContent).toContain('Pago seguro');
    expect(el.textContent).toContain('Compra garantizada');
    expect(el.textContent).toContain('Boletería independiente');
    const year = String(new Date().getFullYear());
    expect(el.textContent).toContain(year);
  });
});
