import { describe, it, expect } from 'vitest';
import {
  createBannerSkeletonElement,
  createGridSkeletonElement,
} from '../../src/components/LoadingSkeleton/LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('createBannerSkeletonElement genera el esqueleto del banner', () => {
    const el = createBannerSkeletonElement();
    expect(el.tagName).toBe('DIV');
    expect(el.className).toContain('animate-pulse');
    expect(el.children.length).toBe(3);
  });

  it('createGridSkeletonElement genera 6 tarjetas por defecto', () => {
    const fragment = createGridSkeletonElement();
    expect(fragment).toBeInstanceOf(DocumentFragment);
    expect(fragment.children.length).toBe(6);
  });

  it('createGridSkeletonElement respeta la cantidad solicitada', () => {
    const fragment = createGridSkeletonElement(3);
    expect(fragment.children.length).toBe(3);
  });
});
