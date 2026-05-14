"use client";

import {
  canManageAdminUser,
  type AdminUser,
} from "@/lib/admin-users";

import { DeleteAdminUserSheet } from "./delete-admin-user-sheet";
import { UpdateAdminUserSheet } from "./update-admin-user-sheet";

type AdminUserRowActionsProps = {
  callerAdminType: string | null;
  callerUid: string | null;
  user: AdminUser;
};

export function AdminUserRowActions({
  callerAdminType,
  callerUid,
  user,
}: AdminUserRowActionsProps) {
  const canManage = canManageAdminUser({
    callerAdminType,
    targetAdminType: user.adminType,
  });

  if (!canManage) {
    return (
      <div className="text-right text-sm text-muted-foreground">
        No actions
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-1">
      <UpdateAdminUserSheet callerAdminType={callerAdminType} user={user} />
      <DeleteAdminUserSheet disabled={callerUid === user.uid} user={user} />
    </div>
  );
}
