import { ReactNode, CSSProperties } from 'react';

// ─── Column Definition ───────────────────────────────────
export interface Column<T = any> {
  /** Unique key matching the data property name */
  key: string;
  /** Column header label */
  title: ReactNode;
  /** Custom render function for cell content */
  render?: (value: any, row: T, index: number) => ReactNode;
  /** Enable sorting for this column. Default: true */
  sortable?: boolean;
  /** Custom sort comparator */
  comparator?: (a: T, b: T) => number;
  /** Enable filtering for this column. Default: false */
  filterable?: boolean;
  /** Filter type. Default: 'text' */
  filterType?: FilterType;
  /** Select filter options (when filterType is 'select') */
  filterOptions?: { label: string; value: string }[];
  /** Column width (CSS value) */
  width?: string | number;
  /** Minimum column width in pixels */
  minWidth?: number;
  /** Allow column resize. Default: true */
  resizable?: boolean;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether column is visible. Default: true */
  visible?: boolean;
  /** Sticky column position */
  sticky?: 'left' | 'right';
  /** Custom header cell render */
  headerRender?: (column: Column<T>) => ReactNode;
  /** Custom cell class name */
  className?: string;
  /** Custom cell styles */
  style?: CSSProperties;
}

// ─── Sort ────────────────────────────────────────────────
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

// ─── Filter ──────────────────────────────────────────────
export type FilterType = 'text' | 'number' | 'date' | 'select';

export type FilterOperator =
  | 'contains'
  | 'equals'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'in';

export interface FilterConfig {
  key: string;
  type: FilterType;
  operator: FilterOperator;
  value: string | number | [number, number] | string[];
}

// ─── Pagination ──────────────────────────────────────────
export interface PaginationConfig {
  page: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
}

// ─── Selection ───────────────────────────────────────────
export type SelectionMode = 'single' | 'multiple' | 'none';

// ─── Table Options ───────────────────────────────────────
export interface TableOptions<T = any> {
  /** Column definitions */
  columns: Column<T>[];
  /** Data array */
  data: T[];
  /** Unique row key extractor. Default: (row, i) => i */
  rowKey?: string | ((row: T, index: number) => string | number);
  /** Enable global search. Default: false */
  searchable?: boolean;
  /** Selection mode. Default: 'none' */
  selectionMode?: SelectionMode;
  /** Initial sort config */
  defaultSort?: SortConfig[];
  /** Enable pagination. Default: true */
  paginated?: boolean;
  /** Default page size. Default: 10 */
  defaultPageSize?: number;
  /** Page size options. Default: [10, 25, 50, 100] */
  pageSizeOptions?: number[];
  /** Enable column visibility toggle. Default: false */
  columnToggle?: boolean;
  /** Enable column resizing. Default: true */
  resizable?: boolean;
  /** Row expand render function */
  expandable?: (row: T, index: number) => ReactNode;
  /** Table CSS class */
  className?: string;
  /** Empty state render */
  emptyState?: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** On row click */
  onRowClick?: (row: T, index: number) => void;
  /** On selection change */
  onSelectionChange?: (selectedKeys: Set<string | number>) => void;
  /** On sort change (for server-side sorting) */
  onSortChange?: (sorts: SortConfig[]) => void;
  /** On page change (for server-side pagination) */
  onPageChange?: (page: number, pageSize: number) => void;
  /** Striped rows */
  striped?: boolean;
  /** Row hover highlight */
  hoverable?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Bordered cells */
  bordered?: boolean;
}

// ─── Hook Return ─────────────────────────────────────────
export interface UseTableReturn<T = any> {
  // Data
  processedData: T[];
  paginatedData: T[];
  totalItems: number;
  // Sort
  sorts: SortConfig[];
  toggleSort: (key: string) => void;
  getSortDirection: (key: string) => SortDirection | null;
  getSortIndex: (key: string) => number;
  // Filter
  filters: FilterConfig[];
  setFilter: (key: string, value: string | number, operator?: FilterOperator) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Pagination
  pagination: PaginationConfig;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  totalPages: number;
  // Selection
  selectedKeys: Set<string | number>;
  toggleSelect: (key: string | number) => void;
  toggleSelectAll: () => void;
  isSelected: (key: string | number) => boolean;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  clearSelection: () => void;
  // Columns
  visibleColumns: Column<T>[];
  columnWidths: Record<string, number>;
  toggleColumn: (key: string) => void;
  setColumnWidth: (key: string, width: number) => void;
  // Expand
  expandedKeys: Set<string | number>;
  toggleExpand: (key: string | number) => void;
  isExpanded: (key: string | number) => boolean;
  // Row key resolver
  getRowKey: (row: T, index: number) => string | number;
}
