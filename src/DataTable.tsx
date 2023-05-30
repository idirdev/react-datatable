import React from 'react';
import type { TableOptions } from './types';
import { useTable } from './hooks/useTable';
import { TableHeader } from './components/TableHeader';
import { TableBody } from './components/TableBody';
import { Pagination } from './components/Pagination';
import { SearchFilter } from './components/SearchFilter';
import { ColumnToggle } from './components/ColumnToggle';

/**
 * DataTable - Feature-rich data table component.
 *
 * Provides sorting (multi-column), filtering (text/number/date/select),
 * global search, pagination, row selection, column toggle, column resize,
 * and row expansion out of the box.
 *
 * @example
 * ```tsx
 * import { DataTable } from '@idirdev/react-datatable';
 *
 * const columns = [
 *   { key: 'name', title: 'Name', sortable: true, filterable: true },
 *   { key: 'email', title: 'Email', sortable: true },
 *   { key: 'role', title: 'Role', filterable: true, filterType: 'select',
 *     filterOptions: [
 *       { label: 'Admin', value: 'admin' },
 *       { label: 'User', value: 'user' },
 *     ]
 *   },
 *   { key: 'age', title: 'Age', sortable: true, align: 'right' },
 *   { key: 'createdAt', title: 'Created', sortable: true,
 *     render: (value) => new Date(value).toLocaleDateString()
 *   },
 * ];
 *
 * function UsersPage() {
 *   return (
 *     <DataTable
 *       columns={columns}
 *       data={users}
 *       rowKey="id"
 *       searchable
 *       selectionMode="multiple"
 *       columnToggle
 *       striped
 *       hoverable
 *       onRowClick={(row) => navigate(`/users/${row.id}`)}
 *       onSelectionChange={(keys) => setSelected(keys)}
 *     />
 *   );
 * }
 * ```
 */
export function DataTable<T = any>(options: TableOptions<T>) {
  const {
    searchable = false,
    selectionMode = 'none',
    paginated = true,
    columnToggle = false,
    resizable = true,
    expandable,
    className = '',
    emptyState,
    loading = false,
    onRowClick,
    striped = false,
    hoverable = true,
    compact = false,
    bordered = false,
  } = options;

  const table = useTable(options);

  const selectable = selectionMode !== 'none';
  const hasTopBar = searchable || columnToggle;

  const pageOffset = paginated ? (table.pagination.page - 1) * table.pagination.pageSize : 0;

  return (
    <div
      className={className}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Top bar: search, filters, column toggle */}
      {hasTopBar && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          {searchable && (
            <div style={{ flex: 1 }}>
              <SearchFilter
                searchQuery={table.searchQuery}
                onSearchChange={table.setSearchQuery}
                columns={table.visibleColumns}
                filters={table.filters}
                onFilterChange={table.setFilter}
                onFilterRemove={table.removeFilter}
                onFiltersClear={table.clearFilters}
                compact={compact}
              />
            </div>
          )}

          {columnToggle && (
            <div
              style={{
                padding: compact ? '8px 12px' : '12px 16px',
                borderBottom: searchable ? undefined : '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end',
                alignSelf: 'center',
              }}
            >
              <ColumnToggle
                columns={options.columns}
                visibleColumns={table.visibleColumns}
                onToggle={table.toggleColumn}
              />
            </div>
          )}
        </div>
      )}

      {/* Selection info bar */}
      {selectable && table.selectedKeys.size > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            backgroundColor: '#eff6ff',
            borderBottom: '1px solid #bfdbfe',
            fontSize: 13,
            color: '#1e40af',
          }}
        >
          <span>
            <strong>{table.selectedKeys.size}</strong> row{table.selectedKeys.size !== 1 ? 's' : ''} selected
          </span>
          <button
            type="button"
            onClick={table.clearSelection}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 4,
            }}
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto', position: 'relative' }}>
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                border: '3px solid #e5e7eb',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'dt-spin 0.7s linear infinite',
              }}
            />
            <style>{`@keyframes dt-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        <table
          role="grid"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: resizable ? 'fixed' : 'auto',
          }}
        >
          <TableHeader
            columns={table.visibleColumns}
            selectable={selectable}
            isAllSelected={table.isAllSelected}
            isSomeSelected={table.isSomeSelected}
            onSelectAll={table.toggleSelectAll}
            getSortDirection={table.getSortDirection}
            getSortIndex={table.getSortIndex}
            onSort={table.toggleSort}
            resizable={resizable}
            columnWidths={table.columnWidths}
            onColumnResize={table.setColumnWidth}
            compact={compact}
            bordered={bordered}
          />

          <TableBody
            data={table.paginatedData}
            columns={table.visibleColumns}
            getRowKey={table.getRowKey}
            selectable={selectable}
            isSelected={table.isSelected}
            onSelect={table.toggleSelect}
            expandable={expandable}
            isExpanded={table.isExpanded}
            onExpand={table.toggleExpand}
            onRowClick={onRowClick}
            striped={striped}
            hoverable={hoverable}
            compact={compact}
            bordered={bordered}
            columnWidths={table.columnWidths}
            emptyState={emptyState}
            loading={loading}
            pageOffset={pageOffset}
          />
        </table>
      </div>

      {/* Pagination */}
      {paginated && table.totalItems > 0 && (
        <Pagination
          pagination={table.pagination}
          totalPages={table.totalPages}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
          compact={compact}
        />
      )}
    </div>
  );
}

DataTable.displayName = 'DataTable';
