import { useState, useMemo, useCallback } from 'react';
import type {
  Column,
  SortConfig,
  SortDirection,
  FilterConfig,
  FilterOperator,
  PaginationConfig,
  SelectionMode,
  TableOptions,
  UseTableReturn,
} from '../types';
import { multiColumnSort } from '../utils/sort';
import { applyFilters, applyGlobalSearch } from '../utils/filter';

/**
 * Core table hook: manages sorting, filtering, pagination, selection,
 * column visibility, column resizing, and row expansion.
 *
 * @example
 * ```tsx
 * const table = useTable({
 *   columns: [
 *     { key: 'name', title: 'Name', sortable: true, filterable: true },
 *     { key: 'email', title: 'Email' },
 *     { key: 'age', title: 'Age', sortable: true, filterType: 'number' },
 *   ],
 *   data: users,
 *   selectionMode: 'multiple',
 *   paginated: true,
 *   defaultPageSize: 25,
 * });
 * ```
 */
export function useTable<T = any>(options: TableOptions<T>): UseTableReturn<T> {
  const {
    columns,
    data,
    rowKey,
    selectionMode = 'none',
    defaultSort = [],
    paginated = true,
    defaultPageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
    onSortChange,
    onPageChange,
    onSelectionChange,
  } = options;

  // ─── Sort State ──────────────────────────────────────────
  const [sorts, setSorts] = useState<SortConfig[]>(defaultSort);

  const toggleSort = useCallback(
    (key: string) => {
      setSorts((prev) => {
        const existing = prev.find((s) => s.key === key);
        let newSorts: SortConfig[];

        if (!existing) {
          // Add as primary sort
          newSorts = [{ key, direction: 'asc' }];
        } else if (existing.direction === 'asc') {
          // Toggle to desc
          newSorts = prev.map((s) => (s.key === key ? { ...s, direction: 'desc' as SortDirection } : s));
        } else {
          // Remove sort (was desc)
          newSorts = prev.filter((s) => s.key !== key);
        }

        onSortChange?.(newSorts);
        return newSorts;
      });
    },
    [onSortChange]
  );

  const getSortDirection = useCallback(
    (key: string): SortDirection | null => {
      const sort = sorts.find((s) => s.key === key);
      return sort ? sort.direction : null;
    },
    [sorts]
  );

  const getSortIndex = useCallback(
    (key: string): number => {
      return sorts.findIndex((s) => s.key === key);
    },
    [sorts]
  );

  // ─── Filter State ────────────────────────────────────────
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const setFilter = useCallback(
    (key: string, value: string | number, operator: FilterOperator = 'contains') => {
      const column = columns.find((c) => c.key === key);
      const filterType = column?.filterType || 'text';

      setFilters((prev) => {
        const existing = prev.findIndex((f) => f.key === key);
        const newFilter: FilterConfig = { key, type: filterType, operator, value };

        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = newFilter;
          return updated;
        }
        return [...prev, newFilter];
      });

      // Reset to page 1 when filters change
      setPage(1);
    },
    [columns]
  );

  const removeFilter = useCallback((key: string) => {
    setFilters((prev) => prev.filter((f) => f.key !== key));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
    setSearchQuery('');
  }, []);

  // ─── Pagination State ────────────────────────────────────
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);

  const setPage = useCallback(
    (newPage: number) => {
      setPageState(newPage);
      onPageChange?.(newPage, pageSize);
    },
    [pageSize, onPageChange]
  );

  const setPageSize = useCallback(
    (newSize: number) => {
      setPageSizeState(newSize);
      setPageState(1);
      onPageChange?.(1, newSize);
    },
    [onPageChange]
  );

  // ─── Selection State ─────────────────────────────────────
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());

  const getRowKey = useCallback(
    (row: T, index: number): string | number => {
      if (typeof rowKey === 'function') return rowKey(row, index);
      if (typeof rowKey === 'string') return (row as any)[rowKey];
      return index;
    },
    [rowKey]
  );

  const toggleSelect = useCallback(
    (key: string | number) => {
      setSelectedKeys((prev) => {
        const next = new Set(prev);

        if (selectionMode === 'single') {
          if (next.has(key)) {
            next.clear();
          } else {
            next.clear();
            next.add(key);
          }
        } else {
          if (next.has(key)) {
            next.delete(key);
          } else {
            next.add(key);
          }
        }

        onSelectionChange?.(next);
        return next;
      });
    },
    [selectionMode, onSelectionChange]
  );

  const clearSelection = useCallback(() => {
    setSelectedKeys(new Set());
    onSelectionChange?.(new Set());
  }, [onSelectionChange]);

  const isSelected = useCallback(
    (key: string | number) => selectedKeys.has(key),
    [selectedKeys]
  );

  // ─── Column Visibility ──────────────────────────────────
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(
    new Set(columns.filter((c) => c.visible === false).map((c) => c.key))
  );

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenColumns.has(c.key)),
    [columns, hiddenColumns]
  );

  const toggleColumn = useCallback((key: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  // ─── Column Resize ──────────────────────────────────────
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  const setColumnWidth = useCallback((key: string, width: number) => {
    setColumnWidths((prev) => ({ ...prev, [key]: width }));
  }, []);

  // ─── Row Expansion ──────────────────────────────────────
  const [expandedKeys, setExpandedKeys] = useState<Set<string | number>>(new Set());

  const toggleExpand = useCallback((key: string | number) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const isExpanded = useCallback(
    (key: string | number) => expandedKeys.has(key),
    [expandedKeys]
  );

  // ─── Process Data ────────────────────────────────────────
  const searchableKeys = useMemo(
    () =>
      columns
        .filter((c) => c.filterable !== false)
        .map((c) => c.key),
    [columns]
  );

  const processedData = useMemo(() => {
    let result = [...data];

    // Apply global search
    if (searchQuery) {
      result = applyGlobalSearch(result, searchQuery, searchableKeys);
    }

    // Apply column filters
    if (filters.length > 0) {
      result = applyFilters(result, filters);
    }

    // Apply sorting
    if (sorts.length > 0) {
      result = multiColumnSort(result, sorts, columns);
    }

    return result;
  }, [data, searchQuery, searchableKeys, filters, sorts, columns]);

  const totalItems = processedData.length;
  const totalPages = paginated ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1;

  // Clamp current page
  const currentPage = Math.min(page, totalPages);
  if (currentPage !== page) {
    // Don't call setPage here to avoid re-render loop; just use clamped value
  }

  const paginatedData = useMemo(() => {
    if (!paginated) return processedData;
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, paginated, currentPage, pageSize]);

  // ─── Select All ──────────────────────────────────────────
  const allPageKeys = useMemo(
    () => paginatedData.map((row, i) => getRowKey(row, (currentPage - 1) * pageSize + i)),
    [paginatedData, getRowKey, currentPage, pageSize]
  );

  const isAllSelected = allPageKeys.length > 0 && allPageKeys.every((k) => selectedKeys.has(k));
  const isSomeSelected = allPageKeys.some((k) => selectedKeys.has(k)) && !isAllSelected;

  const toggleSelectAll = useCallback(() => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (isAllSelected) {
        // Deselect all on current page
        allPageKeys.forEach((k) => next.delete(k));
      } else {
        // Select all on current page
        allPageKeys.forEach((k) => next.add(k));
      }
      onSelectionChange?.(next);
      return next;
    });
  }, [isAllSelected, allPageKeys, onSelectionChange]);

  // ─── Pagination Config ───────────────────────────────────
  const pagination: PaginationConfig = {
    page: currentPage,
    pageSize,
    totalItems,
    pageSizeOptions,
  };

  return {
    processedData,
    paginatedData,
    totalItems,
    sorts,
    toggleSort,
    getSortDirection,
    getSortIndex,
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    searchQuery,
    setSearchQuery: (q: string) => {
      setSearchQuery(q);
      setPageState(1);
    },
    pagination,
    setPage,
    setPageSize,
    totalPages,
    selectedKeys,
    toggleSelect,
    toggleSelectAll,
    isSelected,
    isAllSelected,
    isSomeSelected,
    clearSelection,
    visibleColumns,
    columnWidths,
    toggleColumn,
    setColumnWidth,
    expandedKeys,
    toggleExpand,
    isExpanded,
    getRowKey,
  };
}
