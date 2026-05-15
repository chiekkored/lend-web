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
import { getBookingAssetTitle, type AdminBooking } from "@/lib/admin-bookings";

import { useBookingMutation } from "../hooks/use-booking-mutation";

type BookingCancelDialogProps = {
  booking: AdminBooking;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function BookingCancelDialog({
  booking,
  onOpenChange,
  open,
}: BookingCancelDialogProps) {
  const { cancelBooking, error, resetError, submitting } =
    useBookingMutation(booking);

  React.useEffect(() => {
    if (open) {
      resetError();
    }
  }, [open, resetError]);

  async function onConfirm() {
    const success = await cancelBooking();
    if (success) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel booking</DialogTitle>
          <DialogDescription>
            This updates both booking mirrors and related chat booking statuses.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border p-4 text-sm">
          <p className="font-medium">{booking.id}</p>
          <p className="mt-1 text-muted-foreground">{getBookingAssetTitle(booking)}</p>
          <p className="mt-1 text-muted-foreground">
            Current status: {booking.status ?? "Not set"}
          </p>
        </div>
        {error ? (
          <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={submitting} type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={submitting || booking.status === "Cancelled"}
            onClick={onConfirm}
            type="button"
            variant="destructive"
          >
            {submitting ? <Loader2 className="animate-spin" /> : null}
            Cancel booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
