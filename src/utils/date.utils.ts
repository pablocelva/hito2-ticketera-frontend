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
      const iso = Date.parse(value);
      if (!isNaN(iso)) {
        return new Date(iso);
      }
      const parts = value.trim().split('-');
      if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        if (day > 0 && month > 0 && year > 0) {
          const parsed = new Date(year, month - 1, day);
          if (!isNaN(parsed.getTime())) {
            return parsed;
          }
        }
      }
    }
    return new Date();
  }