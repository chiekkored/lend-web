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
  const ownerPenalty = booking.cancellationRequest?.ownerPenaltyPreview;
  const ownerPenaltyAmount = formatBookingMoney(ownerPenalty?.penaltyAmount ?? null, ownerPenalty?.currency ?? "PHP");
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
              <p className="mt-1 text-muted-foreground">Paid amount: {maxRefundText}</p>
            ) : null}
            {approving && requestedByOwner ? (
              <p className="mt-1 text-muted-foreground">
                Owner penalty: {ownerPenaltyRate} of expected payout ({ownerPenaltyAmount}), deducted from future
                payouts for this listing.
              </p>
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
