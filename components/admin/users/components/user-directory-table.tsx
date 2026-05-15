"use client";

import type { ReactNode } from "react";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import type { AdminUser, UserDirectorySection } from "@/lib/admin-users";

import { useUserColumns } from "./user-columns";

type UserDirectoryTableProps = {
  actions?: ReactNode;
  callerAdminType: string | null;
  callerUid: string | null;
  data: AdminUser[];
  error: string | null;
  loading: boolean;
  searchPlaceholder: string;
  section: UserDirectorySection;
};

export function UserDirectoryTable({
  actions,
  callerAdminType,
  callerUid,
  data,
  error,
  loading,
  searchPlaceholder,
  section,
}: UserDirectoryTableProps) {
  const columns = useUserColumns({
    callerAdminType,
    callerUid,
    section,
  });

  return (
    <AdminDataTable
      actions={actions}
      columns={columns}
      data={data}
      emptyMessage="No users match this view."
      error={error}
      loading={loading}
      primaryColumnId="name"
      searchPlaceholder={searchPlaceholder}
      storageKey={`admin:users:${section}:column-visibility`}
    />
  );
}
