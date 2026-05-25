"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { doc, increment, serverTimestamp, writeBatch } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

import {
  getBookingOwnerId,
  getBookingRenterId,
  type AdminBooking,
} from "@/lib/admin-bookings";
import {
  getFirebaseFirestore,
  getFirebaseFunctions,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";

import { bookingQueryKeys } from "../data/booking-queries";

type MutationResult = { error?: string; success: boolean };
type ReleaseDamageBalanceResponse = {
  alreadyReleased?: boolean;
  ownerPayout?: {
    error?: unknown;
    reason?: unknown;
    skipped?: unknown;
    status?: unknown;
  };
  status?: unknown;
  success?: unknown;
};

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
      const rootBookingRef = doc(db, "bookings", booking.id);
      const userBookingRef = doc(db, "users", renterId, "bookings", booking.id);
      const updateData = {
        lastUpdated: now,
        status,
      };

      batch.update(rootBookingRef, updateData);
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

  async function reviewCancellation(
    decision: "approve" | "reject",
    notes?: string,
    refundOptions?: { refundAmount?: number | null; refundType?: "full" | "partial" | "none" },
  ) {
    setError(null);

    if (!hasFirebaseConfig) {
      setError(
        `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
      );
      return false;
    }

    const renterId = getBookingRenterId(booking);
    if (!renterId) {
      setError("Booking is missing renter details.");
      return false;
    }

    setSubmitting(true);
    try {
      const callable = httpsCallable(
        getFirebaseFunctions(),
        "reviewBookingCancellation",
      );
      await callable({
        assetId: booking.assetId,
        bookingId: booking.id,
        renterId,
        decision,
        notes: notes?.trim() || null,
        refundAmount: refundOptions?.refundAmount ?? null,
        refundType: refundOptions?.refundType ?? null,
      });
      await queryClient.invalidateQueries({ queryKey: bookingQueryKeys.root });
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to review cancellation.",
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function reviewDamageDeduction({
    decision,
    approvedAmount,
    adminNotes,
  }: {
    decision: "approve_full" | "approve_adjusted" | "reject";
    approvedAmount?: number | null;
    adminNotes?: string;
  }) {
    setError(null);

    if (!hasFirebaseConfig) {
      setError(
        `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
      );
      return false;
    }

    setSubmitting(true);
    try {
      const callable = httpsCallable(
        getFirebaseFunctions(),
        "updateBookingSettlement",
      );
      await callable({
        bookingId: booking.id,
        action: "admin_resolve_damage_deduction",
        decision,
        approvedAmount: approvedAmount ?? null,
        adminNotes: adminNotes?.trim() || null,
      });
      await queryClient.invalidateQueries({ queryKey: bookingQueryKeys.root });
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to review damage request.",
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function createDamageSupportChat(target: "renter" | "owner") {
    setError(null);

    if (!hasFirebaseConfig) {
      setError(
        `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
      );
      return null;
    }

    setSubmitting(true);
    try {
      const callable = httpsCallable(
        getFirebaseFunctions(),
        "updateBookingSettlement",
      );
      const result = await callable({
        bookingId: booking.id,
        action: "admin_create_damage_support_chat",
        target,
      });
      await queryClient.invalidateQueries({ queryKey: bookingQueryKeys.root });
      const data = result.data as { chatId?: unknown };
      return typeof data.chatId === "string" ? data.chatId : null;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create support chat.",
      );
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  async function updateDamageSupportRequest({
    adminNotes,
    supportStatus,
  }: {
    adminNotes?: string;
    supportStatus: "pending" | "in_progress" | "resolved" | "closed";
  }): Promise<MutationResult> {
    setError(null);

    if (!hasFirebaseConfig) {
      const message = `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`;
      setError(message);
      return { error: message, success: false };
    }

    setSubmitting(true);
    try {
      const callable = httpsCallable(
        getFirebaseFunctions(),
        "updateBookingSettlement",
      );
      await callable({
        bookingId: booking.id,
        action: "admin_update_damage_support_request",
        supportStatus,
        adminNotes: adminNotes?.trim() || null,
      });
      await queryClient.invalidateQueries({ queryKey: bookingQueryKeys.root });
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update support request.";
      setError(message);
      return { error: message, success: false };
    } finally {
      setSubmitting(false);
    }
  }

  async function sendDamageSupportMessage({
    chatId,
    target,
    text,
  }: {
    chatId: string;
    target: "renter" | "owner";
    text: string;
  }) {
    setError(null);

    if (!hasFirebaseConfig) {
      setError(
        `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
      );
      return false;
    }

    setSubmitting(true);
    try {
      const callable = httpsCallable(
        getFirebaseFunctions(),
        "updateBookingSettlement",
      );
      await callable({
        bookingId: booking.id,
        action: "admin_send_damage_support_message",
        chatId,
        target,
        text,
      });
      await queryClient.invalidateQueries({
        queryKey: bookingQueryKeys.messages(chatId),
      });
      await queryClient.invalidateQueries({ queryKey: bookingQueryKeys.root });
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send support message.",
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function sendDamageBalancePaymentRequest({
    chatId,
    amount,
  }: {
    chatId: string;
    amount: number;
  }) {
    setError(null);

    if (!hasFirebaseConfig) {
      setError(
        `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
      );
      return false;
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      setError("Enter a valid payment request amount.");
      return false;
    }

    setSubmitting(true);
    try {
      const callable = httpsCallable(
        getFirebaseFunctions(),
        "updateBookingSettlement",
      );
      await callable({
        bookingId: booking.id,
        action: "admin_send_damage_balance_payment_request",
        chatId,
        amount,
      });
      await queryClient.invalidateQueries({
        queryKey: bookingQueryKeys.messages(chatId),
      });
      await queryClient.invalidateQueries({ queryKey: bookingQueryKeys.root });
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send payment request.",
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function releaseDamageBalancePayment(): Promise<MutationResult> {
    setError(null);

    if (!hasFirebaseConfig) {
      const message = `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`;
      setError(message);
      return { error: message, success: false };
    }

    setSubmitting(true);
    try {
      const callable = httpsCallable(
        getFirebaseFunctions(),
        "updateBookingSettlement",
      );
      const result = await callable({
        bookingId: booking.id,
        action: "admin_release_damage_balance_payment",
      });
      const releaseResult = getReleaseDamageBalanceResult(
        result.data as ReleaseDamageBalanceResponse,
      );
      if (!releaseResult.success) {
        setError(releaseResult.error ?? "Unable to release payment.");
        await queryClient.invalidateQueries({ queryKey: bookingQueryKeys.root });
        return releaseResult;
      }
      await queryClient.invalidateQueries({ queryKey: bookingQueryKeys.root });
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to release payment.";
      setError(message);
      return { error: message, success: false };
    } finally {
      setSubmitting(false);
    }
  }

  return {
    cancelBooking: () => updateStatus("Cancelled"),
    createDamageSupportChat,
    error,
    reviewCancellation,
    reviewDamageDeduction,
    releaseDamageBalancePayment,
    resetError,
    sendDamageBalancePaymentRequest,
    sendDamageSupportMessage,
    submitting,
    updateDamageSupportRequest,
    updateStatus,
  };
}

function getReleaseDamageBalanceResult(
  data: ReleaseDamageBalanceResponse,
): MutationResult {
  const ownerPayout = data?.ownerPayout;
  const ownerPayoutStatus =
    typeof ownerPayout?.status === "string" ? ownerPayout.status : null;
  const responseStatus = typeof data?.status === "string" ? data.status : null;
  const ownerPayoutError =
    typeof ownerPayout?.error === "string" && ownerPayout.error.trim()
      ? ownerPayout.error.trim()
      : null;

  if (responseStatus === "failed" || ownerPayoutStatus === "failed" || ownerPayoutError) {
    return {
      error: ownerPayoutError ?? "Unable to release payment.",
      success: false,
    };
  }

  return { success: true };
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
