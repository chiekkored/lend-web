"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { UserRound } from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatUserDate, getUserDisplayName, type AdminUser, type UserDirectorySection } from "@/lib/admin-users";

import { AdminUserRowActions } from "./admin-user-row-actions";
import { UserRowActions } from "./user-row-actions";
import { VerificationRowActions } from "./verification-row-actions";

type UserColumnsOptions = {
  callerAdminType: string | null;
  callerUid: string | null;
  section: UserDirectorySection;
};

export function useUserColumns({ callerAdminType, callerUid, section }: UserColumnsOptions) {
  return React.useMemo<ColumnDef<AdminUser>[]>(() => {
    const nameColumn: ColumnDef<AdminUser> = {
      id: "name",
      accessorFn: getUserDisplayName,
      header: "Name",
      cell: ({ row }) => {
        const user = row.original;
        const displayName = getUserDisplayName(user);
        const initials = displayName
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        return (
          <div className="flex min-w-56 items-center gap-3">
            <Avatar className="size-9">
              <AvatarFallback>{initials || <UserRound className="size-4" />}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{user.uid}</p>
            </div>
          </div>
        );
      },
    };
    const emailColumn: ColumnDef<AdminUser> = {
      id: "email",
      accessorFn: (user) => user.email ?? "",
      header: "Email",
      cell: ({ row }) => row.original.email ?? "Not set",
    };
    const adminTypeColumn: ColumnDef<AdminUser> = {
      id: "adminType",
      accessorFn: (user) => user.adminType ?? "",
      header: "Admin Type",
      cell: ({ row }) => row.original.adminType ?? "Not set",
    };
    const createdAtColumn: ColumnDef<AdminUser> = {
      id: "createdAt",
      accessorFn: (user) => user.createdAt?.getTime() ?? 0,
      header: "Created At",
      cell: ({ row }) => formatUserDate(row.original.createdAt),
    };

    if (section === "admin-users") {
      return [
        nameColumn,
        emailColumn,
        adminTypeColumn,
        createdAtColumn,
        {
          id: "actions",
          enableGlobalFilter: false,
          enableHiding: false,
          enableSorting: false,
          header: () => <span className="sr-only">Actions</span>,
          cell: ({ row }) => (
            <AdminUserRowActions callerAdminType={callerAdminType} callerUid={callerUid} user={row.original} />
          ),
        },
      ];
    }

    if (section === "verifications") {
      return [
        nameColumn,
        emailColumn,
        {
          id: "requestType",
          accessorFn: (user) => user.fullVerificationSubmission?.requestType ?? "",
          header: "Request Type",
          cell: ({ row }) => formatRequestType(row.original.fullVerificationSubmission?.requestType),
        },
        {
          id: "submittedAt",
          accessorFn: (user) => {
            const submittedAt =
              user.fullVerificationSubmission?.submittedAt ??
              dateFromUnknown(user.fullVerification?.submittedAt);
            return submittedAt?.getTime() ?? 0;
          },
          header: "Submitted",
          cell: ({ row }) =>
            formatUserDate(
              row.original.fullVerificationSubmission?.submittedAt ??
                dateFromUnknown(row.original.fullVerification?.submittedAt),
            ),
        },
        {
          id: "verified",
          accessorFn: (user) => user.verified,
          header: "Verified",
          cell: ({ row }) => <StatusBadge value={row.original.verified} />,
        },
        {
          id: "actions",
          enableGlobalFilter: false,
          enableHiding: false,
          enableSorting: false,
          header: () => <span className="sr-only">Actions</span>,
          cell: ({ row }) => <VerificationRowActions user={row.original} />,
        },
      ];
    }

    return [
      nameColumn,
      emailColumn,
      {
        id: "phone",
        accessorFn: (user) => user.phone ?? "",
        header: "Phone",
        cell: ({ row }) => row.original.phone ?? "Not set",
      },
      {
        id: "type",
        accessorFn: (user) => user.type ?? "",
        header: "Type",
        cell: ({ row }) => row.original.type ?? "Not set",
      },
      adminTypeColumn,
      {
        id: "verified",
        accessorFn: (user) => user.verified,
        header: "Verified",
        cell: ({ row }) => <StatusBadge value={row.original.verified} />,
      },
      createdAtColumn,
      {
        id: "userMetadataVersion",
        accessorFn: (user) => user.userMetadataVersion,
        header: "MVersion",
        cell: ({ row }) => row.original.userMetadataVersion,
      },
      {
        id: "actions",
        enableGlobalFilter: false,
        enableHiding: false,
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => <UserRowActions user={row.original} />,
      },
    ];
  }, [callerAdminType, callerUid, section]);
}

function formatRequestType(value: string | null | undefined) {
  switch (value) {
    case "upgrade_verification":
      return "Upgrade Verification";
    case "account_information_update":
      return "Account Information Update";
    default:
      return "Legacy Request";
  }
}

function dateFromUnknown(value: unknown) {
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate() as Date;
  }
  return null;
}
