"use client";

import * as React from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatBookingMoney, formatExactNumber, getBookingAssetTitle, type AdminBooking } from "@/lib/admin-bookings";

import { useBookingMutation } from "../hooks/use-booking-mutation";
import {
  BookingRefundOptions,
  buildRefundOptions,
  getMaxRefundAmount,
  isNonRefundablePaymentMethod,
  type RefundType,
} from "./booking-refund-options";

type BookingCancellationReviewDialogProps = {
  booking: AdminBooking;
  decision: "approve" | "reject";
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function BookingCancellationReviewDialog({
  booking,
  decision,
  onOpenChange,
  open,
}: BookingCancellationReviewDialogProps) {
  const [notes, setNotes] = React.useState("");
  const [partialAmount, setPartialAmount] = React.useState("");
  const [refundType, setRefundType] = React.useState<RefundType>("full");
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const { error, resetError, reviewCancellation, submitting } = useBookingMutation(booking);
  const approving = decision === "approve";
  const noRefund = approving && isNonRefundablePaymentMethod(booking);
  const maxRefundAmount = getMaxRefundAmount(booking);
  const maxRefundText = formatBookingMoney(maxRefundAmount);
  const requestedByOwner = booking.cancellationRequest?.requestedByRole === "owner";
  const requestedByRenter = booking.cancellationRequest?.requestedByRole === "renter";
  const ownerPenalty = booking.cancellationRequest?.ownerPenaltyPreview;
  const renterPenalty = booking.cancellationRequest?.renterPenaltyPreview ?? null;
  const renterDepositRefundValue = Number(renterPenalty?.securityDepositRefundAmount ?? 0);
  const effectiveRenterSuggestion = getEffectiveRenterSuggestion({
    renterPenalty,
    shortLeadNoRefund: renterPenalty?.shortLeadNoRefund === true || isShortLeadBooking(booking),
  });
  const ownerPenaltyAmount = formatBookingMoney(ownerPenalty?.penaltyAmount ?? null, ownerPenalty?.currency ?? "PHP");
  const renterRentalRefundAmount = formatBookingMoney(
    effectiveRenterSuggestion.shortLeadNoRefund ? 0 : renterPenalty?.rentalRefundAmount ?? null,
    renterPenalty?.currency ?? "PHP",
  );
  const renterDepositRefundAmount = formatBookingMoney(
    renterDepositRefundValue,
    renterPenalty?.currency ?? "PHP",
  );
  const renterSuggestedRefundAmount = formatBookingMoney(
    effectiveRenterSuggestion.refundAmount,
    renterPenalty?.currency ?? "PHP",
  );
  const renterRetainedAmount = formatBookingMoney(
    effectiveRenterSuggestion.shortLeadNoRefund
      ? renterPenalty?.refundBaseAmount ?? null
      : renterPenalty?.retainedOwnerAmount ?? null,
    renterPenalty?.currency ?? "PHP",
  );
  const hasRenterSuggestion =
    requestedByRenter &&
    renterPenalty != null &&
    typeof renterPenalty.suggestedRefundType === "string";
  const depositOnlySuggestion =
    hasRenterSuggestion &&
    effectiveRenterSuggestion.refundType === "partial" &&
    effectiveRenterSuggestion.shortLeadNoRefund &&
    renterDepositRefundValue > 0;
  const shortLeadNoRefund = effectiveRenterSuggestion.shortLeadNoRefund;
  const ownerPenaltyRate =
    typeof ownerPenalty?.penaltyRate === "number" ? `${formatExactNumber(ownerPenalty.penaltyRate * 100)}%` : "Not set";

  React.useEffect(() => {
    if (open) {
      setNotes("");
      setPartialAmount("");
      setRefundType("full");
      setValidationError(null);
      resetError();
    }
  }, [open, resetError]);

  async function onConfirm() {
    setValidationError(null);

    const refundOptions = approving ? buildRefundOptions({ booking, partialAmount, refundType }) : undefined;
    if (refundOptions?.error) {
      setValidationError(refundOptions.error);
      return;
    }

    const success = await reviewCancellation(decision, notes, refundOptions?.value);
    if (success) {
      onOpenChange(false);
    }
  }

  function applyRenterPolicySuggestion() {
    if (noRefund) {
      setRefundType("none");
      setPartialAmount("");
      setValidationError(null);
      return;
    }
    const suggestion = effectiveRenterSuggestion.refundType;
    if (suggestion !== "full" && suggestion !== "partial" && suggestion !== "none") return;

    setRefundType(suggestion);
    setPartialAmount(suggestion === "partial" ? String(effectiveRenterSuggestion.refundAmount ?? "") : "");
    setValidationError(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{approving ? "Approve cancellation" : "Reject cancellation"}</DialogTitle>
          <DialogDescription>
            {approving && requestedByOwner
              ? "This cancels the booking, applies refund handling, and records the owner payout penalty."
              : approving
              ? "This cancels the booking and applies the selected refund handling."
              : "This restores the booking and reopens the booking chat."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="rounded-md border p-4 text-sm">
            <p className="font-medium">{booking.id}</p>
            <p className="mt-1 text-muted-foreground">{getBookingAssetTitle(booking)}</p>
            <p className="mt-1 text-muted-foreground">
              Requested by: {booking.cancellationRequest?.requestedByRole ?? "Not set"}
            </p>
            <p className="mt-1 text-muted-foreground">Reason: {booking.cancellationRequest?.reason ?? "Not set"}</p>
            {approving ? (
              <p className="mt-1 text-muted-foreground">Refundable amount: {maxRefundText}</p>
            ) : null}
            {approving && requestedByOwner ? (
              <p className="mt-1 text-muted-foreground">
                Owner penalty: {ownerPenaltyRate} of expected payout ({ownerPenaltyAmount}), deducted from future
                payouts for this listing.
              </p>
            ) : null}
            {approving && hasRenterSuggestion ? (
              <div className="mt-3 rounded-md border bg-muted/40 p-3">
                <p className="font-medium">Renter cancellation policy</p>
                <p className="mt-1 text-muted-foreground">
                  Free cancellation window: {renterPenalty?.fullRefundWindowLabel ?? "Not set"}. No refund window:{" "}
                  {renterPenalty?.noRefundWindowLabel ?? "Not set"} before start.
                </p>
                {shortLeadNoRefund ? (
                  <p className="mt-1 text-muted-foreground">
                    Booked less than 24 hours before start; rental payment is non-refundable.
                  </p>
                ) : null}
                <p className="mt-1 text-muted-foreground">
                  Rental refund: {renterRentalRefundAmount}. Security deposit refund: {renterDepositRefundAmount}. Total
                  refund: {renterSuggestedRefundAmount}. Owner retained rental amount: {renterRetainedAmount}.
                </p>
                {depositOnlySuggestion ? (
                  <p className="mt-1 font-medium text-muted-foreground">
                    Policy suggestion: refund security deposit only.
                  </p>
                ) : null}
                {noRefund && (renterPenalty?.securityDepositRefundAmount ?? 0) > 0 ? (
                  <p className="mt-1 text-muted-foreground">
                    This payment method cannot be refunded through PayMongo. Record the security deposit refund for manual
                    handling.
                  </p>
                ) : null}
                <Button
                  className="mt-2 h-8 px-2 text-xs"
                  onClick={applyRenterPolicySuggestion}
                  type="button"
                  variant="secondary"
                >
                  {depositOnlySuggestion ? "Use deposit-only suggestion" : "Use policy suggestion"}
                </Button>
              </div>
            ) : null}
            <p className="mt-1 text-muted-foreground">{booking.payment?.method}</p>
          </div>
          {approving ? (
            <BookingRefundOptions
              booking={booking}
              disabled={submitting}
              partialAmount={partialAmount}
              refundType={refundType}
              setPartialAmount={setPartialAmount}
              setRefundType={setRefundType}
              allowNoRefund={hasRenterSuggestion && effectiveRenterSuggestion.refundType === "none"}
            />
          ) : null}
          <Textarea onChange={(event) => setNotes(event.target.value)} placeholder="Admin notes" value={notes} />
          {validationError || error ? (
            <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{validationError ?? error}</span>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={submitting} type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={submitting}
            onClick={onConfirm}
            type="button"
            variant={approving ? "destructive" : "default"}
          >
            {submitting ? <Loader2 className="animate-spin" /> : null}
            {approving ? (noRefund ? "Approve without refund" : "Approve cancellation") : "Reject and restore"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function isShortLeadBooking(booking: AdminBooking) {
  if (!booking.createdAt || !booking.startDate) return false;
  const leadHours = (policyStartBoundary(booking.startDate).getTime() - booking.createdAt.getTime()) / (60 * 60 * 1000);
  return leadHours >= 0 && leadHours < 24;
}

function getEffectiveRenterSuggestion({
  renterPenalty,
  shortLeadNoRefund,
}: {
  renterPenalty: NonNullable<AdminBooking["cancellationRequest"]>["renterPenaltyPreview"];
  shortLeadNoRefund: boolean;
}) {
  if (shortLeadNoRefund) {
    const depositRefundAmount = Number(renterPenalty?.securityDepositRefundAmount ?? 0);
    return {
      refundAmount: depositRefundAmount > 0 ? depositRefundAmount : 0,
      refundType: depositRefundAmount > 0 ? "partial" : "none",
      shortLeadNoRefund,
    } as const;
  }

  return {
    refundAmount: renterPenalty?.refundAmount ?? null,
    refundType: renterPenalty?.suggestedRefundType,
    shortLeadNoRefund,
  } as const;
}

function policyStartBoundary(startDate: Date) {
  return new Date(Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate(),
  ) - 8 * 60 * 60 * 1000);
}
