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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { bookingStatuses, formatBookingMoney, type AdminBooking } from "@/lib/admin-bookings";

import { useBookingMutation } from "../hooks/use-booking-mutation";
import {
  BookingRefundOptions,
  buildRefundOptions,
  getMaxRefundAmount,
  hasPaidBookingAmount,
  type RefundType,
} from "./booking-refund-options";

type BookingStatusDialogProps = {
  booking: AdminBooking;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

const refundStatusTargets = new Set(["Declined", "Cancelled"]);

export function BookingStatusDialog({ booking, onOpenChange, open }: BookingStatusDialogProps) {
  const [status, setStatus] = React.useState(booking.status ?? "Pending");
  const [notes, setNotes] = React.useState("");
  const [partialAmount, setPartialAmount] = React.useState("");
  const [refundType, setRefundType] = React.useState<RefundType>("full");
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const { error, resetError, submitting, updateStatus } = useBookingMutation(booking);
  const requiresRefundOptions = refundStatusTargets.has(status) && hasPaidBookingAmount(booking);
  const maxRefundAmount = getMaxRefundAmount(booking);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setStatus(booking.status ?? "Pending");
    setNotes("");
    setPartialAmount("");
    setRefundType("full");
    setValidationError(null);
    resetError();
  }, [booking.status, open, resetError]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    const refundOptions = requiresRefundOptions
      ? buildRefundOptions({ booking, partialAmount, refundType })
      : undefined;
    if (refundOptions?.error) {
      setValidationError(refundOptions.error);
      return;
    }

    const success = await updateStatus(status, {
      notes,
      refundOptions: refundOptions?.value,
    });
    if (success) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update booking status</DialogTitle>
          <DialogDescription>{booking.id}</DialogDescription>
        </DialogHeader>
        <form className="grid gap-5" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor={`booking-status-${booking.id}`}>Status</Label>
            <Select disabled={submitting} onValueChange={setStatus} value={status}>
              <SelectTrigger id={`booking-status-${booking.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bookingStatuses.map((bookingStatus) => (
                  <SelectItem key={bookingStatus} value={bookingStatus}>
                    {bookingStatus}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {requiresRefundOptions ? (
            <div className="grid gap-3 rounded-md border p-4">
              <div className="grid gap-1 text-sm">
                <p className="font-medium">Refund handling</p>
                <p className="text-muted-foreground">
                  Refundable amount: {formatBookingMoney(maxRefundAmount)}
                </p>
              </div>
              <BookingRefundOptions
                booking={booking}
                disabled={submitting}
                partialAmount={partialAmount}
                refundType={refundType}
                setPartialAmount={setPartialAmount}
                setRefundType={setRefundType}
              />
            </div>
          ) : null}
          {refundStatusTargets.has(status) && !requiresRefundOptions ? (
            <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
              This booking has no paid amount available, so the status will update without a refund.
            </div>
          ) : null}
          <Textarea
            disabled={submitting}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Admin notes"
            value={notes}
          />
          {validationError || error ? (
            <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{validationError ?? error}</span>
            </div>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={submitting} type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={submitting || status === booking.status} type="submit">
              {submitting ? <Loader2 className="animate-spin" /> : null}
              Save status
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
