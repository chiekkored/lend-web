"use client";

import * as React from "react";
import { Eye, MoreVerticalIcon, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminReport } from "@/lib/admin-reports";

import { ReportStatusSheet } from "./report-status-sheet";
import { ReportViewSheet } from "./report-view-sheet";

type ReportRowActionsProps = {
  report: AdminReport;
};

export function ReportRowActions({ report }: ReportRowActionsProps) {
  const [viewOpen, setViewOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);

  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Open report actions" size="icon" variant="ghost">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setViewOpen(true);
            }}
          >
            <Eye />
            View
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setStatusOpen(true);
            }}
          >
            <RefreshCcw />
            Update status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ReportViewSheet
        onOpenChange={setViewOpen}
        open={viewOpen}
        report={report}
      />
      <ReportStatusSheet
        onOpenChange={setStatusOpen}
        open={statusOpen}
        report={report}
      />
    </div>
  );
}
