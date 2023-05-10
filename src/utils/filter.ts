import type { FilterConfig, FilterType, FilterOperator } from '../types';
import { getNestedValue } from './sort';

/**
 * Check if a single value matches a filter configuration.
 */
function matchesFilter(value: any, filter: FilterConfig): boolean {
  const { type, operator, value: filterValue } = filter;

  if (value == null) {
    return false;
  }

  switch (type) {
    case 'text':
      return matchesTextFilter(String(value), operator, filterValue as string);

    case 'number':
      return matchesNumberFilter(Number(value), operator, filterValue);

    case 'date':
      return matchesDateFilter(value, operator, filterValue);

    case 'select':
      return matchesSelectFilter(value, operator, filterValue);

    default:
      return true;
  }
}

/**
 * Text filter matching.
 * Supports: contains, equals, startsWith, endsWith
 */
function matchesTextFilter(value: string, operator: FilterOperator, filterValue: string): boolean {
  const normalizedValue = value.toLowerCase().trim();
  const normalizedFilter = String(filterValue).toLowerCase().trim();

  if (!normalizedFilter) return true;

  switch (operator) {
    case 'contains':
      return normalizedValue.includes(normalizedFilter);
    case 'equals':
      return normalizedValue === normalizedFilter;
    case 'startsWith':
      return normalizedValue.startsWith(normalizedFilter);
    case 'endsWith':
      return normalizedValue.endsWith(normalizedFilter);
    default:
      return normalizedValue.includes(normalizedFilter);
  }
}

/**
 * Number filter matching.
 * Supports: equals, gt, gte, lt, lte, between
 */
function matchesNumberFilter(
  value: number,
  operator: FilterOperator,
  filterValue: string | number | [number, number] | string[]
): boolean {
  if (isNaN(value)) return false;

  switch (operator) {
    case 'equals':
      return value === Number(filterValue);
    case 'gt':
      return value > Number(filterValue);
    case 'gte':
      return value >= Number(filterValue);
    case 'lt':
      return value < Number(filterValue);
    case 'lte':
      return value <= Number(filterValue);
    case 'between': {
      if (!Array.isArray(filterValue) || filterValue.length < 2) return true;
      const [min, max] = filterValue as [number, number];
      return value >= min && value <= max;
    }
    default:
      return value === Number(filterValue);
  }
}

/**
 * Date filter matching.
 * Parses dates and compares timestamps.
 */
function matchesDateFilter(
  value: any,
  operator: FilterOperator,
  filterValue: string | number | [number, number] | string[]
): boolean {
  const dateValue = value instanceof Date ? value.getTime() : Date.parse(String(value));
  if (isNaN(dateValue)) return false;

  switch (operator) {
    case 'equals': {
      const filterDate = Date.parse(String(filterValue));
      if (isNaN(filterDate)) return true;
      // Compare dates at day granularity
      const d1 = new Date(dateValue);
      const d2 = new Date(filterDate);
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    }
    case 'gt':
    case 'gte': {
      const filterDate = Date.parse(String(filterValue));
      return operator === 'gt' ? dateValue > filterDate : dateValue >= filterDate;
    }
    case 'lt':
    case 'lte': {
      const filterDate = Date.parse(String(filterValue));
      return operator === 'lt' ? dateValue < filterDate : dateValue <= filterDate;
    }
    case 'between': {
      if (!Array.isArray(filterValue) || filterValue.length < 2) return true;
      const [start, end] = filterValue;
      const startDate = Date.parse(String(start));
      const endDate = Date.parse(String(end));
      return dateValue >= startDate && dateValue <= endDate;
    }
    default:
      return true;
  }
}

/**
 * Select filter matching.
 * Checks if value is in the selected options.
 */
function matchesSelectFilter(
  value: any,
  operator: FilterOperator,
  filterValue: string | number | [number, number] | string[]
): boolean {
  const stringValue = String(value).toLowerCase();

  switch (operator) {
    case 'equals':
      return stringValue === String(filterValue).toLowerCase();
    case 'in': {
      if (!Array.isArray(filterValue)) {
        return stringValue === String(filterValue).toLowerCase();
      }
      return filterValue.map((v) => String(v).toLowerCase()).includes(stringValue);
    }
    default:
      return stringValue === String(filterValue).toLowerCase();
  }
}

/**
 * Apply multiple filters to a data array.
 *
 * All filters must match for a row to be included (AND logic).
 *
 * @param data - Array of data to filter
 * @param filters - Active filter configurations
 * @returns New filtered array
 */
export function applyFilters<T>(data: T[], filters: FilterConfig[]): T[] {
  if (filters.length === 0) return data;

  return data.filter((row) => {
    return filters.every((filter) => {
      const value = getNestedValue(row, filter.key);
      return matchesFilter(value, filter);
    });
  });
}

/**
 * Apply a global search query across all searchable fields.
 *
 * @param data - Array of data to search
 * @param query - Search query string
 * @param keys - Keys to search in (if empty, searches all string/number values)
 * @returns New filtered array
 */
export function applyGlobalSearch<T>(data: T[], query: string, keys?: string[]): T[] {
  if (!query.trim()) return data;

  const normalizedQuery = query.toLowerCase().trim();

  return data.filter((row) => {
    if (keys && keys.length > 0) {
      return keys.some((key) => {
        const value = getNestedValue(row, key);
        return value != null && String(value).toLowerCase().includes(normalizedQuery);
      });
    }

    // Search all values
    const values = Object.values(row as Record<string, any>);
    return values.some((value) => {
      if (value == null) return false;
      if (typeof value === 'object') return false;
      return String(value).toLowerCase().includes(normalizedQuery);
    });
  });
}
