"use client";

import type { UserDirectorySection } from "@/lib/admin-users";

import {
  AddAdminUserSheet,
  UserDirectoryHeader,
  UserDirectoryTable,
} from "./components";
import { useUserDirectory } from "./hooks/use-user-directory";

type UserDirectoryPageProps = {
  section: UserDirectorySection;
};

export function UserDirectoryPage({ section }: UserDirectoryPageProps) {
  const {
    callerAdminType,
    callerUid,
    canAddAdmin,
    content,
    data,
    error,
    loading,
    pagination,
  } = useUserDirectory(section);
  const tableActions = canAddAdmin ? (
    <AddAdminUserSheet callerAdminType={callerAdminType} />
  ) : null;

  return (
    <div className="space-y-6">
      <UserDirectoryHeader
        description={content.description}
        title={content.title}
      />
      <UserDirectoryTable
        actions={tableActions}
        callerAdminType={callerAdminType}
        callerUid={callerUid}
        data={data}
        error={error}
        loading={loading}
        pagination={pagination}
        searchPlaceholder={`Search ${content.title.toLowerCase()}`}
        section={section}
      />
    </div>
  );
}
