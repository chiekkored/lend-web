"use client";

import * as React from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  reportStatuses,
  type AdminReport,
  type ReportStatus,
} from "@/lib/admin-reports";

import { useReportMutation } from "../hooks/use-report-mutation";

type ReportStatusSheetProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  report: AdminReport;
};

export function ReportStatusSheet({
  onOpenChange,
  open,
  report,
}: ReportStatusSheetProps) {
  const [status, setStatus] = React.useState<ReportStatus>(report.status);
  const { error, resetError, submitting, updateStatus } =
    useReportMutation(report);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setStatus(report.status);
    resetError();
  }, [open, report.status, resetError]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const success = await updateStatus(status);
    if (success) {
      onOpenChange(false);
    }
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Update report status</SheetTitle>
          <SheetDescription>{report.id}</SheetDescription>
        </SheetHeader>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit}>
          <div className="grid flex-1 auto-rows-min gap-5 overflow-y-auto px-4">
            <Select
              onValueChange={(value) => setStatus(value as ReportStatus)}
              value={status}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportStatuses.map((reportStatus) => (
                  <SelectItem key={reportStatus} value={reportStatus}>
                    {reportStatus}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error ? (
              <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}
          </div>
          <SheetFooter>
            <Button disabled={submitting || status === report.status} type="submit">
              {submitting ? <Loader2 className="animate-spin" /> : null}
              Save status
            </Button>
            <SheetClose asChild>
              <Button disabled={submitting} type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
