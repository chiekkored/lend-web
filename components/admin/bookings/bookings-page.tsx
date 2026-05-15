"use client";

import { BookingTable } from "./components";
import { useBookings } from "./hooks/use-bookings";

export function BookingsPage() {
  const { data, error, loading } = useBookings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">
          Bookings management
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Track rental status, cancellation requests, disputes, and transaction health.
        </p>
      </div>
      <BookingTable data={data} error={error} loading={loading} />
    </div>
  );
}
