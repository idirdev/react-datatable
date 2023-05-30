import React, { useCallback, useRef, useState } from 'react';
import type { Column, SortDirection } from '../types';

interface TableHeaderProps<T> {
  columns: Column<T>[];
  selectable: boolean;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onSelectAll: () => void;
  getSortDirection: (key: string) => SortDirection | null;
  getSortIndex: (key: string) => number;
  onSort: (key: string) => void;
  resizable: boolean;
  columnWidths: Record<string, number>;
  onColumnResize: (key: string, width: number) => void;
  compact: boolean;
  bordered: boolean;
}

const SortIcon = ({ direction }: { direction: SortDirection | null }) => {
  if (!direction) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} opacity={0.3}>
        <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
      </svg>
    );
  }

  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      {direction === 'asc' ? <path d="M8 15l4-4 4 4" /> : <path d="M8 9l4 4 4-4" />}
    </svg>
  );
};

export function TableHeader<T>({
  columns,
  selectable,
  isAllSelected,
  isSomeSelected,
  onSelectAll,
  getSortDirection,
  getSortIndex,
  onSort,
  resizable,
  columnWidths,
  onColumnResize,
  compact,
  bordered,
}: TableHeaderProps<T>) {
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const currentColumnRef = useRef<string>('');

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, columnKey: string) => {
      e.preventDefault();
      e.stopPropagation();

      setResizingColumn(columnKey);
      startXRef.current = e.clientX;
      currentColumnRef.current = columnKey;

      const thEl = (e.target as HTMLElement).closest('th');
      startWidthRef.current = columnWidths[columnKey] || thEl?.offsetWidth || 100;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startXRef.current;
        const col = columns.find((c) => c.key === currentColumnRef.current);
        const minWidth = col?.minWidth || 50;
        const newWidth = Math.max(minWidth, startWidthRef.current + delta);
        onColumnResize(currentColumnRef.current, newWidth);
      };

      const handleMouseUp = () => {
        setResizingColumn(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [columns, columnWidths, onColumnResize]
  );

  const cellPadding = compact ? '8px 10px' : '12px 16px';

  return (
    <thead>
      <tr style={{ backgroundColor: '#f9fafb' }}>
        {/* Selection checkbox */}
        {selectable && (
          <th
            style={{
              padding: cellPadding,
              width: 44,
              textAlign: 'center',
              borderBottom: '2px solid #e5e7eb',
              borderRight: bordered ? '1px solid #e5e7eb' : undefined,
              position: 'sticky',
              top: 0,
              backgroundColor: '#f9fafb',
              zIndex: 1,
            }}
          >
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isSomeSelected;
              }}
              onChange={onSelectAll}
              style={{ cursor: 'pointer', width: 16, height: 16 }}
              aria-label="Select all rows"
            />
          </th>
        )}

        {/* Column headers */}
        {columns.map((column) => {
          const sortDir = column.sortable !== false ? getSortDirection(column.key) : null;
          const sortIdx = getSortIndex(column.key);
          const isSortable = column.sortable !== false;
          const width = columnWidths[column.key] || column.width;

          return (
            <th
              key={column.key}
              style={{
                padding: cellPadding,
                textAlign: (column.align as any) || 'left',
                fontWeight: 600,
                fontSize: 13,
                color: '#374151',
                borderBottom: '2px solid #e5e7eb',
                borderRight: bordered ? '1px solid #e5e7eb' : undefined,
                whiteSpace: 'nowrap',
                position: 'relative',
                width: typeof width === 'number' ? width : width,
                minWidth: column.minWidth,
                cursor: isSortable ? 'pointer' : 'default',
                userSelect: 'none',
                ...(column.sticky
                  ? {
                      position: 'sticky',
                      [column.sticky]: 0,
                      zIndex: 2,
                      backgroundColor: '#f9fafb',
                    }
                  : {
                      position: 'sticky',
                      top: 0,
                      backgroundColor: '#f9fafb',
                      zIndex: 1,
                    }),
              }}
              onClick={isSortable ? () => onSort(column.key) : undefined}
              aria-sort={sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : undefined}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {column.headerRender ? column.headerRender(column) : column.title}

                {isSortable && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                    <SortIcon direction={isSortable ? getSortDirection(column.key) : null} />
                    {sortIdx >= 0 && (
                      <span style={{ fontSize: 10, color: '#6b7280', marginLeft: 2 }}>
                        {sortIdx + 1}
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Resize handle */}
              {resizable && column.resizable !== false && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 6,
                    cursor: 'col-resize',
                    backgroundColor: resizingColumn === column.key ? '#3b82f6' : 'transparent',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseDown={(e) => handleResizeStart(e, column.key)}
                  onMouseEnter={(e) => {
                    if (!resizingColumn) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#d1d5db';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (resizingColumn !== column.key) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }
                  }}
                />
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

TableHeader.displayName = 'TableHeader';
