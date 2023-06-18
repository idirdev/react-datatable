// Main component
export { DataTable } from './DataTable';

// Sub-components
export { TableHeader } from './components/TableHeader';
export { TableBody } from './components/TableBody';
export { TableRow } from './components/TableRow';
export { Pagination } from './components/Pagination';
export { SearchFilter } from './components/SearchFilter';
export { ColumnToggle } from './components/ColumnToggle';

// Hook
export { useTable } from './hooks/useTable';

// Utilities
export { multiColumnSort, defaultComparator, getNestedValue } from './utils/sort';
export { applyFilters, applyGlobalSearch } from './utils/filter';

// Types
export type {
  Column,
  SortDirection,
  SortConfig,
  FilterType,
  FilterOperator,
  FilterConfig,
  PaginationConfig,
  SelectionMode,
  TableOptions,
  UseTableReturn,
} from './types';
