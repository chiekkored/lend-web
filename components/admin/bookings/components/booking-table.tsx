"use client";

import {
  AdminDataTable,
  type AdminDataTablePaginationProps,
} from "@/components/admin/admin-data-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type {
  AdminBooking,
  AdminCancellationRequestStatusFilter,
} from "@/lib/admin-bookings";

import { useBookingColumns } from "./booking-columns";

export type BookingActionsMode = "all" | "cancellations" | "pending-damage";
export type BookingStatusFilter = "all" | "pending" | "completed";
export type BookingTableFilterValue =
  | BookingStatusFilter
  | AdminCancellationRequestStatusFilter;

export type BookingTableFilterOption<
  TValue extends BookingTableFilterValue = BookingTableFilterValue,
> = {
  label: string;
  value: TValue;
};

type BookingTableProps = {
  actionsMode?: BookingActionsMode;
  data: AdminBooking[];
  error: string | null;
  filterOptions?: BookingTableFilterOption[];
  filterValue?: BookingTableFilterValue;
  loading: boolean;
  onFilterChange?: (value: BookingTableFilterValue) => void;
  pagination?: AdminDataTablePaginationProps;
  storageKey?: string;
};

const defaultFilterOptions: BookingTableFilterOption<BookingStatusFilter>[] = [
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "All", value: "all" },
];

export function BookingTable({
  actionsMode = "all",
  data,
  error,
  filterOptions = defaultFilterOptions,
  filterValue,
  loading,
  onFilterChange,
  pagination,
  storageKey = "admin:bookings:column-visibility",
}: BookingTableProps) {
  const columns = useBookingColumns({ actionsMode });
  const toolbarFilter =
    filterValue && onFilterChange ? (
      <Select
        onValueChange={(value) => onFilterChange(value as BookingTableFilterValue)}
        value={filterValue}
      >
        <SelectTrigger aria-label="Filter bookings" className="w-full sm:w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {filterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : null;

  return (
    <AdminDataTable
      columns={columns}
      data={data}
      emptyMessage="No bookings match this view."
      error={error}
      loading={loading}
      pagination={pagination}
      primaryColumnId="booking"
      searchPlaceholder="Search bookings"
      storageKey={storageKey}
      toolbarFilter={toolbarFilter}
    />
  );
}
