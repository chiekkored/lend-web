"use client";

import * as React from "react";

import { getAiReviewQueueColumns } from "./components/ai-review-queue-columns";
import { AiReviewQueueReviewSheet } from "./components/ai-review-queue-review-sheet";
import { AiReviewQueueTable } from "./components/ai-review-queue-table";
import type { AiReviewQueueItem } from "./data/ai-review-queue-queries";
import { useAiReviewQueue } from "./hooks/use-ai-review-queue";

export function ListingAiReviewQueuePage() {
  const { data, error, loading, pagination } = useAiReviewQueue();
  const [selected, setSelected] = React.useState<AiReviewQueueItem | null>(null);
  const columns = React.useMemo(
    () => getAiReviewQueueColumns({ onOpen: setSelected }),
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
        pagination={pagination}
      />
      <AiReviewQueueReviewSheet
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        open={selected != null}
        review={selected}
      />
    </div>
  );
}
