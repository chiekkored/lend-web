"use client";

import * as React from "react";
import { MoreVerticalIcon, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
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
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Open admin user actions" size="icon" variant="ghost">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setEditOpen(true);
            }}
          >
            <Pencil />
            Edit admin
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            disabled={callerUid === user.uid}
            onSelect={(event) => {
              event.preventDefault();
              setDeleteOpen(true);
            }}
          >
            <Trash2 />
            Delete admin
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UpdateAdminUserSheet
        callerAdminType={callerAdminType}
        onOpenChange={setEditOpen}
        open={editOpen}
        user={user}
      />
      <DeleteAdminUserSheet
        disabled={callerUid === user.uid}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        user={user}
      />
    </div>
  );
}
