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
import { getListingOwnerName, type AdminListing } from "@/lib/admin-listings";

import { useListingMutation } from "../hooks/use-listing-mutations";

type ListingConfirmDialogProps = {
  action: "delete" | "reject";
  listing: AdminListing;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

const rejectionReasons = [
  "Prohibited or unsupported item",
  "Unclear or insufficient photos",
  "Incomplete listing details",
  "Pricing appears incorrect",
  "Duplicate listing",
  "Safety or policy concern",
  "Item appears unavailable",
  "Other",
];

export function ListingConfirmDialog({ action, listing, onOpenChange, open }: ListingConfirmDialogProps) {
  const { deleteListing, error, rejectListing, resetError, submitting } = useListingMutation(listing);
  const isReject = action === "reject";
  const [reason, setReason] = React.useState(rejectionReasons[0]);
  const [otherReason, setOtherReason] = React.useState("");
  const notes = reason === "Other" ? otherReason.trim() : reason;
  const reasonMissing = !notes;

  React.useEffect(() => {
    if (open) {
      resetError();
      setReason(rejectionReasons[0]);
      setOtherReason("");
    }
  }, [open, resetError]);

  async function onConfirm() {
    if (reasonMissing) {
      return;
    }

    const success = isReject ? await rejectListing(notes) : await deleteListing(notes);
    if (success) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isReject ? "Reject listing" : "Delete listing"}</DialogTitle>
          <DialogDescription>
            {isReject
              ? "This sets the listing status to Rejected for the asset and owner mirror."
              : "This soft deletes the listing from the asset and owner mirror records."}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border p-4 text-sm">
          <p className="font-medium">{listing.title ?? "Untitled listing"}</p>
          <p className="mt-1 text-muted-foreground">{listing.id}</p>
          <p className="mt-1 text-muted-foreground">Owner: {getListingOwnerName(listing)}</p>
        </div>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor={`${action}-listing-reason-${listing.id}`}>Reason</Label>
            <Select onValueChange={setReason} value={reason}>
              <SelectTrigger id={`${action}-listing-reason-${listing.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rejectionReasons.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {reason === "Other" ? (
            <div className="grid gap-2">
              <Label htmlFor={`${action}-listing-other-reason-${listing.id}`}>Notes</Label>
              <Textarea
                id={`${action}-listing-other-reason-${listing.id}`}
                onChange={(event) => setOtherReason(event.target.value)}
                placeholder="Enter the reason"
                required
                value={otherReason}
              />
              {reasonMissing ? (
                <p className="text-sm text-destructive">Reason notes are required.</p>
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
          <Button disabled={submitting || reasonMissing} onClick={onConfirm} type="button" variant="destructive">
            {submitting ? <Loader2 className="animate-spin" /> : null}
            {isReject ? "Reject listing" : "Delete listing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
