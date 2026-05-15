"use client";

import * as React from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { bookingStatuses, type AdminBooking } from "@/lib/admin-bookings";

import { useBookingMutation } from "../hooks/use-booking-mutation";

type BookingStatusSheetProps = {
  booking: AdminBooking;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function BookingStatusSheet({
  booking,
  onOpenChange,
  open,
}: BookingStatusSheetProps) {
  const [status, setStatus] = React.useState(booking.status ?? "Pending");
  const { error, resetError, submitting, updateStatus } =
    useBookingMutation(booking);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setStatus(booking.status ?? "Pending");
    resetError();
  }, [booking.status, open, resetError]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const success = await updateStatus(status);
    if (success) {
      onOpenChange(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Update booking status</SheetTitle>
          <SheetDescription>{booking.id}</SheetDescription>
        </SheetHeader>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit}>
          <div className="grid flex-1 auto-rows-min gap-5 overflow-y-auto px-4">
            <Select onValueChange={setStatus} value={status}>
              <SelectTrigger>
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
            {error ? (
              <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}
          </div>
          <SheetFooter>
            <Button disabled={submitting || status === booking.status} type="submit">
              {submitting ? <Loader2 className="animate-spin" /> : null}
              Save status
            </Button>
            <SheetClose asChild>
              <Button disabled={submitting} type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
