const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function isPositiveInteger(value: string): boolean {
  if (value.trim() === '') return false;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
}

export function isWithinRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}