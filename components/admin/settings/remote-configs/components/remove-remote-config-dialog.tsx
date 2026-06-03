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

import type { RemoteConfigParameter } from "../data/remote-configs";

type RemoveRemoteConfigDialogProps = {
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  parameter: RemoteConfigParameter | null;
  removing: boolean;
};

export function RemoveRemoteConfigDialog({
  onConfirm,
  onOpenChange,
  open,
  parameter,
  removing,
}: RemoveRemoteConfigDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Remote Config</DialogTitle>
          <DialogDescription>
            Remove this parameter from Firebase Remote Config and publish the
            updated template.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border p-3 text-sm">
          <div className="font-medium">{parameter?.name ?? "Remote Config"}</div>
          <div className="mt-1 break-words font-mono text-xs text-muted-foreground">
            {parameter?.value ?? ""}
          </div>
        </div>
        <DialogFooter>
          <Button
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={removing}
            onClick={onConfirm}
            type="button"
          >
            {removing ? <Loader2 className="animate-spin" /> : null}
            Remove
          </Button>
          <Button
            disabled={removing}
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
