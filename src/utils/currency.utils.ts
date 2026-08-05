import { APP_CONFIG } from '../config/app.config';

export function formatPrice(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return '$0';
  }
  try {
    return new Intl.NumberFormat(APP_CONFIG.CURRENCY_LOCALE, {
      style: 'currency',
      currency: APP_CONFIG.CURRENCY_CODE,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${value}`;
  }
}