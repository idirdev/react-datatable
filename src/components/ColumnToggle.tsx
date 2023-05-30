import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Column } from '../types';

interface ColumnToggleProps<T> {
  columns: Column<T>[];
  visibleColumns: Column<T>[];
  onToggle: (key: string) => void;
}

/**
 * Dropdown to show/hide table columns.
 *
 * Renders a button that opens a dropdown with checkboxes for each column.
 * Users can toggle column visibility without losing data or sort state.
 */
export function ColumnToggle<T>({
  columns,
  visibleColumns,
  onToggle,
}: ColumnToggleProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleKeys = new Set(visibleColumns.map((c) => c.key));

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    }
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-haspopup="listbox"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: 8,
          backgroundColor: '#ffffff',
          color: '#374151',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 3v18M3 12h18" />
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        Columns
        <span
          style={{
            fontSize: 11,
            color: '#9ca3af',
          }}
        >
          ({visibleColumns.length}/{columns.length})
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            minWidth: 200,
            maxHeight: 300,
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            zIndex: 50,
            padding: '4px 0',
          }}
          onKeyDown={handleKeyDown}
        >
          <div
            style={{
              padding: '8px 12px',
              fontSize: 11,
              fontWeight: 600,
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '1px solid #f3f4f6',
            }}
          >
            Toggle columns
          </div>

          {columns.map((column) => {
            const isVisible = visibleKeys.has(column.key);
            // Don't allow hiding the last visible column
            const isLastVisible = isVisible && visibleColumns.length === 1;

            return (
              <label
                key={column.key}
                role="option"
                aria-selected={isVisible}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  cursor: isLastVisible ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  color: isLastVisible ? '#d1d5db' : '#374151',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => {
                  if (!isLastVisible) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '';
                }}
              >
                <input
                  type="checkbox"
                  checked={isVisible}
                  disabled={isLastVisible}
                  onChange={() => {
                    if (!isLastVisible) onToggle(column.key);
                  }}
                  style={{
                    width: 16,
                    height: 16,
                    cursor: isLastVisible ? 'not-allowed' : 'pointer',
                    accentColor: '#3b82f6',
                  }}
                />
                <span>{column.title as string}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

ColumnToggle.displayName = 'ColumnToggle';
