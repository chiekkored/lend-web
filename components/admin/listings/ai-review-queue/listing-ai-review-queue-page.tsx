"use client";

import * as React from "react";

import { getListingReviewColumns } from "@/components/admin/listing-reviews/components/listing-review-columns";
import { ListingReviewSheet } from "@/components/admin/listing-reviews/components/listing-review-sheet";
import type { ListingReviewSubmission } from "@/components/admin/listing-reviews/data/listing-review-queries";

import { AiReviewQueueTable } from "./components/ai-review-queue-table";
import { useAiReviewQueue } from "./hooks/use-ai-review-queue";

export function ListingAiReviewQueuePage() {
  const { data, error, loading } = useAiReviewQueue();
  const [selected, setSelected] =
    React.useState<ListingReviewSubmission | null>(null);
  const columns = React.useMemo(
    () => getListingReviewColumns({ onOpen: setSelected }),
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

      <AiReviewQueueTable
        columns={columns}
        data={data}
        error={error}
        loading={loading}
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
