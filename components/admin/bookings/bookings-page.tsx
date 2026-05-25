"use client";

import * as React from "react";

import { BookingTable } from "./components";
import type { BookingStatusFilter } from "./components";
import { useCancellationBookings } from "./hooks/use-cancellation-bookings";
import { useBookings } from "./hooks/use-bookings";
import { usePendingDamageBookings } from "./hooks/use-pending-damage-bookings";
import {
  isCompletedDamageBooking,
  isPendingDamageBooking,
  type AdminBooking,
} from "@/lib/admin-bookings";

type BookingsPageMode = "all" | "cancellations" | "pending-damage";

type BookingsPageProps = {
  mode?: BookingsPageMode;
};

export function BookingsPage({ mode = "all" }: BookingsPageProps) {
  const isCancellations = mode === "cancellations";
  const isPendingDamage = mode === "pending-damage";
  const bookings = useBookings({ enabled: !isPendingDamage && !isCancellations });
  const cancellationBookings = useCancellationBookings({
    enabled: isCancellations,
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
  const [statusFilter, setStatusFilter] = React.useState<BookingStatusFilter>(
    isPendingDamage ? "pending" : "all",
  );
  const filteredData = isCancellations
    ? data
    : isPendingDamage
      ? data.filter((booking) => matchesDamageFilter(booking, statusFilter))
      : data.filter((booking) => matchesBookingStatusFilter(booking, statusFilter));

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
            ? "Review renter cancellation requests before refunds begin."
            : isPendingDamage
              ? "View total loss and over-deposit damage support cases, evidence, and support chats."
            : "Track rental status, cancellation requests, disputes, and transaction health."}
        </p>
      </div>
      <BookingTable
        data={filteredData}
        error={error}
        filterValue={isCancellations ? undefined : statusFilter}
        loading={loading}
        onFilterChange={isCancellations ? undefined : setStatusFilter}
        pagination={pagination}
        storageKey={
          isCancellations
            ? "admin:bookings:cancellations:column-visibility"
            : isPendingDamage
              ? "admin:bookings:pending-damage:column-visibility"
            : "admin:bookings:column-visibility"
        }
        actionsMode={isPendingDamage ? "pending-damage" : "default"}
      />
    </div>
  );
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
