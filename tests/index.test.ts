import { describe, it, expect } from 'vitest';
import { multiColumnSort, defaultComparator, getNestedValue } from '../src/utils/sort';
import { applyFilters, applyGlobalSearch } from '../src/utils/filter';
import type { SortConfig, Column, FilterConfig } from '../src/types';

describe('getNestedValue', () => {
  it('should get a top-level value', () => {
    expect(getNestedValue({ name: 'Alice' }, 'name')).toBe('Alice');
  });

  it('should get a nested value with dot notation', () => {
    const obj = { user: { name: 'Bob', address: { city: 'NYC' } } };
    expect(getNestedValue(obj, 'user.name')).toBe('Bob');
    expect(getNestedValue(obj, 'user.address.city')).toBe('NYC');
  });

  it('should return undefined for missing paths', () => {
    expect(getNestedValue({ a: 1 }, 'b')).toBeUndefined();
    expect(getNestedValue({ a: { b: 1 } }, 'a.c')).toBeUndefined();
  });

  it('should handle null/undefined objects gracefully', () => {
    expect(getNestedValue(null, 'a')).toBeUndefined();
    expect(getNestedValue(undefined, 'a')).toBeUndefined();
  });
});

describe('defaultComparator', () => {
  it('should compare numbers', () => {
    expect(defaultComparator(1, 2)).toBeLessThan(0);
    expect(defaultComparator(2, 1)).toBeGreaterThan(0);
    expect(defaultComparator(5, 5)).toBe(0);
  });

  it('should compare strings case-insensitively', () => {
    expect(defaultComparator('apple', 'Banana')).toBeLessThan(0);
    expect(defaultComparator('banana', 'Apple')).toBeGreaterThan(0);
    expect(defaultComparator('Hello', 'hello')).toBe(0);
  });

  it('should push null/undefined to the end', () => {
    expect(defaultComparator(null, 1)).toBe(1);
    expect(defaultComparator(1, null)).toBe(-1);
    expect(defaultComparator(null, null)).toBe(0);
    expect(defaultComparator(undefined, 'a')).toBe(1);
  });

  it('should compare booleans (true before false)', () => {
    expect(defaultComparator(true, false)).toBeLessThan(0);
    expect(defaultComparator(false, true)).toBeGreaterThan(0);
    expect(defaultComparator(true, true)).toBe(0);
  });

  it('should compare Date objects', () => {
    const d1 = new Date('2024-01-01');
    const d2 = new Date('2024-06-15');
    expect(defaultComparator(d1, d2)).toBeLessThan(0);
    expect(defaultComparator(d2, d1)).toBeGreaterThan(0);
  });

  it('should compare date strings', () => {
    expect(defaultComparator('2024-01-01', '2024-06-15')).toBeLessThan(0);
    expect(defaultComparator('2024-12-31', '2024-01-01')).toBeGreaterThan(0);
  });
});

describe('multiColumnSort', () => {
  const data = [
    { name: 'Charlie', age: 30, city: 'NYC' },
    { name: 'Alice', age: 25, city: 'LA' },
    { name: 'Bob', age: 30, city: 'Chicago' },
    { name: 'Alice', age: 28, city: 'NYC' },
  ];

  const columns: Column[] = [
    { key: 'name', title: 'Name' },
    { key: 'age', title: 'Age' },
    { key: 'city', title: 'City' },
  ];

  it('should sort by a single column ascending', () => {
    const sorts: SortConfig[] = [{ key: 'name', direction: 'asc' }];
    const sorted = multiColumnSort(data, sorts, columns);
    expect(sorted[0].name).toBe('Alice');
    expect(sorted[1].name).toBe('Alice');
    expect(sorted[2].name).toBe('Bob');
    expect(sorted[3].name).toBe('Charlie');
  });

  it('should sort by a single column descending', () => {
    const sorts: SortConfig[] = [{ key: 'age', direction: 'desc' }];
    const sorted = multiColumnSort(data, sorts, columns);
    expect(sorted[0].age).toBe(30);
    expect(sorted[1].age).toBe(30);
    expect(sorted[2].age).toBe(28);
    expect(sorted[3].age).toBe(25);
  });

  it('should sort by multiple columns', () => {
    const sorts: SortConfig[] = [
      { key: 'name', direction: 'asc' },
      { key: 'age', direction: 'asc' },
    ];
    const sorted = multiColumnSort(data, sorts, columns);
    // Alice (25) before Alice (28)
    expect(sorted[0].name).toBe('Alice');
    expect(sorted[0].age).toBe(25);
    expect(sorted[1].name).toBe('Alice');
    expect(sorted[1].age).toBe(28);
    expect(sorted[2].name).toBe('Bob');
    expect(sorted[3].name).toBe('Charlie');
  });

  it('should return a copy when no sorts are specified', () => {
    const sorted = multiColumnSort(data, [], columns);
    expect(sorted).toEqual(data);
    expect(sorted).not.toBe(data);
  });

  it('should not mutate the original array', () => {
    const original = [...data];
    multiColumnSort(data, [{ key: 'name', direction: 'asc' }], columns);
    expect(data).toEqual(original);
  });

  it('should use custom comparator from column definition', () => {
    const customColumns: Column[] = [
      {
        key: 'name',
        title: 'Name',
        comparator: (a: any, b: any) => b.name.length - a.name.length,
      },
    ];
    const sorts: SortConfig[] = [{ key: 'name', direction: 'asc' }];
    const sorted = multiColumnSort(data, sorts, customColumns);
    // Charlie (7) > Alice (5) > Bob (3) -- but comparator returns b-a, so longer first
    expect(sorted[0].name).toBe('Charlie');
  });
});

