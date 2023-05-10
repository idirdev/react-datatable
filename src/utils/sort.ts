import type { SortConfig, Column } from '../types';

/**
 * Get a nested value from an object using a dot-separated key path.
 *
 * @example
 * getNestedValue({ user: { name: 'John' } }, 'user.name') // 'John'
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    if (current == null) return undefined;
    return current[key];
  }, obj);
}

/**
 * Default comparator for sorting values.
 * Handles strings, numbers, dates, booleans, and null/undefined.
 */
export function defaultComparator(a: any, b: any): number {
  // Handle nulls -- push them to the end
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  // Dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  // Try parsing as dates if they look like date strings
  if (typeof a === 'string' && typeof b === 'string') {
    const dateA = Date.parse(a);
    const dateB = Date.parse(b);
    if (!isNaN(dateA) && !isNaN(dateB) && a.includes('-')) {
      return dateA - dateB;
    }
  }

  // Numbers
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  // Booleans
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b ? 0 : a ? -1 : 1;
  }

  // Strings (case-insensitive)
  const strA = String(a).toLowerCase();
  const strB = String(b).toLowerCase();
  return strA.localeCompare(strB);
}

/**
 * Multi-column sort.
 *
 * Sorts data by multiple columns in order of priority.
 * The first sort config is the primary sort, the second is secondary, etc.
 *
 * @param data - Array of data to sort
 * @param sorts - Array of sort configurations (key + direction)
 * @param columns - Column definitions (for custom comparators)
 * @returns New sorted array (does not mutate original)
 */
export function multiColumnSort<T>(
  data: T[],
  sorts: SortConfig[],
  columns: Column<T>[]
): T[] {
  if (sorts.length === 0) return [...data];

  // Build a map of column keys to their custom comparators
  const comparatorMap = new Map<string, ((a: T, b: T) => number) | undefined>();
  for (const col of columns) {
    if (col.comparator) {
      comparatorMap.set(col.key, col.comparator);
    }
  }

  return [...data].sort((a, b) => {
    for (const sort of sorts) {
      const customComparator = comparatorMap.get(sort.key);
      let result: number;

      if (customComparator) {
        result = customComparator(a, b);
      } else {
        const valueA = getNestedValue(a, sort.key);
        const valueB = getNestedValue(b, sort.key);
        result = defaultComparator(valueA, valueB);
      }

      // Apply direction
      if (sort.direction === 'desc') {
        result = -result;
      }

      // If not equal, this sort level decides the order
      if (result !== 0) {
        return result;
      }
      // If equal, fall through to the next sort level
    }
    return 0;
  });
}
