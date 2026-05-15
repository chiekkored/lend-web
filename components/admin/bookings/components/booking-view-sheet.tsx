"use client";

import { StatusBadge } from "@/components/admin/status-badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  formatBookingDate,
  formatBookingDateTime,
  formatBookingMoney,
  getBookingAssetTitle,
  getBookingOwnerId,
  getBookingOwnerName,
  getBookingRenterId,
  getBookingRenterName,
  type AdminBooking,
} from "@/lib/admin-bookings";

type BookingViewSheetProps = {
  booking: AdminBooking;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function BookingViewSheet({
  booking,
  onOpenChange,
  open,
}: BookingViewSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{booking.id}</SheetTitle>
          <SheetDescription>{getBookingAssetTitle(booking)}</SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-5 overflow-y-auto px-4 pb-4">
          <div className="grid gap-3 rounded-md border p-4 text-sm">
            <DetailRow label="Asset" value={getBookingAssetTitle(booking)} />
            <DetailRow label="Asset ID" value={booking.assetId} />
            <DetailRow label="Category" value={booking.asset?.category ?? "Not set"} />
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Status</span>
              {booking.status ? <StatusBadge value={booking.status} /> : <span>Not set</span>}
            </div>
          </div>

          <div className="grid gap-3 rounded-md border p-4 text-sm">
            <DetailRow label="Owner" value={getBookingOwnerName(booking)} />
            <DetailRow label="Owner ID" value={getBookingOwnerId(booking) ?? "Not set"} />
            <DetailRow label="Renter" value={getBookingRenterName(booking)} />
            <DetailRow label="Renter ID" value={getBookingRenterId(booking) ?? "Not set"} />
          </div>

          <div className="grid gap-3 rounded-md border p-4 text-sm">
            <DetailRow label="Start" value={formatBookingDate(booking.startDate)} />
            <DetailRow label="End" value={formatBookingDate(booking.endDate)} />
            <DetailRow label="Days" value={`${booking.numDays ?? "Not set"}`} />
            <DetailRow label="Total" value={formatBookingMoney(booking.totalPrice)} />
            <DetailRow label="Created" value={formatBookingDateTime(booking.createdAt)} />
          </div>

          <div className="grid gap-3 rounded-md border p-4 text-sm">
            <DetailRow label="Chat ID" value={booking.chatId ?? "Not set"} />
            <DetailRow label="Payment method" value={booking.payment?.method ?? "Not set"} />
            <DetailRow label="Transaction ID" value={booking.payment?.transactionId ?? "Not set"} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
