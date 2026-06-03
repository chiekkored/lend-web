"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import type { ListingReviewSubmission } from "@/components/admin/listing-reviews/data/listing-review-queries";

type AiReviewQueueTableProps = {
  columns: ColumnDef<ListingReviewSubmission>[];
  data: ListingReviewSubmission[];
  error: string | null;
  loading: boolean;
};

export function AiReviewQueueTable({
  columns,
  data,
  error,
  loading,
}: AiReviewQueueTableProps) {
  return (
    <AdminDataTable
      columns={columns}
      data={data}
      emptyMessage="No listing submissions need review."
      error={error}
      loading={loading}
      primaryColumnId="title"
      searchPlaceholder="Search listing reviews"
      storageKey="admin-listing-ai-review-queue-table"
    />
  );
}
