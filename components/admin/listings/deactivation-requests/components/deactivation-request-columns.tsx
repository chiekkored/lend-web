"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";

import {
  buildListingDeactivationRequestSearchText,
  formatDeactivationDate,
  type ListingDeactivationRequest,
} from "../data/deactivation-request-queries";
import { DeactivationRequestRowActions } from "./deactivation-request-row-actions";

export function getDeactivationRequestColumns({
  onView,
}: {
  onView: (request: ListingDeactivationRequest) => void;
}): ColumnDef<ListingDeactivationRequest>[] {
  return [
    {
      accessorFn: buildListingDeactivationRequestSearchText,
      cell: ({ row }) => {
        const request = row.original;
        return (
          <div className="min-w-56">
            <p className="truncate font-medium">
              {request.listingSnapshot.title ?? request.assetId}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {request.assetId}
            </p>
          </div>
        );
      },
      header: "Listing",
      id: "listing",
    },
    {
      accessorKey: "ownerId",
      cell: ({ row }) => (
        <div className="min-w-36 truncate">{row.original.ownerId}</div>
      ),
      header: "Owner",
    },
    {
      accessorKey: "status",
      cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
      header: "Status",
    },
    {
      accessorKey: "bookingSummaries",
      cell: ({ row }) => row.original.bookingSummaries.length,
      header: "Upcoming bookings",
    },
    {
      accessorKey: "reason",
      cell: ({ row }) => (
        <div className="min-w-36 max-w-56 truncate">
          {row.original.reason ?? "Not set"}
        </div>
      ),
      header: "Reason",
    },
    {
      accessorKey: "createdAt",
      cell: ({ row }) => formatDeactivationDate(row.original.createdAt),
      header: "Requested",
    },
    {
      cell: ({ row }) => (
        <DeactivationRequestRowActions
          onView={onView}
          request={row.original}
        />
      ),
      id: "actions",
    },
  ];
}
