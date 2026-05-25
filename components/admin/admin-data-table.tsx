"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  functionalUpdate,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronsUpDown, ChevronUp, Columns3, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type AdminDataTableProps<TData> = {
  actions?: React.ReactNode;
  columns: ColumnDef<TData>[];
  data: TData[];
  emptyMessage?: string;
  error?: string | null;
  loading?: boolean;
  primaryColumnId?: string;
  searchPlaceholder?: string;
  storageKey?: string;
  toolbarFilter?: React.ReactNode;
};

export function AdminDataTable<TData>({
  actions,
  columns,
  data,
  emptyMessage = "No records found.",
  error,
  loading = false,
  primaryColumnId,
  searchPlaceholder = "Search",
  storageKey,
  toolbarFilter,
}: AdminDataTableProps<TData>) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(() =>
      readColumnVisibilityState(storageKey, primaryColumnId),
    );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const handleColumnVisibilityChange = React.useCallback(
    (updater: React.SetStateAction<VisibilityState>) => {
      setColumnVisibility((current) => {
        const next = functionalUpdate(updater, current);

        if (!primaryColumnId) {
          return next;
        }

        return {
          ...next,
          [primaryColumnId]: true,
        };
      });
    },
    [primaryColumnId],
  );

  React.useEffect(() => {
    if (!storageKey || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(columnVisibility));
  }, [columnVisibility, storageKey]);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    state: {
      columnVisibility,
      globalFilter,
      sorting,
    },
  });

  const visibleRows = table.getRowModel().rows;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const hideableColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide() && column.id !== primaryColumnId);

  return (
    <div className="min-w-0 w-full max-w-full space-y-4">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full min-w-0 sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(event) => setGlobalFilter(event.target.value)}
              placeholder={searchPlaceholder}
              value={globalFilter}
            />
          </div>
          {toolbarFilter}
        </div>
        <div className="flex min-w-0 flex-wrap gap-2">
          {hideableColumns.length ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Columns3 />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {hideableColumns.map((column) => (
                  <DropdownMenuCheckboxItem
                    checked={column.getIsVisible()}
                    key={column.id}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {getColumnLabel(column.id)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {actions}
        </div>
      </div>
      <div className="min-w-0 w-full max-w-full">
        <div className="min-w-0 w-full max-w-full overflow-x-auto rounded-md border">
          <Table className="w-max min-w-full" wrapperClassName="overflow-visible">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sortState = header.column.getIsSorted();
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <Button
                            className={cn("-ml-3 h-8 px-3", sortState && "text-foreground")}
                            onClick={header.column.getToggleSortingHandler()}
                            size="sm"
                            variant="ghost"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {sortState === "asc" ? (
                              <ChevronUp />
                            ) : sortState === "desc" ? (
                              <ChevronDown />
                            ) : (
                              <ChevronsUpDown />
                            )}
                          </Button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
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
                  <TableCell className="h-24 text-center text-muted-foreground" colSpan={columns.length}>
                    Loading records...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell className="h-24 text-center text-destructive" colSpan={columns.length}>
                    {error}
                  </TableCell>
                </TableRow>
              ) : visibleRows.length ? (
                visibleRows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="h-24 text-center text-muted-foreground" colSpan={columns.length}>
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
              Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
            </span>
            <Button
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              size="sm"
              variant="outline"
            >
              Previous
            </Button>
            <Button disabled={!table.getCanNextPage()} onClick={() => table.nextPage()} size="sm" variant="outline">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getColumnLabel(columnId: string) {
  return columnId
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/^./, (value) => value.toUpperCase());
}

function readColumnVisibilityState(
  storageKey: string | undefined,
  primaryColumnId: string | undefined,
): VisibilityState {
  if (!storageKey || typeof window === "undefined") {
    return primaryColumnId ? { [primaryColumnId]: true } : {};
  }

  try {
    const storedValue = window.localStorage.getItem(storageKey);
    const parsedValue = storedValue ? JSON.parse(storedValue) : {};
    const visibilityState =
      parsedValue && typeof parsedValue === "object"
        ? (parsedValue as VisibilityState)
        : {};

    if (!primaryColumnId) {
      return visibilityState;
    }

    return {
      ...visibilityState,
      [primaryColumnId]: true,
    };
  } catch {
    return primaryColumnId ? { [primaryColumnId]: true } : {};
  }
}
