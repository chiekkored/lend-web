"use client";

import * as React from "react";
import { Ban, Eye, MoreVerticalIcon, RefreshCcw } from "lucide-react";

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
import { BookingStatusSheet } from "./booking-status-sheet";
import { BookingViewSheet } from "./booking-view-sheet";

type BookingRowActionsProps = {
  booking: AdminBooking;
};

export function BookingRowActions({ booking }: BookingRowActionsProps) {
  const [viewOpen, setViewOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);

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
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            disabled={booking.status === "Cancelled"}
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
    </div>
  );
}
