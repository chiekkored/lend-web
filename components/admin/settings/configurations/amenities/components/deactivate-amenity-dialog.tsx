"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminAmenity } from "@/lib/admin-amenities";

type DeactivateAmenityDialogProps = {
  amenity: AdminAmenity | null;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
};

export function DeactivateAmenityDialog({
  amenity,
  onConfirm,
  onOpenChange,
  pending,
}: DeactivateAmenityDialogProps) {
  return (
    <Dialog open={Boolean(amenity)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivate amenity</DialogTitle>
          <DialogDescription>
            This amenity will no longer be available for new listings.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border p-3 text-sm font-medium">
          {amenity?.label ?? "Amenity"}
        </div>
        <DialogFooter>
          <Button disabled={pending} onClick={onConfirm} type="button">
            {pending ? <Loader2 className="animate-spin" /> : null}
            Deactivate
          </Button>
          <Button
            disabled={pending}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
