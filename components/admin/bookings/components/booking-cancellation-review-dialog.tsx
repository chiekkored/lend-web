"use client";

import * as React from "react";
import { AlertCircle, AlertTriangle, Loader2 } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatBookingMoney, getBookingAssetTitle, type AdminBooking } from "@/lib/admin-bookings";

import { useBookingMutation } from "../hooks/use-booking-mutation";

type BookingCancellationReviewDialogProps = {
  booking: AdminBooking;
  decision: "approve" | "reject";
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

type RefundType = "full" | "partial";

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
  const hasAmbiguousDobPayment =
    approving && booking.payment?.method === "dob" && typeof booking.payment.details.bank_code !== "string";

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

    const refundOptions = approving
      ? buildRefundOptions({ maxRefundAmount, noRefund, partialAmount, refundType })
      : undefined;
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
            {approving
              ? "This cancels the booking and applies the selected refund handling."
              : "This restores the booking and reopens the booking chat."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="rounded-md border p-4 text-sm">
            <p className="font-medium">{booking.id}</p>
            <p className="mt-1 text-muted-foreground">{getBookingAssetTitle(booking)}</p>
            <p className="mt-1 text-muted-foreground">Reason: {booking.cancellationRequest?.reason ?? "Not set"}</p>
            {approving ? (
              <p className="mt-1 text-muted-foreground">Paid amount: {maxRefundText}</p>
            ) : null}
            <p className="mt-1 text-muted-foreground">{booking.payment?.method}</p>
          </div>
          {approving ? (
            <div className="grid gap-3">
              {noRefund ? (
                <RefundNotice>
                  QR PH and UBP Online Banking cannot be refunded. No refund will be made for this payment method.
                </RefundNotice>
              ) : null}
              {hasAmbiguousDobPayment ? (
                <RefundNotice>
                  UBP Online Banking cannot be refunded, but this older online banking booking does not include a stored
                  bank code.
                </RefundNotice>
              ) : null}
              <div className="grid gap-2">
                <Label htmlFor="refund-type">Refund type</Label>
                <Select
                  disabled={noRefund || submitting}
                  onValueChange={(value) => setRefundType(value as RefundType)}
                  value={refundType}
                >
                  <SelectTrigger id="refund-type">
                    <SelectValue placeholder="Select refund type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full refund</SelectItem>
                    <SelectItem value="partial">Partial refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {!noRefund && refundType === "partial" ? (
                <div className="grid gap-2">
                  <Label htmlFor="refund-amount">Refund amount</Label>
                  <Input
                    disabled={submitting}
                    id="refund-amount"
                    inputMode="decimal"
                    max={maxRefundAmount ?? undefined}
                    min="0.01"
                    onChange={(event) => setPartialAmount(event.target.value)}
                    placeholder="Enter amount"
                    step="0.01"
                    type="number"
                    value={partialAmount}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum refund: {maxRefundText}
                  </p>
                </div>
              ) : null}
            </div>
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

function RefundNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 rounded-md border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-900">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function buildRefundOptions({
  maxRefundAmount,
  noRefund,
  partialAmount,
  refundType,
}: {
  maxRefundAmount: number | null;
  noRefund: boolean;
  partialAmount: string;
  refundType: RefundType;
}):
  | { error: string; value?: never }
  | {
      error?: never;
      value: {
        refundAmount: number | null;
        refundType: "full" | "partial" | "none";
      };
    } {
  if (noRefund) {
    return { value: { refundAmount: null, refundType: "none" } };
  }

  if (refundType === "partial") {
    if (maxRefundAmount == null || !Number.isFinite(maxRefundAmount) || maxRefundAmount <= 0) {
      return { error: "Refundable paid amount is not available." };
    }

    const amount = Number(partialAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return { error: "Enter a valid partial refund amount." };
    }
    if (amount > maxRefundAmount) {
      return { error: `Partial refund cannot exceed ${formatBookingMoney(maxRefundAmount)}.` };
    }
    return { value: { refundAmount: amount, refundType: "partial" } };
  }

  return { value: { refundAmount: null, refundType: "full" } };
}

function getMaxRefundAmount(booking: AdminBooking) {
  const paidAmount = booking.payment?.amount;
  if (paidAmount != null && Number.isFinite(paidAmount) && paidAmount > 0) {
    return paidAmount;
  }

  const legacyTotal = booking.totalPrice;
  if (legacyTotal != null && Number.isFinite(legacyTotal) && legacyTotal > 0) {
    return legacyTotal;
  }

  return null;
}

function isNonRefundablePaymentMethod(booking: AdminBooking) {
  const method = booking.payment?.method;
  if (method === "qrph") return true;
  return method === "dob" && booking.payment?.details.bank_code === "ubp";
}
