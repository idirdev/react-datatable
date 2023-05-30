import React, { ReactNode } from 'react';
import type { Column } from '../types';
import { TableRow } from './TableRow';

interface TableBodyProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowKey: (row: T, index: number) => string | number;
  selectable: boolean;
  isSelected: (key: string | number) => boolean;
  onSelect: (key: string | number) => void;
  expandable?: (row: T, index: number) => ReactNode;
  isExpanded: (key: string | number) => boolean;
  onExpand: (key: string | number) => void;
  onRowClick?: (row: T, index: number) => void;
  striped: boolean;
  hoverable: boolean;
  compact: boolean;
  bordered: boolean;
  columnWidths: Record<string, number>;
  emptyState?: ReactNode;
  loading?: boolean;
  pageOffset: number;
}

const DefaultEmptyState = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      color: '#9ca3af',
    }}
  >
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      style={{ marginBottom: 12, opacity: 0.5 }}
    >
      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <p style={{ fontSize: 15, fontWeight: 500 }}>No data found</p>
    <p style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your search or filters</p>
  </div>
);

const LoadingOverlay = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      zIndex: 10,
    }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        border: '3px solid #e5e7eb',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'dt-spin 0.7s linear infinite',
      }}
    />
    <style>{`@keyframes dt-spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export function TableBody<T>({
  data,
  columns,
  getRowKey,
  selectable,
  isSelected,
  onSelect,
  expandable,
  isExpanded,
  onExpand,
  onRowClick,
  striped,
  hoverable,
  compact,
  bordered,
  columnWidths,
  emptyState,
  loading,
  pageOffset,
}: TableBodyProps<T>) {
  const totalColumns = columns.length + (selectable ? 1 : 0);

  return (
    <tbody style={{ position: 'relative' }}>
      {loading && (
        <tr>
          <td colSpan={totalColumns} style={{ position: 'relative', height: 0, padding: 0, border: 'none' }}>
            <LoadingOverlay />
          </td>
        </tr>
      )}

      {data.length === 0 && !loading && (
        <tr>
          <td colSpan={totalColumns} style={{ border: 'none' }}>
            {emptyState || <DefaultEmptyState />}
          </td>
        </tr>
      )}

      {data.map((row, index) => {
        const absoluteIndex = pageOffset + index;
        const key = getRowKey(row, absoluteIndex);

        return (
          <TableRow
            key={key}
            row={row}
            rowIndex={absoluteIndex}
            columns={columns}
            rowKey={key}
            selectable={selectable}
            isSelected={isSelected(key)}
            onSelect={onSelect}
            expandable={Boolean(expandable)}
            isExpanded={isExpanded(key)}
            onExpand={onExpand}
            expandContent={expandable ? expandable(row, absoluteIndex) : undefined}
            onClick={onRowClick}
            striped={striped}
            hoverable={hoverable}
            compact={compact}
            bordered={bordered}
            columnWidths={columnWidths}
          />
        );
      })}
    </tbody>
  );
}

TableBody.displayName = 'TableBody';
