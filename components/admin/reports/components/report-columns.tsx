"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/admin/status-badge";
import {
  buildReportSearchText,
  formatReportDate,
  type AdminReport,
} from "@/lib/admin-reports";

import { ReportRowActions } from "./report-row-actions";

export function useReportColumns() {
  return React.useMemo<ColumnDef<AdminReport>[]>(
    () => [
      {
        id: "report",
        accessorFn: buildReportSearchText,
        header: "Report",
        cell: ({ row }) => (
          <div className="min-w-44">
            <p className="truncate font-medium">{row.original.id}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.reportType ?? "No type"}
            </p>
          </div>
        ),
      },
      {
        id: "reason",
        accessorFn: (report) => `${report.reason ?? ""} ${report.details ?? ""}`,
        header: "Reason",
        cell: ({ row }) => (
          <div className="min-w-64 max-w-80">
            <p className="truncate">{row.original.reason ?? "Not set"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.details ?? "No details"}
            </p>
          </div>
        ),
      },
      {
        id: "reporter",
        accessorFn: (report) => report.reporterId ?? "",
        header: "Reporter",
        cell: ({ row }) => (
          <div className="min-w-40 truncate">
            {row.original.reporterId ?? "Not set"}
          </div>
        ),
      },
      {
        id: "reportedUser",
        accessorFn: (report) => report.reportedUserId ?? "",
        header: "Reported User",
        cell: ({ row }) => (
          <div className="min-w-40 truncate">
            {row.original.reportedUserId ?? "Not set"}
          </div>
        ),
      },
      {
        id: "links",
        accessorFn: (report) =>
          [report.chatId, report.bookingId, report.assetId].filter(Boolean).join(" "),
        header: "Links",
        cell: ({ row }) => (
          <div className="min-w-48 text-xs">
            <p className="truncate">Chat: {row.original.chatId ?? "None"}</p>
            <p className="truncate text-muted-foreground">
              Booking: {row.original.bookingId ?? "None"}
            </p>
            <p className="truncate text-muted-foreground">
              Asset: {row.original.assetId ?? "None"}
            </p>
          </div>
        ),
      },
      {
        id: "requests",
        accessorFn: (report) =>
          `${report.archiveRequested ? "Archive" : ""} ${
            report.bookingCancelRequested ? "Cancel" : ""
          }`,
        header: "Requests",
        cell: ({ row }) => (
          <div className="min-w-32 text-xs">
            <p>{row.original.archiveRequested ? "Archive chat" : "No archive"}</p>
            <p className="text-muted-foreground">
              {row.original.bookingCancelRequested ? "Cancel booking" : "No cancel"}
            </p>
          </div>
        ),
      },
      {
        id: "status",
        accessorFn: (report) => report.status,
        header: "Status",
        cell: ({ row }) => <StatusBadge value={row.original.status} />,
      },
      {
        id: "createdAt",
        accessorFn: (report) => report.createdAt?.getTime() ?? 0,
        header: "Created",
        cell: ({ row }) => formatReportDate(row.original.createdAt),
      },
      {
        id: "actions",
        enableGlobalFilter: false,
        enableHiding: false,
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => <ReportRowActions report={row.original} />,
      },
    ],
    [],
  );
}
