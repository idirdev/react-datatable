import React, { useMemo } from 'react';
import type { PaginationConfig } from '../types';

interface PaginationProps {
  pagination: PaginationConfig;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  compact: boolean;
}

/**
 * Generate page numbers to display.
 * Shows first, last, and pages around the current page with ellipsis.
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];

  // Always show first page
  pages.push(1);

  if (currentPage <= 3) {
    pages.push(2, 3, 4, 'ellipsis', totalPages);
  } else if (currentPage >= totalPages - 2) {
    pages.push('ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push('ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
  }

  return pages;
}

const buttonBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 36,
  height: 36,
  padding: '0 8px',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  backgroundColor: '#ffffff',
  color: '#374151',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.15s',
  fontFamily: 'inherit',
};

const activeButtonStyle: React.CSSProperties = {
  ...buttonBase,
  backgroundColor: '#3b82f6',
  borderColor: '#3b82f6',
  color: '#ffffff',
};

const disabledButtonStyle: React.CSSProperties = {
  ...buttonBase,
  opacity: 0.4,
  cursor: 'not-allowed',
};

export function Pagination({
  pagination,
  totalPages,
  onPageChange,
  onPageSizeChange,
  compact,
}: PaginationProps) {
  const { page, pageSize, totalItems, pageSizeOptions = [10, 25, 50, 100] } = pagination;

  const pageNumbers = useMemo(() => getPageNumbers(page, totalPages), [page, totalPages]);

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  const containerPadding = compact ? '8px 12px' : '12px 16px';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: containerPadding,
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        fontSize: 13,
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      {/* Left: info + page size */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#6b7280' }}>
        <span>
          Showing <strong style={{ color: '#111827' }}>{startItem}</strong> to{' '}
          <strong style={{ color: '#111827' }}>{endItem}</strong> of{' '}
          <strong style={{ color: '#111827' }}>{totalItems}</strong> results
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label htmlFor="dt-page-size" style={{ whiteSpace: 'nowrap' }}>
            Per page:
          </label>
          <select
            id="dt-page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              fontSize: 13,
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              color: '#374151',
            }}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: page numbers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Previous button */}
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          style={page <= 1 ? disabledButtonStyle : buttonBase}
          aria-label="Previous page"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        {pageNumbers.map((pageNum, i) => {
          if (pageNum === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${i}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 36,
                  height: 36,
                  color: '#9ca3af',
                  fontSize: 14,
                  letterSpacing: 2,
                }}
              >
                ...
              </span>
            );
          }

          const isActive = pageNum === page;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              style={isActive ? activeButtonStyle : buttonBase}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Page ${pageNum}`}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff';
                }
              }}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next button */}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          style={page >= totalPages ? disabledButtonStyle : buttonBase}
          aria-label="Next page"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

Pagination.displayName = 'Pagination';
