import { describe, it, expect } from 'vitest';
import { createFeaturedBannerElement } from '../../src/components/FeaturedBanner/FeaturedBanner';
import { EventStatus, type Event } from '../../src/models';

function buildEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'evt-1',
    title: 'Latam Tour 2026',
    artist: 'Elena Pinderhughes',
    venue: 'Teatro Municipal de Santiago',
    city: 'Santiago',
    date: new Date('2026-10-10T20:00:00'),
    time: '20:00',
    price: 45000,
    capacity: 500,
    ticketsSold: 190,
    status: EventStatus.ON_SALE,
    isFeatured: true,
    ...overrides,
  };
}

describe('FeaturedBanner', () => {
  it('renderiza el banner con los datos del evento destacado', () => {
    const el = createFeaturedBannerElement(buildEvent());

    expect(el.tagName).toBe('SECTION');
    expect(el.innerHTML).toContain('data-id="evt-1"');
    expect(el.textContent).toContain('EVENTO DESTACADO');
    expect(el.textContent).toContain('Latam Tour 2026');
    expect(el.textContent).toContain('Elena Pinderhughes');
    expect(el.textContent).toContain('Teatro Municipal de Santiago');
    expect(el.textContent).toContain('20:00');
    expect(el.textContent).toContain('Comprar Entradas');
    const img = el.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/images/placeholder.svg');
  });

  it('usa la imagen del evento cuando existe', () => {
    const el = createFeaturedBannerElement(
      buildEvent({ imageUrl: '/images/elena.webp' }),
    );
    const img = el.querySelector('img');
    expect(img?.getAttribute('src')).toBe('/images/elena.webp');
  });

  it('muestra la fecha formateada y el precio en CLP', () => {
    const el = createFeaturedBannerElement(buildEvent());
    expect(el.textContent).toContain('10 de octubre');
    expect(el.textContent).toContain('45.000');
  });
});
