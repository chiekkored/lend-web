"use client";

import {
  AdminDataTable,
  type AdminDataTablePaginationProps,
} from "@/components/admin/admin-data-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminBooking } from "@/lib/admin-bookings";

import { useBookingColumns } from "./booking-columns";

export type BookingActionsMode = "default" | "pending-damage";
export type BookingStatusFilter = "all" | "pending" | "completed";

type BookingTableProps = {
  actionsMode?: BookingActionsMode;
  data: AdminBooking[];
  error: string | null;
  filterValue?: BookingStatusFilter;
  loading: boolean;
  onFilterChange?: (value: BookingStatusFilter) => void;
  pagination?: AdminDataTablePaginationProps;
  storageKey?: string;
};

export function BookingTable({
  actionsMode = "default",
  data,
  error,
  filterValue,
  loading,
  onFilterChange,
  pagination,
  storageKey = "admin:bookings:column-visibility",
}: BookingTableProps) {
  const columns = useBookingColumns({ actionsMode });
  const toolbarFilter =
    filterValue && onFilterChange ? (
      <Select onValueChange={(value) => onFilterChange(value as BookingStatusFilter)} value={filterValue}>
        <SelectTrigger aria-label="Filter bookings" className="w-full sm:w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="all">All</SelectItem>
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
