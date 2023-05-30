import React, { ReactNode } from 'react';
import type { Column } from '../types';
import { getNestedValue } from '../utils/sort';

interface TableRowProps<T> {
  row: T;
  rowIndex: number;
  columns: Column<T>[];
  rowKey: string | number;
  selectable: boolean;
  isSelected: boolean;
  onSelect: (key: string | number) => void;
  expandable: boolean;
  isExpanded: boolean;
  onExpand: (key: string | number) => void;
  expandContent?: ReactNode;
  onClick?: (row: T, index: number) => void;
  striped: boolean;
  hoverable: boolean;
  compact: boolean;
  bordered: boolean;
  columnWidths: Record<string, number>;
}

export function TableRow<T>({
  row,
  rowIndex,
  columns,
  rowKey,
  selectable,
  isSelected,
  onSelect,
  expandable,
  isExpanded,
  onExpand,
  expandContent,
  onClick,
  striped,
  hoverable,
  compact,
  bordered,
  columnWidths,
}: TableRowProps<T>) {
  const cellPadding = compact ? '6px 10px' : '10px 16px';
  const isEven = rowIndex % 2 === 0;

  const rowBg = isSelected
    ? '#eff6ff'
    : striped && !isEven
    ? '#f9fafb'
    : '#ffffff';

  const hoverStyles = hoverable
    ? {
        cursor: onClick ? 'pointer' : undefined,
      }
    : {};

  return (
    <>
      <tr
        style={{
          backgroundColor: rowBg,
          transition: 'background-color 0.1s',
          ...hoverStyles,
        }}
        onClick={() => onClick?.(row, rowIndex)}
        onMouseEnter={(e) => {
          if (hoverable) {
            (e.currentTarget as HTMLElement).style.backgroundColor = isSelected
              ? '#dbeafe'
              : '#f3f4f6';
          }
        }}
        onMouseLeave={(e) => {
          if (hoverable) {
            (e.currentTarget as HTMLElement).style.backgroundColor = rowBg;
          }
        }}
        aria-selected={isSelected || undefined}
      >
        {/* Selection checkbox */}
        {selectable && (
          <td
            style={{
              padding: cellPadding,
              width: 44,
              textAlign: 'center',
              borderBottom: '1px solid #e5e7eb',
              borderRight: bordered ? '1px solid #e5e7eb' : undefined,
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(rowKey);
              }}
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: 'pointer', width: 16, height: 16 }}
              aria-label={`Select row ${rowIndex + 1}`}
            />
          </td>
        )}

        {/* Data cells */}
        {columns.map((column) => {
          const value = getNestedValue(row, column.key);
          const width = columnWidths[column.key] || column.width;

          const cellContent = column.render
            ? column.render(value, row, rowIndex)
            : value != null
            ? String(value)
            : '';

          return (
            <td
              key={column.key}
              className={column.className}
              style={{
                padding: cellPadding,
                textAlign: (column.align as any) || 'left',
                borderBottom: '1px solid #e5e7eb',
                borderRight: bordered ? '1px solid #e5e7eb' : undefined,
                fontSize: 14,
                color: '#374151',
                width: typeof width === 'number' ? width : width,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                ...(column.sticky
                  ? {
                      position: 'sticky' as const,
                      [column.sticky]: 0,
                      backgroundColor: rowBg,
                      zIndex: 1,
                    }
                  : {}),
                ...column.style,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Expand toggle for first column */}
                {expandable && column === columns[0] && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExpand(rowKey);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 2,
                      display: 'inline-flex',
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.15s',
                      color: '#6b7280',
                    }}
                    aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
                <span>{cellContent}</span>
              </div>
            </td>
          );
        })}
      </tr>

      {/* Expanded content */}
      {expandable && isExpanded && expandContent && (
        <tr>
          <td
            colSpan={columns.length + (selectable ? 1 : 0)}
            style={{
              padding: compact ? '10px 16px' : '16px 24px',
              backgroundColor: '#fafafa',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            {expandContent}
          </td>
        </tr>
      )}
    </>
  );
}

TableRow.displayName = 'TableRow';
