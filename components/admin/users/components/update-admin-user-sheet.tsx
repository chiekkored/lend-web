"use client";

import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import {
  type UpdateAdminValues,
  useUpdateAdminUser,
} from "../hooks/use-update-admin-user";

type UpdateAdminUserSheetProps = {
  callerAdminType: string | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  user: AdminUser;
};

export function UpdateAdminUserSheet({
  callerAdminType,
  onOpenChange,
  open,
  user,
}: UpdateAdminUserSheetProps) {
  const displayName = getUserDisplayName(user);
  const {
    allowedTypes,
    error,
    form,
    onSubmit,
  } = useUpdateAdminUser({
    callerAdminType,
    defaultAdminType: user.adminType,
    defaultDisplayName: displayName,
    onOpenChange,
    open,
    uid: user.uid,
  });
  const {
    formState: { errors, isSubmitting },
    register,
    setValue,
    watch,
  } = form;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Update admin user</SheetTitle>
          <SheetDescription>
            Update the admin profile, custom claims, or password.
          </SheetDescription>
        </SheetHeader>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit}>
          <div className="grid flex-1 auto-rows-min gap-5 overflow-y-auto px-4">
            <div className="grid gap-2">
              <Label htmlFor={`update-admin-name-${user.uid}`}>
                Display name
              </Label>
              <Input
                autoComplete="name"
                id={`update-admin-name-${user.uid}`}
                placeholder="Jane Admin"
                {...register("displayName")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`update-admin-type-${user.uid}`}>
                Admin type
              </Label>
              <Select
                onValueChange={(value) =>
                  setValue(
                    "adminType",
                    value as UpdateAdminValues["adminType"],
                    { shouldValidate: true },
                  )
                }
                value={watch("adminType")}
              >
                <SelectTrigger id={`update-admin-type-${user.uid}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allowedTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.adminType ? (
                <p className="text-sm text-destructive">
                  {errors.adminType.message}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`update-admin-password-${user.uid}`}>
                New password
              </Label>
              <Input
                autoComplete="new-password"
                id={`update-admin-password-${user.uid}`}
                placeholder="Leave blank to keep current password"
                type="password"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`update-admin-confirm-password-${user.uid}`}>
                Confirm new password
              </Label>
              <Input
                autoComplete="new-password"
                id={`update-admin-confirm-password-${user.uid}`}
                type="password"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword ? (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              ) : null}
            </div>
            {error ? (
              <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}
          </div>
          <SheetFooter>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? <Loader2 className="animate-spin" /> : null}
              Save changes
            </Button>
            <SheetClose asChild>
              <Button disabled={isSubmitting} type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