describe('applyFilters', () => {
  const data = [
    { name: 'Alice', age: 25, city: 'NYC' },
    { name: 'Bob', age: 30, city: 'LA' },
    { name: 'Charlie', age: 35, city: 'NYC' },
    { name: 'Diana', age: 28, city: 'Chicago' },
  ];

  it('should return all data when no filters are applied', () => {
    const result = applyFilters(data, []);
    expect(result).toEqual(data);
  });

  it('should filter by text contains', () => {
    const filters: FilterConfig[] = [
      { key: 'name', type: 'text', operator: 'contains', value: 'ali' },
    ];
    const result = applyFilters(data, filters);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice');
  });

  it('should filter by text equals', () => {
    const filters: FilterConfig[] = [
      { key: 'name', type: 'text', operator: 'equals', value: 'bob' },
    ];
    const result = applyFilters(data, filters);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bob');
  });

  it('should filter by text startsWith', () => {
    const filters: FilterConfig[] = [
      { key: 'name', type: 'text', operator: 'startsWith', value: 'ch' },
    ];
    const result = applyFilters(data, filters);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Charlie');
  });

  it('should filter by text endsWith', () => {
    const filters: FilterConfig[] = [
      { key: 'name', type: 'text', operator: 'endsWith', value: 'na' },
    ];
    const result = applyFilters(data, filters);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Diana');
  });

  it('should filter by number equals', () => {
    const filters: FilterConfig[] = [
      { key: 'age', type: 'number', operator: 'equals', value: 30 },
    ];
    const result = applyFilters(data, filters);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bob');
  });

  it('should filter by number greater than', () => {
    const filters: FilterConfig[] = [
      { key: 'age', type: 'number', operator: 'gt', value: 28 },
    ];
    const result = applyFilters(data, filters);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.name).sort()).toEqual(['Bob', 'Charlie']);
  });

  it('should filter by number less than', () => {
    const filters: FilterConfig[] = [
      { key: 'age', type: 'number', operator: 'lt', value: 28 },
    ];
    const result = applyFilters(data, filters);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice');
  });

  it('should filter by number between', () => {
    const filters: FilterConfig[] = [
      { key: 'age', type: 'number', operator: 'between', value: [26, 31] },
    ];
    const result = applyFilters(data, filters);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.name).sort()).toEqual(['Bob', 'Diana']);
  });

  it('should filter by select in', () => {
    const filters: FilterConfig[] = [
      { key: 'city', type: 'select', operator: 'in', value: ['NYC', 'LA'] },
    ];
    const result = applyFilters(data, filters);
    expect(result).toHaveLength(3);
  });

  it('should apply multiple filters with AND logic', () => {
    const filters: FilterConfig[] = [
      { key: 'city', type: 'text', operator: 'equals', value: 'nyc' },
      { key: 'age', type: 'number', operator: 'gt', value: 30 },
    ];
    const result = applyFilters(data, filters);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Charlie');
  });
});

describe('applyGlobalSearch', () => {
  const data = [
    { name: 'Alice', age: 25, city: 'New York' },
    { name: 'Bob', age: 30, city: 'Los Angeles' },
    { name: 'Charlie', age: 35, city: 'New York' },
  ];

  it('should return all data for empty query', () => {
    expect(applyGlobalSearch(data, '')).toEqual(data);
    expect(applyGlobalSearch(data, '   ')).toEqual(data);
  });

  it('should search across all string and number values', () => {
    const result = applyGlobalSearch(data, 'alice');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice');
  });

  it('should search case-insensitively', () => {
    const result = applyGlobalSearch(data, 'NEW YORK');
    expect(result).toHaveLength(2);
  });

  it('should search specific keys when provided', () => {
    const result = applyGlobalSearch(data, 'new', ['city']);
    expect(result).toHaveLength(2);
  });

  it('should return empty when no matches', () => {
    const result = applyGlobalSearch(data, 'zzzzz');
    expect(result).toHaveLength(0);
  });

  it('should match numeric values as strings', () => {
    const result = applyGlobalSearch(data, '30');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Bob');
  });
});
