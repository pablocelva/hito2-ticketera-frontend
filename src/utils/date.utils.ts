export function formatDate(date?: Date): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Fecha por confirmar';
    }
    try {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Fecha por confirmar';
    }
  }
  
  export function parseEventDate(value: unknown): Date {
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value;
    }
    if (typeof value === 'string' && value.trim() !== '') {
      const trimmed = value.trim();
      const isIso = /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(trimmed);
      if (isIso) {
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }
      const parts = trimmed.split('-');
      if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900) {
          const parsed = new Date(year, month - 1, day);
          if (!isNaN(parsed.getTime())) {
            return parsed;
          }
        }
      }
    }
    return new Date();
  }