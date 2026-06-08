"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";

import {
  buildAiReviewQueueSearchText,
  formatAiReviewQueueDate,
  type AiReviewQueueItem,
} from "../data/ai-review-queue-queries";

export function getAiReviewQueueColumns({
  onOpen,
}: {
  onOpen: (review: AiReviewQueueItem) => void;
}): ColumnDef<AiReviewQueueItem>[] {
  return [
    {
      id: "search",
      accessorFn: buildAiReviewQueueSearchText,
      enableHiding: true,
      header: "Search",
      cell: () => null,
    },
    {
      accessorKey: "listing.title",
      id: "title",
      header: "Listing",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">
            {row.original.listing.title ?? row.original.id}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.listing.categoryName ?? "No category"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "submissionType",
      header: "Type",
      cell: ({ row }) => <StatusBadge value={row.original.submissionType} />,
    },
    {
      accessorKey: "aiReview.severity",
      header: "Severity",
      cell: ({ row }) => (
        <StatusBadge value={row.original.aiReview.severity ?? "unknown"} />
      ),
    },
    {
      accessorKey: "ownerId",
      header: "Owner",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.ownerId}</span>
      ),
    },
    {
      accessorKey: "submittedAt",
      header: "Submitted",
      cell: ({ row }) => formatAiReviewQueueDate(row.original.submittedAt),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          onClick={() => onOpen(row.original)}
          size="sm"
          type="button"
          variant="outline"
        >
          Review
        </Button>
      ),
    },
  ];
}
