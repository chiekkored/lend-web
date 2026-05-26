"use client";

import * as React from "react";

import { BookingTable } from "./components";
import type {
  BookingStatusFilter,
  BookingTableFilterOption,
  BookingTableFilterValue,
} from "./components";
import { useCancellationBookings } from "./hooks/use-cancellation-bookings";
import { useBookings } from "./hooks/use-bookings";
import { usePendingDamageBookings } from "./hooks/use-pending-damage-bookings";
import {
  isCompletedDamageBooking,
  isPendingDamageBooking,
  type AdminCancellationRequestStatusFilter,
  type AdminBooking,
} from "@/lib/admin-bookings";

type BookingsPageMode = "all" | "cancellations" | "pending-damage";

type BookingsPageProps = {
  mode?: BookingsPageMode;
};

const cancellationFilterOptions: BookingTableFilterOption<
  AdminCancellationRequestStatusFilter
>[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

export function BookingsPage({ mode = "all" }: BookingsPageProps) {
  const isCancellations = mode === "cancellations";
  const isPendingDamage = mode === "pending-damage";
  const [statusFilter, setStatusFilter] = React.useState<BookingStatusFilter>(
    isPendingDamage ? "pending" : "all",
  );
  const [cancellationStatusFilter, setCancellationStatusFilter] =
    React.useState<AdminCancellationRequestStatusFilter>("all");
  const bookings = useBookings({
    enabled: !isPendingDamage && !isCancellations,
  });
  const cancellationBookings = useCancellationBookings({
    enabled: isCancellations,
    statusFilter: cancellationStatusFilter,
  });
  const pendingDamageBookings = usePendingDamageBookings({
    enabled: isPendingDamage,
  });
  const { data, error, loading } = isPendingDamage
    ? pendingDamageBookings
    : isCancellations
      ? cancellationBookings
      : bookings;
  const pagination = isPendingDamage
    ? pendingDamageBookings.pagination
    : isCancellations
      ? cancellationBookings.pagination
      : bookings.pagination;
  const filteredData = isCancellations
    ? data
    : isPendingDamage
      ? data.filter((booking) => matchesDamageFilter(booking, statusFilter))
      : data.filter((booking) => matchesBookingStatusFilter(booking, statusFilter));
  const tableFilterValue: BookingTableFilterValue = isCancellations
    ? cancellationStatusFilter
    : statusFilter;
  const tableFilterOptions = isCancellations ? cancellationFilterOptions : undefined;
  const handleFilterChange = React.useCallback(
    (value: BookingTableFilterValue) => {
      if (isCancellations) {
        setCancellationStatusFilter(
          value as AdminCancellationRequestStatusFilter,
        );
        return;
      }

      setStatusFilter(value as BookingStatusFilter);
    },
    [isCancellations],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">
          {isCancellations
            ? "Cancellation requests"
            : isPendingDamage
              ? "Pending damage fees"
              : "Bookings management"}
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          {isCancellations
            ? "Review owner and renter cancellation requests, refunds, restored chats, and owner penalties."
            : isPendingDamage
              ? "View total loss and over-deposit damage support cases, evidence, and support chats."
            : "Track rental status, cancellation requests, disputes, and transaction health."}
        </p>
      </div>
      <BookingTable
        data={filteredData}
        error={error}
        filterOptions={tableFilterOptions}
        filterValue={tableFilterValue}
        loading={loading}
        onFilterChange={handleFilterChange}
        pagination={pagination}
        storageKey={
          isCancellations
            ? "admin:bookings:cancellations:column-visibility"
            : isPendingDamage
              ? "admin:bookings:pending-damage:column-visibility"
            : "admin:bookings:column-visibility"
        }
        actionsMode={resolveBookingActionsMode({
          isCancellations,
          isPendingDamage,
        })}
      />
    </div>
  );
}

function resolveBookingActionsMode({
  isCancellations,
  isPendingDamage,
}: {
  isCancellations: boolean;
  isPendingDamage: boolean;
}) {
  if (isPendingDamage) return "pending-damage";
  if (isCancellations) return "cancellations";
  return "all";
}

function matchesBookingStatusFilter(
  booking: AdminBooking,
  filter: BookingStatusFilter,
) {
  if (filter === "pending") {
    return booking.status === "Pending";
  }

  if (filter === "completed") {
    return booking.status === "Completed";
  }

  return true;
}

function matchesDamageFilter(booking: AdminBooking, filter: BookingStatusFilter) {
  if (filter === "pending") {
    return isPendingDamageBooking(booking);
  }

  if (filter === "completed") {
    return isCompletedDamageBooking(booking);
  }

  return isPendingDamageBooking(booking) || isCompletedDamageBooking(booking);
}
