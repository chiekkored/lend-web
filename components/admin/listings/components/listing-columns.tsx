"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ImageIcon } from "lucide-react";
import Image from "next/image";

import { StatusBadge } from "@/components/admin/status-badge";
import {
  buildListingSearchText,
  formatListingDate,
  formatListingPrice,
  getListingOwnerName,
  getListingThumbnail,
  type AdminListing,
} from "@/lib/admin-listings";

import { ListingRowActions } from "./listing-row-actions";

export function useListingColumns() {
  return React.useMemo<ColumnDef<AdminListing>[]>(
    () => [
      {
        id: "asset",
        accessorFn: buildListingSearchText,
        header: "Asset",
        cell: ({ row }) => {
          const listing = row.original;
          const thumbnail = getListingThumbnail(listing);

          return (
            <div className="flex min-w-64 items-center gap-3">
              {thumbnail ? (
                <Image
                  alt={listing.title ?? "Listing thumbnail"}
                  className="size-12 rounded-md border object-cover"
                  height={48}
                  src={thumbnail}
                  unoptimized
                  width={48}
                />
              ) : (
                <div className="flex size-12 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                  <ImageIcon className="size-4" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {listing.title ?? "Untitled listing"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {listing.id}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "category",
        accessorFn: (listing) => listing.category ?? "",
        header: "Category",
        cell: ({ row }) => row.original.category ?? "Not set",
      },
      {
        id: "owner",
        accessorFn: getListingOwnerName,
        header: "Owner",
        cell: ({ row }) => (
          <div className="min-w-40">
            <p className="truncate">{getListingOwnerName(row.original)}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.ownerId ?? "No owner ID"}
            </p>
          </div>
        ),
      },
      {
        id: "price",
        accessorFn: (listing) => listing.rates.daily ?? 0,
        header: "Price",
        cell: ({ row }) => `${formatListingPrice(row.original.rates.daily)} / day`,
      },
      {
        id: "status",
        accessorFn: (listing) => listing.status ?? "",
        header: "Status",
        cell: ({ row }) =>
          row.original.status ? <StatusBadge value={row.original.status} /> : "Not set",
      },
      {
        id: "pendingBookingCount",
        accessorFn: (listing) => listing.pendingBookingCount,
        header: "Pending",
        cell: ({ row }) => row.original.pendingBookingCount,
      },
      {
        id: "createdAt",
        accessorFn: (listing) => listing.createdAt?.getTime() ?? 0,
        header: "Created",
        cell: ({ row }) => formatListingDate(row.original.createdAt),
      },
      {
        id: "actions",
        enableGlobalFilter: false,
        enableHiding: false,
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => <ListingRowActions listing={row.original} />,
      },
    ],
    [],
  );
}
