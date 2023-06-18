# React DataTable

[![npm version](https://img.shields.io/npm/v/@idirdev/react-datatable.svg)](https://www.npmjs.com/package/@idirdev/react-datatable)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-green.svg)]()

Feature-rich data table component for React. Sorting, filtering, pagination, selection, column resize, and more -- all with zero dependencies.

## Features

- Multi-column sorting with visual indicators
- Global search with debounced input
- Per-column filters (text, number, date, select)
- Pagination with page size selector
- Row selection (single or multiple)
- Column visibility toggle
- Column resize via drag handles
- Row expansion with custom content
- Sticky columns (left/right)
- Custom cell renderers
- Empty and loading states
- Compact, striped, bordered modes
- Full TypeScript support
- Zero external dependencies

## Installation

```bash
npm install @idirdev/react-datatable
```

## Quick Start

```tsx
import { DataTable } from '@idirdev/react-datatable';

const columns = [
  { key: 'name', title: 'Name', sortable: true, filterable: true },
  { key: 'email', title: 'Email', sortable: true },
  { key: 'role', title: 'Role', filterable: true, filterType: 'select',
    filterOptions: [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' },
    ],
  },
  { key: 'age', title: 'Age', sortable: true, align: 'right' },
];

function UsersPage() {
  return (
    <DataTable
      columns={columns}
      data={users}
      rowKey="id"
      searchable
      selectionMode="multiple"
      columnToggle
      striped
      hoverable
    />
  );
}
```

## Column Definition

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `key` | `string` | required | Property name in data object |
| `title` | `ReactNode` | required | Column header label |
| `render` | `(value, row, index) => ReactNode` | - | Custom cell renderer |
| `sortable` | `boolean` | `true` | Enable sorting |
| `comparator` | `(a, b) => number` | - | Custom sort comparator |
| `filterable` | `boolean` | `false` | Enable column filter |
| `filterType` | `'text' \| 'number' \| 'date' \| 'select'` | `'text'` | Filter input type |
| `filterOptions` | `{ label, value }[]` | - | Options for select filter |
| `width` | `string \| number` | auto | Column width |
| `minWidth` | `number` | `50` | Minimum width in px |
| `resizable` | `boolean` | `true` | Allow column resize |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Cell alignment |
| `visible` | `boolean` | `true` | Initial visibility |
| `sticky` | `'left' \| 'right'` | - | Sticky position |
| `className` | `string` | - | Cell CSS class |

## Table Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `Column[]` | required | Column definitions |
| `data` | `T[]` | required | Data array |
| `rowKey` | `string \| (row, i) => string` | index | Unique row identifier |
| `searchable` | `boolean` | `false` | Show global search bar |
| `selectionMode` | `'none' \| 'single' \| 'multiple'` | `'none'` | Row selection mode |
| `paginated` | `boolean` | `true` | Enable pagination |
| `defaultPageSize` | `number` | `10` | Initial page size |
| `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | Page size dropdown options |
| `columnToggle` | `boolean` | `false` | Show column visibility toggle |
| `resizable` | `boolean` | `true` | Enable column resizing |
| `expandable` | `(row, index) => ReactNode` | - | Row expand content renderer |
| `striped` | `boolean` | `false` | Alternating row colors |
| `hoverable` | `boolean` | `true` | Highlight row on hover |
| `compact` | `boolean` | `false` | Reduced padding |
| `bordered` | `boolean` | `false` | Cell borders |
| `loading` | `boolean` | `false` | Show loading overlay |
| `emptyState` | `ReactNode` | default | Custom empty state |
| `onRowClick` | `(row, index) => void` | - | Row click handler |
| `onSelectionChange` | `(keys: Set) => void` | - | Selection change callback |
| `onSortChange` | `(sorts: SortConfig[]) => void` | - | Sort change callback |
| `onPageChange` | `(page, pageSize) => void` | - | Page change callback |

## Advanced Usage

### Custom Cell Renderers

```tsx
const columns = [
  {
    key: 'status',
    title: 'Status',
    render: (value) => (
      <span className={`badge badge-${value}`}>{value}</span>
    ),
  },
  {
    key: 'actions',
    title: '',
    sortable: false,
    align: 'right',
    render: (_, row) => (
      <button onClick={() => handleEdit(row)}>Edit</button>
    ),
  },
];
```

### Row Expansion

```tsx
<DataTable
  columns={columns}
  data={orders}
  expandable={(row) => (
    <div>
      <h4>Order Details</h4>
      <ul>
        {row.items.map(item => (
          <li key={item.id}>{item.name} x{item.qty}</li>
        ))}
      </ul>
    </div>
  )}
/>
```

### Server-Side Operations

```tsx
<DataTable
  columns={columns}
  data={serverData}
  onSortChange={(sorts) => {
    fetchData({ sort: sorts[0]?.key, order: sorts[0]?.direction });
  }}
  onPageChange={(page, pageSize) => {
    fetchData({ page, limit: pageSize });
  }}
/>
```

### Using the Hook Directly

```tsx
import { useTable } from '@idirdev/react-datatable';

function CustomTable({ data, columns }) {
  const table = useTable({ columns, data, paginated: true });

  return (
    <div>
      <input
        value={table.searchQuery}
        onChange={(e) => table.setSearchQuery(e.target.value)}
      />
      {/* Build your own table UI using table state */}
    </div>
  );
}
```

## License

MIT
