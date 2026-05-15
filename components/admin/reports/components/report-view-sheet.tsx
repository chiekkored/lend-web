"use client";

import * as React from "react";
import { Box, CalendarClock, MessageSquareText, UserRound } from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  formatReportDate,
  type AdminReport,
} from "@/lib/admin-reports";

import {
  ReportAssetSheet,
  ReportBookingSheet,
  ReportChatSheet,
  ReportUserSheet,
} from "./report-linked-sheets";

type ReportViewSheetProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  report: AdminReport;
};

type DetailSheet = "reporter" | "reportedUser" | "chat" | "booking" | "asset" | null;

export function ReportViewSheet({
  onOpenChange,
  open,
  report,
}: ReportViewSheetProps) {
  const [detailSheet, setDetailSheet] = React.useState<DetailSheet>(null);

  React.useEffect(() => {
    if (!open) {
      setDetailSheet(null);
    }
  }, [open]);

  return (
    <>
      <Sheet onOpenChange={onOpenChange} open={open}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader className="pr-12">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <SheetTitle>{report.reason ?? "Report details"}</SheetTitle>
                <SheetDescription>{report.id}</SheetDescription>
              </div>
              <StatusBadge value={report.status} />
            </div>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-5 overflow-y-auto overflow-x-hidden px-4 pb-4">
            <Section title="Report">
              <DetailRow label="Type" value={report.reportType ?? "Not set"} />
              <DetailRow label="Reason" value={report.reason ?? "Not set"} />
              <DetailRow
                label="Details"
                value={report.details ?? "No details provided"}
              />
              <DetailRow label="Created" value={formatReportDate(report.createdAt)} />
              <DetailRow
                label="Original status"
                value={report.rawStatus ?? report.status}
              />
            </Section>

            <Section title="People">
              <LinkedButton
                disabled={!report.reporterId}
                icon={<UserRound className="size-4" />}
                label="Reporter"
                onClick={() => setDetailSheet("reporter")}
                value={report.reporterId}
              />
              <LinkedButton
                disabled={!report.reportedUserId}
                icon={<UserRound className="size-4" />}
                label="Reported user"
                onClick={() => setDetailSheet("reportedUser")}
                value={report.reportedUserId}
              />
            </Section>

            <Section title="Linked records">
              <LinkedButton
                disabled={!report.chatId}
                icon={<MessageSquareText className="size-4" />}
                label="Chat"
                onClick={() => setDetailSheet("chat")}
                value={report.chatId}
              />
              <LinkedButton
                disabled={!report.bookingId}
                icon={<CalendarClock className="size-4" />}
                label="Booking"
                onClick={() => setDetailSheet("booking")}
                value={report.bookingId}
              />
              <LinkedButton
                disabled={!report.assetId}
                icon={<Box className="size-4" />}
                label="Asset"
                onClick={() => setDetailSheet("asset")}
                value={report.assetId}
              />
            </Section>

            <Section title="Requested actions">
              <DetailRow
                label="Archive chat"
                value={report.archiveRequested ? "Requested" : "No"}
              />
              <DetailRow
                label="Cancel booking"
                value={report.bookingCancelRequested ? "Requested" : "No"}
              />
            </Section>
          </div>
        </SheetContent>
      </Sheet>

      <ReportUserSheet
        onOpenChange={(nextOpen) => setDetailSheet(nextOpen ? "reporter" : null)}
        open={detailSheet === "reporter"}
        role="Reporter"
        uid={report.reporterId}
      />
      <ReportUserSheet
        onOpenChange={(nextOpen) => setDetailSheet(nextOpen ? "reportedUser" : null)}
        open={detailSheet === "reportedUser"}
        role="Reported user"
        uid={report.reportedUserId}
      />
      <ReportChatSheet
        chatId={report.chatId}
        onOpenChange={(nextOpen) => setDetailSheet(nextOpen ? "chat" : null)}
        open={detailSheet === "chat"}
      />
      <ReportBookingSheet
        assetId={report.assetId}
        bookingId={report.bookingId}
        onOpenChange={(nextOpen) => setDetailSheet(nextOpen ? "booking" : null)}
        open={detailSheet === "booking"}
      />
      <ReportAssetSheet
        assetId={report.assetId}
        onOpenChange={(nextOpen) => setDetailSheet(nextOpen ? "asset" : null)}
        open={detailSheet === "asset"}
      />
    </>
  );
}

function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="grid min-w-0 gap-3 rounded-md border p-4 text-sm">
      <h3 className="font-medium">{title}</h3>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 text-right [overflow-wrap:anywhere]">
        {value}
      </span>
    </div>
  );
}

function LinkedButton({
  disabled,
  icon,
  label,
  onClick,
  value,
}: {
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  value: string | null;
}) {
  return (
    <Button
      className="h-auto min-w-0 justify-between gap-3 px-3 py-2"
      disabled={disabled}
      onClick={onClick}
      type="button"
      variant="outline"
    >
      <span className="flex min-w-0 items-center gap-2">
        {icon}
        <span className="shrink-0">{label}</span>
      </span>
      <span className="min-w-0 truncate text-muted-foreground">
        {value ?? "Not linked"}
      </span>
    </Button>
  );
}
