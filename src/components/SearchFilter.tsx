import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Column, FilterConfig, FilterOperator } from '../types';

interface SearchFilterProps<T> {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  columns: Column<T>[];
  filters: FilterConfig[];
  onFilterChange: (key: string, value: string | number, operator?: FilterOperator) => void;
  onFilterRemove: (key: string) => void;
  onFiltersClear: () => void;
  compact: boolean;
}

/**
 * Global search bar + per-column filter controls.
 *
 * Renders a search input for global text search and filter dropdowns
 * for each filterable column.
 */
export function SearchFilter<T>({
  searchQuery,
  onSearchChange,
  columns,
  filters,
  onFilterChange,
  onFilterRemove,
  onFiltersClear,
  compact,
}: SearchFilterProps<T>) {
  const [showFilters, setShowFilters] = useState(false);
  const filterableColumns = columns.filter((c) => c.filterable);
  const hasActiveFilters = filters.length > 0 || searchQuery.length > 0;
  const searchRef = useRef<HTMLInputElement>(null);

  // Debounced search
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearchChange(value);
      }, 250);
    },
    [onSearchChange]
  );

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const containerPadding = compact ? '8px 12px' : '12px 16px';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: containerPadding,
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Top row: search + filter toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search input */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            maxWidth: 360,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth={2}
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            placeholder="Search..."
            defaultValue={searchQuery}
            onChange={handleSearchInput}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 13,
              color: '#374151',
              outline: 'none',
              transition: 'border-color 0.15s',
              backgroundColor: '#ffffff',
            }}
            onFocus={(e) => {
              (e.target as HTMLElement).style.borderColor = '#3b82f6';
            }}
            onBlur={(e) => {
              (e.target as HTMLElement).style.borderColor = '#d1d5db';
            }}
          />
        </div>

        {/* Filter toggle button */}
        {filterableColumns.length > 0 && (
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              backgroundColor: showFilters ? '#eff6ff' : '#ffffff',
              color: showFilters ? '#2563eb' : '#374151',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
            Filters
            {filters.length > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 18,
                  height: 18,
                  padding: '0 4px',
                  borderRadius: 9,
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {filters.length}
              </span>
            )}
          </button>
        )}

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              onFiltersClear();
              if (searchRef.current) searchRef.current.value = '';
            }}
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: 8,
              backgroundColor: 'transparent',
              color: '#ef4444',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Column filters row */}
      {showFilters && filterableColumns.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            paddingTop: 4,
          }}
        >
          {filterableColumns.map((column) => {
            const activeFilter = filters.find((f) => f.key === column.key);
            const filterType = column.filterType || 'text';

            if (filterType === 'select' && column.filterOptions) {
              return (
                <div key={column.key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>
                    {column.title as string}
                  </label>
                  <select
                    value={(activeFilter?.value as string) || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        onFilterChange(column.key, e.target.value, 'equals');
                      } else {
                        onFilterRemove(column.key);
                      }
                    }}
                    style={{
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: 6,
                      fontSize: 13,
                      backgroundColor: '#ffffff',
                      color: '#374151',
                      minWidth: 120,
                    }}
                  >
                    <option value="">All</option>
                    {column.filterOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            return (
              <div key={column.key} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>
                  {column.title as string}
                </label>
                <input
                  type={filterType === 'number' ? 'number' : filterType === 'date' ? 'date' : 'text'}
                  placeholder={`Filter ${column.title}...`}
                  defaultValue={(activeFilter?.value as string) || ''}
                  onChange={(e) => {
                    clearTimeout(debounceRef.current);
                    debounceRef.current = setTimeout(() => {
                      if (e.target.value) {
                        const op: FilterOperator = filterType === 'number' ? 'equals' : 'contains';
                        onFilterChange(column.key, e.target.value, op);
                      } else {
                        onFilterRemove(column.key);
                      }
                    }, 300);
                  }}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: 13,
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    minWidth: 120,
                    outline: 'none',
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

SearchFilter.displayName = 'SearchFilter';
