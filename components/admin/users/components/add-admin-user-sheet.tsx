"use client";

import { AlertCircle, Loader2, UserPlus } from "lucide-react";

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
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  type AddAdminValues,
  useAddAdminUser,
} from "../hooks/use-add-admin-user";

type AddAdminUserSheetProps = {
  callerAdminType: string | null;
};

export function AddAdminUserSheet({
  callerAdminType,
}: AddAdminUserSheetProps) {
  const {
    allowedTypes,
    error,
    form,
    onSubmit,
    open,
    setOpen,
  } = useAddAdminUser({
    callerAdminType,
  });
  const {
    formState: { errors, isSubmitting },
    register,
    setValue,
    watch,
  } = form;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <UserPlus />
          Add admin user
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add admin user</SheetTitle>
          <SheetDescription>
            Create a Firebase Auth admin account and assign its admin role.
          </SheetDescription>
        </SheetHeader>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit}>
          <div className="grid flex-1 auto-rows-min gap-5 overflow-y-auto px-4">
            <div className="grid gap-2">
              <Label htmlFor="add-admin-email">Email</Label>
              <Input
                autoComplete="email"
                id="add-admin-email"
                placeholder="admin@example.com"
                type="email"
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-admin-display-name">Display name</Label>
              <Input
                autoComplete="name"
                id="add-admin-display-name"
                placeholder="Jane Admin"
                {...register("displayName")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-admin-type">Admin type</Label>
              <Select
                onValueChange={(value) =>
                  setValue("adminType", value as AddAdminValues["adminType"], {
                    shouldValidate: true,
                  })
                }
                value={watch("adminType")}
              >
                <SelectTrigger id="add-admin-type">
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
              <Label htmlFor="add-admin-password">Password</Label>
              <Input
                autoComplete="new-password"
                id="add-admin-password"
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
              <Label htmlFor="add-admin-confirm-password">Confirm password</Label>
              <Input
                autoComplete="new-password"
                id="add-admin-confirm-password"
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
              Create admin
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
