'use client';

interface DataTableProps {
  columns: {
    key: string;
    label: string;
    render?: (row: Record<string, unknown>) => React.ReactNode;
  }[];
  rows: Record<string, unknown>[];
  onRowClick?: (row: Record<string, unknown>) => void;
  emptyMessage?: string;
}

export function DataTable({
  columns,
  rows,
  onRowClick,
  emptyMessage = 'No data',
}: DataTableProps) {
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-160 text-left text-sm">
        <thead className="sticky top-0 z-10 bg-card">
          <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3 font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={(row.id as string) || i}
              className={`border-b border-border last:border-0 ${
                onRowClick ? 'cursor-pointer hover:bg-accent' : ''
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-foreground">
                  {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
