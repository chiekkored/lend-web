"use client";

import { BookingTable } from "./components";
import { useBookings } from "./hooks/use-bookings";
import type { AdminBooking } from "@/lib/admin-bookings";

type BookingsPageMode = "all" | "cancellations" | "pending-damage";

type BookingsPageProps = {
  mode?: BookingsPageMode;
};

export function BookingsPage({ mode = "all" }: BookingsPageProps) {
  const { data, error, loading } = useBookings();
  const isCancellations = mode === "cancellations";
  const isPendingDamage = mode === "pending-damage";
  const filteredData = isCancellations
    ? data.filter((booking) => booking.status === "Cancellation Requested")
    : isPendingDamage
      ? data.filter(isPendingDamageBooking)
      : data;

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
        loading={loading}
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

function isPendingDamageBooking(booking: AdminBooking) {
  return (
    booking.settlement?.status === "support_pending" ||
    booking.settlement?.status === "admin_review_required" ||
    ["pending", "in_progress"].includes(booking.settlement?.supportStatus ?? "")
  );
}
