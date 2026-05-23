"use client";

import * as React from "react";
import { Ban, CheckCircle2, Eye, MoreVerticalIcon, RefreshCcw, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminBooking } from "@/lib/admin-bookings";

import { BookingCancelDialog } from "./booking-cancel-dialog";
import { BookingCancellationReviewDialog } from "./booking-cancellation-review-dialog";
import { BookingDamageReviewDialog } from "./booking-damage-review-dialog";
import { BookingStatusSheet } from "./booking-status-sheet";
import { BookingViewSheet } from "./booking-view-sheet";

type BookingRowActionsProps = {
  booking: AdminBooking;
};

export function BookingRowActions({ booking }: BookingRowActionsProps) {
  const [viewOpen, setViewOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [approveCancellationOpen, setApproveCancellationOpen] =
    React.useState(false);
  const [rejectCancellationOpen, setRejectCancellationOpen] =
    React.useState(false);
  const [damageReviewOpen, setDamageReviewOpen] = React.useState(false);
  const hasCancellationRequest = booking.status === "Cancellation Requested";
  const hasDamageReview =
    booking.settlement?.status === "admin_review_required" &&
    Boolean(booking.damageDeductionRequest);

  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Open booking actions" size="icon" variant="ghost">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setViewOpen(true);
            }}
          >
            <Eye />
            View
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setStatusOpen(true);
            }}
          >
            <RefreshCcw />
            Update status
          </DropdownMenuItem>
          {hasCancellationRequest ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setApproveCancellationOpen(true);
                }}
              >
                <CheckCircle2 />
                Approve cancellation
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setRejectCancellationOpen(true);
                }}
              >
                <XCircle />
                Reject cancellation
              </DropdownMenuItem>
            </>
          ) : null}
          {hasDamageReview ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setDamageReviewOpen(true);
                }}
              >
                <CheckCircle2 />
                Review damage fees
              </DropdownMenuItem>
            </>
          ) : null}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            disabled={booking.status === "Cancelled" || hasCancellationRequest}
            onSelect={(event) => {
              event.preventDefault();
              setCancelOpen(true);
            }}
          >
            <Ban />
            Cancel booking
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <BookingViewSheet
        booking={booking}
        onOpenChange={setViewOpen}
        open={viewOpen}
      />
      <BookingStatusSheet
        booking={booking}
        onOpenChange={setStatusOpen}
        open={statusOpen}
      />
      <BookingCancelDialog
        booking={booking}
        onOpenChange={setCancelOpen}
        open={cancelOpen}
      />
      <BookingCancellationReviewDialog
        booking={booking}
        decision="approve"
        onOpenChange={setApproveCancellationOpen}
        open={approveCancellationOpen}
      />
      <BookingCancellationReviewDialog
        booking={booking}
        decision="reject"
        onOpenChange={setRejectCancellationOpen}
        open={rejectCancellationOpen}
      />
      <BookingDamageReviewDialog
        booking={booking}
        onOpenChange={setDamageReviewOpen}
        open={damageReviewOpen}
      />
    </div>
  );
}
