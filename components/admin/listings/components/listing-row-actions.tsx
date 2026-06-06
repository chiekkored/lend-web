"use client";

import * as React from "react";
import {
  Eye,
  MoreVerticalIcon,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminListing } from "@/lib/admin-listings";

import { ListingConfirmDialog } from "./listing-confirm-dialog";
import { ListingEditSheet } from "./listing-edit-sheet";
import { ListingViewSheet } from "./listing-view-sheet";

type ListingRowActionsProps = {
  listing: AdminListing;
};

export function ListingRowActions({ listing }: ListingRowActionsProps) {
  const [viewOpen, setViewOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Open listing actions" size="icon" variant="ghost">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
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
              setEditOpen(true);
            }}
          >
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(event) => {
              event.preventDefault();
              setDeleteOpen(true);
            }}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ListingViewSheet
        listing={listing}
        onOpenChange={setViewOpen}
        open={viewOpen}
      />
      <ListingEditSheet
        listing={listing}
        onOpenChange={setEditOpen}
        open={editOpen}
      />
      <ListingConfirmDialog
        listing={listing}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
      />
    </div>
  );
}
