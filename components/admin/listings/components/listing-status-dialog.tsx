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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  adminListingStatusUpdateValues,
  type AdminListing,
  type AdminListingStatusUpdate,
} from "@/lib/admin-listings";

import { useListingMutation } from "../hooks/use-listing-mutations";

type ListingStatusDialogProps = {
  listing: AdminListing;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function ListingStatusDialog({
  listing,
  onOpenChange,
  open,
}: ListingStatusDialogProps) {
  const { error, resetError, submitting, updateListingStatus } =
    useListingMutation(listing);
  const [status, setStatus] = React.useState<AdminListingStatusUpdate>(
    normalizeStatus(listing.status),
  );
  const [reason, setReason] = React.useState("");
  const archiveReasonMissing = status === "Archived" && !reason.trim();

  React.useEffect(() => {
    if (!open) return;

    resetError();
    setStatus(normalizeStatus(listing.status));
    setReason("");
  }, [listing.status, open, resetError]);

  async function onConfirm() {
    if (archiveReasonMissing) return;

    const success = await updateListingStatus(status, reason.trim());
    if (success) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update listing status</DialogTitle>
          <DialogDescription>
            Update the owner listing status and notify the owner.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor={`listing-status-update-${listing.id}`}>Status</Label>
            <Select
              onValueChange={(value) =>
                setStatus(value as AdminListingStatusUpdate)
              }
              value={status}
            >
              <SelectTrigger id={`listing-status-update-${listing.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {adminListingStatusUpdateValues.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {status === "Archived" ? (
            <div className="grid gap-2">
              <Label htmlFor={`listing-status-archive-reason-${listing.id}`}>
                Reason
              </Label>
              <Textarea
                id={`listing-status-archive-reason-${listing.id}`}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Explain why this listing is being archived"
                required
                value={reason}
              />
              {archiveReasonMissing ? (
                <p className="text-sm text-destructive">
                  Archive reason is required.
                </p>
              ) : null}
            </div>
          ) : null}
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
            disabled={submitting || archiveReasonMissing}
            onClick={onConfirm}
            type="button"
          >
            {submitting ? <Loader2 className="animate-spin" /> : null}
            Update status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function normalizeStatus(value: string | null): AdminListingStatusUpdate {
  return adminListingStatusUpdateValues.includes(
    value as AdminListingStatusUpdate,
  )
    ? (value as AdminListingStatusUpdate)
    : "Available";
}
