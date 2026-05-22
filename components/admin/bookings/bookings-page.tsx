"use client";

import { BookingTable } from "./components";
import { useBookings } from "./hooks/use-bookings";

type BookingsPageMode = "all" | "cancellations";

type BookingsPageProps = {
  mode?: BookingsPageMode;
};

export function BookingsPage({ mode = "all" }: BookingsPageProps) {
  const { data, error, loading } = useBookings();
  const isCancellations = mode === "cancellations";
  const filteredData = isCancellations
    ? data.filter((booking) => booking.status === "Cancellation Requested")
    : data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">
          {isCancellations ? "Cancellation requests" : "Bookings management"}
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          {isCancellations
            ? "Review renter cancellation requests before refunds begin."
            : "Track rental status, cancellation requests, disputes, and transaction health."}
        </p>
      </div>
      <BookingTable
        data={filteredData}
        error={error}
        loading={loading}
        storageKey={
          isCancellations
            ? "admin:bookings:cancellations:column-visibility"
            : "admin:bookings:column-visibility"
        }
      />
    </div>
  );
}
