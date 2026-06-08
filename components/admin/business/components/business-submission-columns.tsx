"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";

import {
  buildBusinessSubmissionSearchText,
  formatBusinessSubmissionDate,
  type BusinessSubmissionItem,
} from "../data/business-submission-queries";

export function getBusinessSubmissionColumns({
  onOpen,
}: {
  onOpen: (submission: BusinessSubmissionItem) => void;
}): ColumnDef<BusinessSubmissionItem>[] {
  return [
    {
      id: "search",
      accessorFn: buildBusinessSubmissionSearchText,
      enableHiding: true,
      header: "Search",
      cell: () => null,
    },
    {
      id: "ownerId",
      accessorFn: (submission) => submission.ownerId,
      header: "Owner",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.ownerId}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.requestedListingReviewSubmissionId
              ? `Listing-linked: ${row.original.requestedListingReviewSubmissionId}`
              : "Standalone submission"}
          </p>
        </div>
      ),
    },
    {
      id: "status",
      accessorFn: (submission) => submission.status,
      header: "Status",
      cell: ({ row }) => <StatusBadge value={row.original.status} />,
    },
    {
      id: "documents",
      accessorFn: (submission) =>
        [
          rowValue(submission.documents.dti),
          rowValue(submission.documents.bir),
          rowValue(submission.documents.mayorBusinessPermit),
        ].join(" "),
      header: "Documents",
      cell: ({ row }) => {
        const hasMayorPermit = Boolean(row.original.documents.mayorBusinessPermit);
        return (
          <span className="text-sm text-muted-foreground">
            DTI, BIR{hasMayorPermit ? ", Permit" : ""}
          </span>
        );
      },
    },
    {
      id: "submittedAt",
      accessorFn: (submission) => submission.submittedAt?.getTime() ?? 0,
      header: "Submitted",
      cell: ({ row }) => formatBusinessSubmissionDate(row.original.submittedAt),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button onClick={() => onOpen(row.original)} size="sm" type="button" variant="outline">
          Review
        </Button>
      ),
    },
  ];
}

function rowValue(value: string | null) {
  return value ?? "";
}
