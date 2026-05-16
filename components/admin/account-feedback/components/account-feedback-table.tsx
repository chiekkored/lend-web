"use client";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import type { AccountFeedback } from "@/lib/admin-account-feedback";

import { useAccountFeedbackColumns } from "./account-feedback-columns";

type AccountFeedbackTableProps = {
  data: AccountFeedback[];
  error: string | null;
  loading: boolean;
};

export function AccountFeedbackTable({
  data,
  error,
  loading,
}: AccountFeedbackTableProps) {
  const columns = useAccountFeedbackColumns();

  return (
    <AdminDataTable
      columns={columns}
      data={data}
      emptyMessage="No account feedback has been submitted."
      error={error}
      loading={loading}
      primaryColumnId="feedback"
      searchPlaceholder="Search account feedback"
      storageKey="admin:account-feedback:column-visibility"
    />
  );
}
