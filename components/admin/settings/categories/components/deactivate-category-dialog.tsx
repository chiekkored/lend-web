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
import type { AdminCategory } from "@/lib/admin-categories";

type DeactivateCategoryDialogProps = {
  category: AdminCategory | null;
  listingCount: number | null;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
};

export function DeactivateCategoryDialog({
  category,
  listingCount,
  onConfirm,
  onOpenChange,
  pending,
}: DeactivateCategoryDialogProps) {
  return (
    <Dialog open={Boolean(category)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivate category</DialogTitle>
          <DialogDescription>
            Existing listings remain valid. This category will be hidden from
            new listing creation.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border p-3 text-sm">
          <p className="font-medium">{category?.name ?? "Category"}</p>
          <p className="mt-1 text-muted-foreground">
            {listingCount == null
              ? "Checking existing listings..."
              : `${listingCount} active listing${listingCount === 1 ? "" : "s"} use this category.`}
          </p>
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
