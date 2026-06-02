"use client";

import * as React from "react";

import { AdminDataTable } from "@/components/admin/admin-data-table";

import type { ListingReviewSubmission } from "./data/listing-review-queries";
import { ListingReviewSheet } from "./components/listing-review-sheet";
import { getListingReviewColumns } from "./components/listing-review-columns";
import { useListingReviews } from "./hooks/use-listing-reviews";

export function ListingReviewsPage() {
  const { data, error, loading } = useListingReviews();
  const [selected, setSelected] =
    React.useState<ListingReviewSubmission | null>(null);
  const columns = React.useMemo(
    () =>
      getListingReviewColumns({
        onOpen: setSelected,
      }),
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">
          Listing review queue
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Review AI-flagged listing submissions before they become public.
        </p>
      </div>

      <AdminDataTable
        columns={columns}
        data={data}
        emptyMessage="No listing submissions need review."
        error={error}
        loading={loading}
        primaryColumnId="title"
        searchPlaceholder="Search listing reviews"
        storageKey="admin-listing-review-table"
      />
      <ListingReviewSheet
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        open={selected != null}
        review={selected}
      />
    </div>
  );
}
