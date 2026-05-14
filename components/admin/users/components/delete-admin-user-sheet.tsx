"use client";

import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getUserDisplayName, type AdminUser } from "@/lib/admin-users";

import { useDeleteAdminUser } from "../hooks/use-delete-admin-user";

type DeleteAdminUserSheetProps = {
  disabled?: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  user: AdminUser;
};

export function DeleteAdminUserSheet({
  disabled = false,
  onOpenChange,
  open,
  user,
}: DeleteAdminUserSheetProps) {
  const displayName = getUserDisplayName(user);
  const {
    deleteAdminUser,
    error,
    submitting,
  } = useDeleteAdminUser({ onOpenChange, uid: user.uid });

  return (
    <Sheet open={open && !disabled} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Delete admin user</SheetTitle>
          <SheetDescription>
            Disable the Firebase Auth account and remove admin access.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-5 overflow-y-auto px-4">
          <div className="rounded-md border p-4 text-sm">
            <p className="font-medium">{displayName}</p>
            <p className="mt-1 text-muted-foreground">
              {user.email ?? "No email"}
            </p>
            <p className="mt-1 text-muted-foreground">
              Role: {user.adminType ?? "Not set"}
            </p>
          </div>
          {error ? (
            <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}
        </div>
        <SheetFooter>
          <Button
            disabled={submitting}
            onClick={deleteAdminUser}
            type="button"
            variant="destructive"
          >
            {submitting ? <Loader2 className="animate-spin" /> : null}
            Delete admin
          </Button>
          <SheetClose asChild>
            <Button disabled={submitting} type="button" variant="outline">
              Cancel
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
