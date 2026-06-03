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

type DeleteCategoryDialogProps = {
  category: AdminCategory | null;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
};

export function DeleteCategoryDialog({
  category,
  onConfirm,
  onOpenChange,
  pending,
}: DeleteCategoryDialogProps) {
  return (
    <Dialog open={Boolean(category)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete category</DialogTitle>
          <DialogDescription>
            Permanently remove this category document from Firestore. Existing
            listings keep their stored category metadata.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border p-3 text-sm">
          <div className="font-medium">{category?.name ?? "Category"}</div>
          <div className="mt-1 break-words font-mono text-xs text-muted-foreground">
            {category?.id ?? ""}
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={pending}
            onClick={onConfirm}
            type="button"
            variant="destructive"
          >
            {pending ? <Loader2 className="animate-spin" /> : null}
            Delete
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
