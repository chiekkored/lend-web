"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import {
  buildAccountFeedbackSearchText,
  formatAccountFeedbackAction,
  formatAccountFeedbackDate,
  type AccountFeedback,
} from "@/lib/admin-account-feedback";

export function useAccountFeedbackColumns() {
  return React.useMemo<ColumnDef<AccountFeedback>[]>(
    () => [
      {
        id: "feedback",
        accessorFn: buildAccountFeedbackSearchText,
        header: "Feedback",
        cell: ({ row }) => (
          <div className="min-w-44">
            <p className="truncate font-medium">{row.original.id}</p>
            <p className="truncate text-xs text-muted-foreground">
              {formatAccountFeedbackAction(row.original.action)}
            </p>
          </div>
        ),
      },
      {
        id: "action",
        accessorFn: (feedback) => formatAccountFeedbackAction(feedback.action),
        header: "Action",
        cell: ({ row }) => (
          <div className="min-w-24">
            {formatAccountFeedbackAction(row.original.action)}
          </div>
        ),
      },
      {
        id: "reason",
        accessorFn: (feedback) => feedback.reason ?? "",
        header: "Reason",
        cell: ({ row }) => (
          <div className="min-w-56 max-w-80 truncate">
            {row.original.reason ?? "Not set"}
          </div>
        ),
      },
      {
        id: "comments",
        accessorFn: (feedback) => feedback.feedback ?? "",
        header: "Optional Feedback",
        cell: ({ row }) => (
          <div className="min-w-72 max-w-[28rem] whitespace-normal text-sm">
            {row.original.feedback ?? (
              <span className="text-muted-foreground">No feedback</span>
            )}
          </div>
        ),
      },
      {
        id: "createdAt",
        accessorFn: (feedback) => feedback.createdAt?.getTime() ?? 0,
        header: "Created",
        cell: ({ row }) => formatAccountFeedbackDate(row.original.createdAt),
      },
    ],
    [],
  );
}
