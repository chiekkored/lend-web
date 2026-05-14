"use client";

import { StatusBadge } from "@/components/admin/status-badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminListing } from "@/lib/admin-listings";

import type { ListingAudit } from "../data/listing-audit-queries";
import { useListingAudits } from "../hooks/use-listing-audits";

type ListingAuditHistorySheetProps = {
  listing: AdminListing;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function ListingAuditHistorySheet({
  listing,
  onOpenChange,
  open,
}: ListingAuditHistorySheetProps) {
  const { data, error, loading } = useListingAudits(listing.id, open);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Audit History</SheetTitle>
          <SheetDescription>{listing.title ?? listing.id}</SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-3 overflow-y-auto px-4 pb-4">
          {loading ? (
            <AuditSkeleton />
          ) : error ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : data.length ? (
            data.map((audit) => <AuditRow audit={audit} key={audit.id} />)
          ) : (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              No audit history yet.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AuditRow({ audit }: { audit: ListingAudit }) {
  return (
    <div className="grid gap-3 rounded-md border p-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <StatusBadge value={audit.type} />
        <span className="text-right text-xs text-muted-foreground">
          {formatAuditDate(audit.createdAt)}
        </span>
      </div>
      <p className="whitespace-pre-wrap text-muted-foreground">{audit.notes}</p>
      <div className="text-xs text-muted-foreground">
        <p className="font-medium text-foreground">{audit.createdBy.name}</p>
        <p>{audit.createdBy.uid}</p>
      </div>
    </div>
  );
}

function AuditSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <div className="grid gap-3 rounded-md border p-4" key={index}>
          <div className="flex justify-between gap-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-36" />
        </div>
      ))}
    </>
  );
}

function formatAuditDate(value: Date | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}
