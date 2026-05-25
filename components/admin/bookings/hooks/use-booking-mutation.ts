"use client";

import * as React from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";

import {
  getBookingRenterId,
  type DamageSupportChatTarget,
  type DamageSupportStatus,
  type DamageReviewDecision,
  type AdminBooking,
} from "@/lib/admin-bookings";
import {
  getFirebaseFunctions,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";

import { bookingQueryKeys } from "../data/booking-queries";
import {
  patchCachedAdminBooking,
  refetchCachedAdminBooking,
} from "../data/booking-cache";

type MutationResult = { error?: string; status?: string | null; success: boolean };
type DamageSupportChatResponse = {
  chatId?: unknown;
};
type DamageSupportUpdateResponse = {
  status?: unknown;
  supportStatus?: unknown;
};
type DamageReviewResponse = {
  approvedDamageDeductionAmount?: unknown;
  depositCoveredDamageAmount?: unknown;
  outstandingDamageAmount?: unknown;
  status?: unknown;
  supportStatus?: unknown;
};
type DamagePaymentRequestResponse = {
  paymentRequestId?: unknown;
};
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
type StatusRefundOptions = {
  refundAmount?: number | null;
  refundType?: "full" | "partial" | "none";
};

const settlementAdminActions = {
  createDamageSupportChat: "admin_create_damage_support_chat",
  releaseDamageBalancePayment: "admin_release_damage_balance_payment",
  resolveDamageDeduction: "admin_resolve_damage_deduction",
  sendDamageBalancePaymentRequest: "admin_send_damage_balance_payment_request",
  sendDamageSupportMessage: "admin_send_damage_support_message",
  updateDamageSupportRequest: "admin_update_damage_support_request",
} as const;

export function useBookingMutation(booking: AdminBooking) {
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const resetError = React.useCallback(() => setError(null), []);

  async function updateStatus(
    status: string,
    options?: { notes?: string; refundOptions?: StatusRefundOptions },
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
      setError("Booking is missing participant details.");
      return false;
    }

    setSubmitting(true);
    try {
      const callable = httpsCallable(
        getFirebaseFunctions(),
        "adminUpdateBookingStatus",
      );
      await callable({
        assetId: booking.assetId,
        bookingId: booking.id,
        renterId,
        status,
        notes: options?.notes?.trim() || null,
        refundAmount: options?.refundOptions?.refundAmount ?? null,
        refundType: options?.refundOptions?.refundType ?? null,
      });

      patchCachedAdminBooking(queryClient, booking, (currentBooking) => ({
        ...currentBooking,
        status,
      }));
      await refetchCachedAdminBooking({
        assetId: booking.assetId,
        bookingId: booking.id,
        queryClient,
      });
      await queryClient.invalidateQueries({ queryKey: bookingQueryKeys.root });
      return true;
    } catch (err) {
      console.error("[booking-mutation] update status failed", err);
      setError(
        "Unable to update booking.",
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
    decision: DamageReviewDecision;
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
      const result = await callable({
        bookingId: booking.id,
        action: settlementAdminActions.resolveDamageDeduction,
        decision,
        approvedAmount: approvedAmount ?? null,
        adminNotes: adminNotes?.trim() || null,
      });
      patchDamageReviewCache({
        adminNotes,
        booking,
        decision,
        queryClient,
        response: result.data as DamageReviewResponse,
      });
      await refetchCachedAdminBooking({
        assetId: booking.assetId,
        bookingId: booking.id,
        queryClient,
      });
      await queryClient.invalidateQueries({ queryKey: bookingQueryKeys.root });
      return true;
    } catch (err) {
      console.error("[booking-mutation] review damage request failed", err);
      setError("Unable to review damage request.");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function createDamageSupportChat(target: DamageSupportChatTarget) {
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
        action: settlementAdminActions.createDamageSupportChat,
        target,
      });
      const data = result.data as DamageSupportChatResponse;
      const chatId = typeof data.chatId === "string" ? data.chatId : null;
      if (chatId) {
        patchCachedAdminBooking(queryClient, booking, (currentBooking) =>
          patchSupportChatId(currentBooking, target, chatId),
        );
      }
      await refetchCachedAdminBooking({
        assetId: booking.assetId,
        bookingId: booking.id,
        queryClient,
      });
      await queryClient.invalidateQueries({ queryKey: bookingQueryKeys.root });
      return chatId;
    } catch (err) {
      console.error("[booking-mutation] create support chat failed", err);
      setError("Unable to create support chat.");
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
    supportStatus: DamageSupportStatus;
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
      const result = await callable({
        bookingId: booking.id,
        action: settlementAdminActions.updateDamageSupportRequest,
        supportStatus,
        adminNotes: adminNotes?.trim() || null,
      });
      patchCachedAdminBooking(queryClient, booking, (currentBooking) => ({
        ...currentBooking,
        settlement: currentBooking.settlement
          ? {
              ...currentBooking.settlement,
              status:
                typeof (result.data as DamageSupportUpdateResponse).status ===
                "string"
                  ? ((result.data as DamageSupportUpdateResponse)
                      .status as string)
                  : currentBooking.settlement.status,
              supportStatus,
            }
          : currentBooking.settlement,
        damageDeductionRequest: currentBooking.damageDeductionRequest
          ? {
              ...currentBooking.damageDeductionRequest,
              adminNotes: adminNotes?.trim() || null,
            }
          : currentBooking.damageDeductionRequest,
      }));
      await refetchCachedAdminBooking({
        assetId: booking.assetId,
        bookingId: booking.id,
        queryClient,
      });
      await queryClient.invalidateQueries({ queryKey: bookingQueryKeys.root });
      return { success: true };
    } catch (err) {
      console.error("[booking-mutation] update support request failed", err);
      const message = "Unable to update support request.";
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
    target: DamageSupportChatTarget;
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
        action: settlementAdminActions.sendDamageSupportMessage,
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
      console.error("[booking-mutation] send support message failed", err);
      setError("Unable to send support message.");
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
      const result = await callable({
        bookingId: booking.id,
        action: settlementAdminActions.sendDamageBalancePaymentRequest,
        chatId,
        amount,
      });
      const data = result.data as DamagePaymentRequestResponse;
      patchCachedAdminBooking(queryClient, booking, (currentBooking) => ({
        ...currentBooking,
        settlement: currentBooking.settlement
          ? {
              ...currentBooking.settlement,
              damageBalancePaymentRequestId:
                typeof data.paymentRequestId === "string"
                  ? data.paymentRequestId
                  : currentBooking.settlement.damageBalancePaymentRequestId,
              damageBalancePaymentStatus: "pending",
              damageBalanceRequestedAmount: amount,
            }
          : currentBooking.settlement,
      }));
      await refetchCachedAdminBooking({
        assetId: booking.assetId,
        bookingId: booking.id,
        queryClient,
      });
      await queryClient.invalidateQueries({
        queryKey: bookingQueryKeys.messages(chatId),
      });
      await queryClient.invalidateQueries({ queryKey: bookingQueryKeys.root });
      return true;
    } catch (err) {
      console.error("[booking-mutation] send payment request failed", err);
      setError("Unable to send payment request.");
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
        action: settlementAdminActions.releaseDamageBalancePayment,
      });
      const releaseResult = getReleaseDamageBalanceResult(
        result.data as ReleaseDamageBalanceResponse,
      );
      if (!releaseResult.success) {
        setError(releaseResult.error ?? "Unable to release payment.");
        await queryClient.invalidateQueries({ queryKey: bookingQueryKeys.root });
        return releaseResult;
      }
      patchCachedAdminBooking(queryClient, booking, (currentBooking) => ({
        ...currentBooking,
        status: releaseResult.status === "succeeded" ? "Completed" : currentBooking.status,
        settlement: currentBooking.settlement
          ? {
              ...currentBooking.settlement,
              ownerDamageBalancePayoutStatus:
                releaseResult.status ?? "processing",
              supportStatus:
                releaseResult.status === "succeeded"
                  ? "closed"
                  : currentBooking.settlement.supportStatus,
            }
          : currentBooking.settlement,
      }));
      await refetchCachedAdminBooking({
        assetId: booking.assetId,
        bookingId: booking.id,
        queryClient,
      });
      await queryClient.invalidateQueries({ queryKey: bookingQueryKeys.root });
      return { success: true };
    } catch (err) {
      console.error("[booking-mutation] release payment failed", err);
      const message = "Unable to release payment.";
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

  return { status: ownerPayoutStatus ?? responseStatus, success: true };
}

