"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import type { AdminDataTablePaginationProps } from "@/components/admin/admin-data-table";

import type { BusinessSubmissionItem } from "../data/business-submission-queries";

type BusinessSubmissionTableProps = {
  columns: ColumnDef<BusinessSubmissionItem>[];
  data: BusinessSubmissionItem[];
  error: string | null;
  loading: boolean;
  pagination: AdminDataTablePaginationProps;
};

export function BusinessSubmissionTable({
  columns,
  data,
  error,
  loading,
  pagination,
}: BusinessSubmissionTableProps) {
  return (
    <AdminDataTable
      columns={columns}
      data={data}
      emptyMessage="No business submissions need review."
      error={error}
      loading={loading}
      pagination={pagination}
      primaryColumnId="ownerId"
      searchPlaceholder="Search business submissions"
      storageKey="admin-business-submissions-table"
    />
  );
}
