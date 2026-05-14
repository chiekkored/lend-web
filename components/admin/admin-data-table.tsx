"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronsUpDown, ChevronUp, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type AdminDataTableProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  emptyMessage?: string;
  error?: string | null;
  loading?: boolean;
  searchPlaceholder?: string;
  title?: string;
};

export function AdminDataTable<TData>({
  columns,
  data,
  emptyMessage = "No records found.",
  error,
  loading = false,
  searchPlaceholder = "Search",
  title = "Records",
}: AdminDataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    state: {
      globalFilter,
      sorting,
    },
  });

  const visibleRows = table.getRowModel().rows;
  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <Card>
      <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder={searchPlaceholder}
            value={globalFilter}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sortState = header.column.getIsSorted();
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <Button
                            className={cn(
                              "-ml-3 h-8 px-3",
                              sortState && "text-foreground",
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                            size="sm"
                            variant="ghost"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {sortState === "asc" ? (
                              <ChevronUp />
                            ) : sortState === "desc" ? (
                              <ChevronDown />
                            ) : (
                              <ChevronsUpDown />
                            )}
                          </Button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    className="h-24 text-center text-muted-foreground"
                    colSpan={columns.length}
                  >
                    Loading records...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    className="h-24 text-center text-destructive"
                    colSpan={columns.length}
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : visibleRows.length ? (
                visibleRows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-24 text-center text-muted-foreground"
                    colSpan={columns.length}
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>
            Showing {visibleRows.length} of {filteredCount} records
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span>Rows</span>
            <Select
              onValueChange={(value) => table.setPageSize(Number(value))}
              value={`${table.getState().pagination.pageSize}`}
            >
              <SelectTrigger className="h-9 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {Math.max(table.getPageCount(), 1)}
            </span>
            <Button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              size="sm"
              variant="outline"
            >
              Previous
            </Button>
            <Button
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              size="sm"
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