function patchDamageReviewCache({
  adminNotes,
  booking,
  decision,
  queryClient,
  response,
}: {
  adminNotes?: string;
  booking: AdminBooking;
  decision: DamageReviewDecision;
  queryClient: QueryClient;
  response: DamageReviewResponse;
}) {
  const status = typeof response.status === "string" ? response.status : null;
  const supportStatus =
    typeof response.supportStatus === "string" ? response.supportStatus : null;
  const approvedAmount = readNumber(
    response.approvedDamageDeductionAmount,
    decision === "reject"
      ? 0
      : booking.damageDeductionRequest?.approvedAmount,
  );
  const depositCoveredDamageAmount = readNumber(
    response.depositCoveredDamageAmount,
    booking.settlement?.depositCoveredDamageAmount,
  );
  const outstandingDamageAmount = readNumber(
    response.outstandingDamageAmount,
    booking.settlement?.outstandingDamageAmount,
  );
  const resolved = status === "completed";
  const supportPending = status === "support_pending";

  patchCachedAdminBooking(queryClient, booking, (currentBooking) => ({
    ...currentBooking,
    status: resolved ? "Completed" : currentBooking.status,
    settlement: currentBooking.settlement
      ? {
          ...currentBooking.settlement,
          status: status ?? currentBooking.settlement.status,
          supportStatus: supportStatus ?? currentBooking.settlement.supportStatus,
          approvedDamageDeductionAmount: approvedAmount,
          depositCoveredDamageAmount,
          outstandingDamageAmount,
        }
      : {
          approvedDamageDeductionAmount: approvedAmount,
          damageBalancePaymentRequestId: null,
          damageBalancePaymentStatus: null,
          damageBalanceRequestedAmount: null,
          depositCoveredDamageAmount,
          depositReturnAmount: null,
          depositStatus: null,
          outstandingDamageAmount,
          ownerDamageBalancePayoutStatus: null,
          ownerPayoutAmount: null,
          ownerSupportChatId: null,
          renterResponse: null,
          renterSupportChatId: null,
          status,
          supportStatus,
        },
    damageDeductionRequest: currentBooking.damageDeductionRequest
      ? {
          ...currentBooking.damageDeductionRequest,
          adminNotes: adminNotes?.trim() || null,
          approvedAmount,
          status: resolved
            ? "resolved"
            : supportPending
              ? "support_pending"
              : currentBooking.damageDeductionRequest.status,
        }
      : currentBooking.damageDeductionRequest,
  }));
}

function patchSupportChatId(
  booking: AdminBooking,
  target: DamageSupportChatTarget,
  chatId: string,
) {
  const field =
    target === "renter" ? "renterSupportChatId" : "ownerSupportChatId";

  return {
    ...booking,
    settlement: booking.settlement
      ? {
          ...booking.settlement,
          [field]: chatId,
        }
      : booking.settlement,
    damageDeductionRequest: booking.damageDeductionRequest
      ? {
          ...booking.damageDeductionRequest,
          [field]: chatId,
        }
      : booking.damageDeductionRequest,
  };
}

function readNumber(value: unknown, fallback: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback ?? null;
}
