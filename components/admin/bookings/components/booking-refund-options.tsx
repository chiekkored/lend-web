"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatBookingMoney, type AdminBooking } from "@/lib/admin-bookings";

export type RefundType = "full" | "partial" | "none";
export type RefundOptionsValue = {
  refundAmount: number | null;
  refundType: "full" | "partial" | "none";
};

type BookingRefundOptionsProps = {
  booking: AdminBooking;
  disabled?: boolean;
  partialAmount: string;
  refundType: RefundType;
  allowNoRefund?: boolean;
  setPartialAmount: (value: string) => void;
  setRefundType: (value: RefundType) => void;
};

export function BookingRefundOptions({
  booking,
  disabled = false,
  partialAmount,
  refundType,
  allowNoRefund = false,
  setPartialAmount,
  setRefundType,
}: BookingRefundOptionsProps) {
  const noRefund = isNonRefundablePaymentMethod(booking);
  const maxRefundAmount = getMaxRefundAmount(booking);
  const maxRefundText = formatBookingMoney(maxRefundAmount);
  const hasAmbiguousDobPayment =
    booking.payment?.method === "dob" && typeof booking.payment.details.bank_code !== "string";

  return (
    <div className="grid gap-3">
      {noRefund ? (
        <RefundNotice>
          QR PH and UBP Online Banking cannot be refunded. No refund will be made for this payment method.
        </RefundNotice>
      ) : null}
      {hasAmbiguousDobPayment ? (
        <RefundNotice>
          UBP Online Banking cannot be refunded, but this older online banking booking does not include a stored bank
          code.
        </RefundNotice>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor={`refund-type-${booking.id}`}>Refund type</Label>
        <Select
          disabled={noRefund || disabled}
          onValueChange={(value) => setRefundType(value as RefundType)}
          value={refundType}
        >
          <SelectTrigger id={`refund-type-${booking.id}`}>
            <SelectValue placeholder="Select refund type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full refund</SelectItem>
            <SelectItem value="partial">Partial refund</SelectItem>
            {allowNoRefund ? <SelectItem value="none">No refund</SelectItem> : null}
          </SelectContent>
        </Select>
      </div>
      {!noRefund && refundType === "partial" ? (
        <div className="grid gap-2">
          <Label htmlFor={`refund-amount-${booking.id}`}>Refund amount</Label>
          <Input
            disabled={disabled}
            id={`refund-amount-${booking.id}`}
            inputMode="decimal"
            max={maxRefundAmount ?? undefined}
            min="0.01"
            onChange={(event) => setPartialAmount(event.target.value)}
            placeholder="Enter amount"
            step="0.01"
            type="number"
            value={partialAmount}
          />
          <p className="text-xs text-muted-foreground">Maximum refund: {maxRefundText}</p>
        </div>
      ) : null}
    </div>
  );
}

export function buildRefundOptions({
  booking,
  partialAmount,
  refundType,
}: {
  booking: AdminBooking;
  partialAmount: string;
  refundType: RefundType;
}):
  | { error: string; value?: never }
  | {
      error?: never;
      value: RefundOptionsValue;
    } {
  if (isNonRefundablePaymentMethod(booking)) {
    return { value: { refundAmount: null, refundType: "none" } };
  }

  const maxRefundAmount = getMaxRefundAmount(booking);

  if (refundType === "none") {
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

export function getMaxRefundAmount(booking: AdminBooking) {
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

export function hasPaidBookingAmount(booking: AdminBooking) {
  return getMaxRefundAmount(booking) != null;
}

export function isNonRefundablePaymentMethod(booking: AdminBooking) {
  const method = booking.payment?.method;
  if (method === "qrph") return true;
  return method === "dob" && booking.payment?.details.bank_code === "ubp";
}

function RefundNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 rounded-md border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-900">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
