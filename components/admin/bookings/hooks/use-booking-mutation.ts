"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { doc, increment, serverTimestamp, writeBatch } from "firebase/firestore";

import {
  getBookingOwnerId,
  getBookingRenterId,
  type AdminBooking,
} from "@/lib/admin-bookings";
import {
  getFirebaseFirestore,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";

import { bookingQueryKeys } from "../data/booking-queries";

export function useBookingMutation(booking: AdminBooking) {
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const resetError = React.useCallback(() => setError(null), []);

  async function updateStatus(status: string) {
    setError(null);

    if (!hasFirebaseConfig) {
      setError(
        `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
      );
      return false;
    }

    const renterId = getBookingRenterId(booking);
    const ownerId = getBookingOwnerId(booking);

    if (!renterId || !ownerId) {
      setError("Booking is missing participant details.");
      return false;
    }

    setSubmitting(true);
    try {
      const db = getFirebaseFirestore();
      const batch = writeBatch(db);
      const now = serverTimestamp();
      const assetBookingRef = doc(
        db,
        "assets",
        booking.assetId,
        "bookings",
        booking.id,
      );
      const userBookingRef = doc(db, "users", renterId, "bookings", booking.id);
      const updateData = {
        lastUpdated: now,
        status,
      };

      batch.update(assetBookingRef, updateData);
      batch.set(userBookingRef, updateData, { merge: true });

      if (booking.chatId) {
        batch.set(
          doc(db, "userChats", renterId, "chats", booking.chatId),
          { bookingStatus: status },
          { merge: true },
        );
        batch.set(
          doc(db, "userChats", ownerId, "chats", booking.chatId),
          { bookingStatus: status },
          { merge: true },
        );
      }

      const pendingDelta = getPendingDelta(booking.status, status);
      if (pendingDelta !== 0) {
        batch.set(
          doc(db, "users", ownerId, "assets", booking.assetId),
          { pendingBookingCount: increment(pendingDelta) },
          { merge: true },
        );
      }

      await batch.commit();
      await queryClient.invalidateQueries({ queryKey: bookingQueryKeys.root });
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update booking.",
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    cancelBooking: () => updateStatus("Cancelled"),
    error,
    resetError,
    submitting,
    updateStatus,
  };
}

function getPendingDelta(currentStatus: string | null, nextStatus: string) {
  if (currentStatus === "Pending" && nextStatus !== "Pending") {
    return -1;
  }

  if (currentStatus !== "Pending" && nextStatus === "Pending") {
    return 1;
  }

  return 0;
}
