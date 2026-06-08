"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import type { AdminDataTablePaginationProps } from "@/components/admin/admin-data-table";

import type { AiReviewQueueItem } from "../data/ai-review-queue-queries";

type AiReviewQueueTableProps = {
  columns: ColumnDef<AiReviewQueueItem>[];
  data: AiReviewQueueItem[];
  error: string | null;
  loading: boolean;
  pagination: AdminDataTablePaginationProps;
};

export function AiReviewQueueTable({
  columns,
  data,
  error,
  loading,
  pagination,
}: AiReviewQueueTableProps) {
  return (
    <AdminDataTable
      columns={columns}
      data={data}
      emptyMessage="No listing submissions need review."
      error={error}
      loading={loading}
      pagination={pagination}
      primaryColumnId="title"
      searchPlaceholder="Search listing reviews"
      storageKey="admin-listing-ai-review-queue-table"
    />
  );
}
