"use client";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import type { AdminBooking } from "@/lib/admin-bookings";

import { useBookingColumns } from "./booking-columns";

export type BookingActionsMode = "default" | "pending-damage";

type BookingTableProps = {
  actionsMode?: BookingActionsMode;
  data: AdminBooking[];
  error: string | null;
  loading: boolean;
  storageKey?: string;
};

export function BookingTable({
  actionsMode = "default",
  data,
  error,
  loading,
  storageKey = "admin:bookings:column-visibility",
}: BookingTableProps) {
  const columns = useBookingColumns({ actionsMode });

  return (
    <AdminDataTable
      columns={columns}
      data={data}
      emptyMessage="No bookings match this view."
      error={error}
      loading={loading}
      primaryColumnId="booking"
      searchPlaceholder="Search bookings"
      storageKey={storageKey}
    />
  );
}
