"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/admin/status-badge";
import {
  buildBookingSearchText,
  formatBookingDate,
  formatBookingMoney,
  getBookingAssetTitle,
  getBookingOwnerId,
  getBookingOwnerName,
  getBookingRenterId,
  getBookingRenterName,
  type AdminBooking,
} from "@/lib/admin-bookings";

import { BookingRowActions } from "./booking-row-actions";
import type { BookingActionsMode } from "./booking-table";

export function useBookingColumns({
  actionsMode = "default",
}: {
  actionsMode?: BookingActionsMode;
} = {}) {
  return React.useMemo<ColumnDef<AdminBooking>[]>(
    () => [
      {
        id: "booking",
        accessorFn: buildBookingSearchText,
        header: "Booking",
        cell: ({ row }) => (
          <div className="min-w-44">
            <p className="truncate font-medium">{row.original.id}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.chatId ?? "No chat"}
            </p>
          </div>
        ),
      },
      {
        id: "asset",
        accessorFn: getBookingAssetTitle,
        header: "Asset",
        cell: ({ row }) => (
          <div className="min-w-48">
            <p className="truncate">{getBookingAssetTitle(row.original)}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.assetId}
            </p>
          </div>
        ),
      },
      {
        id: "owner",
        accessorFn: getBookingOwnerName,
        header: "Owner",
        cell: ({ row }) => (
          <div className="min-w-40">
            <p className="truncate">{getBookingOwnerName(row.original)}</p>
            <p className="truncate text-xs text-muted-foreground">
              {getBookingOwnerId(row.original) ?? "No owner ID"}
            </p>
          </div>
        ),
      },
      {
        id: "renter",
        accessorFn: getBookingRenterName,
        header: "Renter",
        cell: ({ row }) => (
          <div className="min-w-40">
            <p className="truncate">{getBookingRenterName(row.original)}</p>
            <p className="truncate text-xs text-muted-foreground">
              {getBookingRenterId(row.original) ?? "No renter ID"}
            </p>
          </div>
        ),
      },
      {
        id: "dates",
        accessorFn: (booking) =>
          `${formatBookingDate(booking.startDate)} ${formatBookingDate(booking.endDate)}`,
        header: "Dates",
        cell: ({ row }) => (
          <div className="min-w-36">
            <p>{formatBookingDate(row.original.startDate)}</p>
            <p className="text-xs text-muted-foreground">
              to {formatBookingDate(row.original.endDate)}
            </p>
          </div>
        ),
      },
      {
        id: "numDays",
        accessorFn: (booking) => booking.numDays ?? 0,
        header: "Days",
        cell: ({ row }) => row.original.numDays ?? "Not set",
      },
      {
        id: "totalPrice",
        accessorFn: (booking) => booking.totalPrice ?? 0,
        header: "Total",
        cell: ({ row }) => formatBookingMoney(row.original.totalPrice),
      },
      {
        id: "status",
        accessorFn: (booking) => booking.status ?? "",
        header: "Status",
        cell: ({ row }) =>
          row.original.status ? <StatusBadge value={row.original.status} /> : "Not set",
      },
      {
        id: "createdAt",
        accessorFn: (booking) => booking.createdAt?.getTime() ?? 0,
        header: "Created",
        cell: ({ row }) => formatBookingDate(row.original.createdAt),
      },
      {
        id: "actions",
        enableGlobalFilter: false,
        enableHiding: false,
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <BookingRowActions actionsMode={actionsMode} booking={row.original} />
        ),
      },
    ],
    [actionsMode],
  );
}
