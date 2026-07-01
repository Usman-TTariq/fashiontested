/** Normalize Firebase Timestamp, ISO string, Date, or epoch to a JS Date (or null). */
export function toJsDate(value: unknown): Date | null {
  if (value == null) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const maybeTimestamp = value as { toDate?: () => Date };
    if (typeof maybeTimestamp.toDate === 'function') {
      const date = maybeTimestamp.toDate();
      return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
    }
  }

  return null;
}
