"use client";

import * as React from "react";
import { CheckCircle2, Eye, MoreVerticalIcon, RefreshCcw, XCircle } from "lucide-react";

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

import type { BookingActionsMode } from "./booking-table";
import { BookingCancellationReviewDialog } from "./booking-cancellation-review-dialog";
import { BookingCancellationViewSheet } from "./booking-cancellation-view-sheet";
import { BookingDamageReviewDialog } from "./booking-damage-review-dialog";
import { BookingPendingDamageViewSheet } from "./booking-pending-damage-view-sheet";
import { BookingStatusDialog } from "./booking-status-dialog";
import { BookingViewSheet } from "./booking-view-sheet";

type BookingRowActionsProps = {
  actionsMode?: BookingActionsMode;
  booking: AdminBooking;
};

export function BookingRowActions({
  actionsMode = "all",
  booking,
}: BookingRowActionsProps) {
  const [viewOpen, setViewOpen] = React.useState(false);
  const [pendingDamageOpen, setPendingDamageOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [approveCancellationOpen, setApproveCancellationOpen] =
    React.useState(false);
  const [rejectCancellationOpen, setRejectCancellationOpen] =
    React.useState(false);
  const [damageReviewOpen, setDamageReviewOpen] = React.useState(false);
  const hasCancellationRequest = booking.status === "Cancellation Requested";
  const hasDamageReview =
    booking.settlement?.status === "admin_review_required" &&
    Boolean(booking.damageDeductionRequest);
  const isPendingDamageMode = actionsMode === "pending-damage";
  const isCancellationMode = actionsMode === "cancellations";

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
              if (isPendingDamageMode) {
                setPendingDamageOpen(true);
              } else {
                setViewOpen(true);
              }
            }}
          >
            <Eye />
            View
          </DropdownMenuItem>
          {isPendingDamageMode ? null : (
            <>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setStatusOpen(true);
                }}
              >
                <RefreshCcw />
                Update status
              </DropdownMenuItem>
              {isCancellationMode && hasCancellationRequest ? (
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
              {isCancellationMode && hasDamageReview ? (
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
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {isCancellationMode ? (
        <BookingCancellationViewSheet
          booking={booking}
          onOpenChange={setViewOpen}
          open={viewOpen}
        />
      ) : (
        <BookingViewSheet
          booking={booking}
          onOpenChange={setViewOpen}
          open={viewOpen}
        />
      )}
      <BookingStatusDialog
        booking={booking}
        onOpenChange={setStatusOpen}
        open={statusOpen}
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
      <BookingPendingDamageViewSheet
        booking={booking}
        onOpenChange={setPendingDamageOpen}
        open={pendingDamageOpen}
      />
    </div>
  );
}
