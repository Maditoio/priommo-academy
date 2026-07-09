import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({ columns, data, emptyMessage }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-[12px] border border-navy/10 bg-paper p-12 text-center text-ink-muted">
        {emptyMessage ?? "No data"}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[12px] border border-navy/10 bg-paper">
      <Table>
        <TableHeader>
          <TableRow className="border-navy/10 hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id} className="border-navy/10 hover:bg-navy/[0.02]">
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
                  {col.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
