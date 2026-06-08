"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Download, X } from "lucide-react";
import { getDownloadURL, ref } from "firebase/storage";

import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { getFirebaseStorage } from "@/lib/firebase";

import {
  businessSubmissionQueryKeys,
  fetchBusinessSubmissionOwner,
  formatBusinessSubmissionDate,
  type BusinessSubmissionItem,
} from "../data/business-submission-queries";
import { useBusinessSubmissionMutation } from "../hooks/use-business-submission-mutation";

type BusinessSubmissionReviewSheetProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  submission: BusinessSubmissionItem | null;
};

export function BusinessSubmissionReviewSheet({
  onOpenChange,
  open,
  submission,
}: BusinessSubmissionReviewSheetProps) {
  const [businessName, setBusinessName] = React.useState("");
  const [businessType, setBusinessType] = React.useState("");
  const [businessAddress, setBusinessAddress] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const { approve, error, reject, resetError, submitting } = useBusinessSubmissionMutation();
  const ownerQuery = useQuery({
    enabled: open && submission != null,
    queryFn: () => fetchBusinessSubmissionOwner(submission?.ownerId ?? ""),
    queryKey: businessSubmissionQueryKeys.owner(submission?.ownerId),
    staleTime: 60_000,
  });

  React.useEffect(() => {
    if (!open || !submission) return;
    setBusinessName(submission.businessName ?? "");
    setBusinessType(submission.businessType ?? "");
    setBusinessAddress(submission.businessAddress ?? "");
    setNotes(submission.reviewNotes ?? "");
    resetError();
  }, [open, resetError, submission]);

  if (!submission) return null;
  const currentSubmission = submission;

  const owner = ownerQuery.data;
  const currentSummary = owner?.businessRegistration;

  async function approveSubmission() {
    const success = await approve({
      businessAddress,
      businessName,
      businessType,
      notes,
      ownerId: currentSubmission.ownerId,
    });
    if (success) onOpenChange(false);
  }

  async function rejectSubmission() {
    const success = await reject({
      notes,
      ownerId: currentSubmission.ownerId,
    });
    if (success) onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{owner?.displayName ?? currentSubmission.ownerId}</SheetTitle>
          <SheetDescription>
            Business registration submission from {owner?.email ?? currentSubmission.ownerId}
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-5 overflow-y-auto px-4 pb-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={currentSubmission.status} />
            {currentSubmission.requestedListingReviewSubmissionId ? (
              <StatusBadge value="listing_linked" />
            ) : (
              <StatusBadge value="standalone" />
            )}
          </div>

          <section className="grid gap-2">
            <h3 className="font-medium">Submission</h3>
            <dl className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
              <InfoRow label="Owner ID" value={currentSubmission.ownerId} />
              <InfoRow
                label="Submitted"
                value={formatBusinessSubmissionDate(currentSubmission.submittedAt)}
              />
              <InfoRow
                label="Linked listing review"
                value={currentSubmission.requestedListingReviewSubmissionId}
              />
              <InfoRow
                label="Tax acknowledgement"
                value={currentSubmission.taxInvoiceAcknowledged ? "Yes" : "No"}
              />
            </dl>
          </section>

          <section className="grid gap-2">
            <h3 className="font-medium">Documents</h3>
            <div className="grid gap-3 rounded-md border p-3">
              <DocumentLink label="DTI registration" path={currentSubmission.documents.dti} />
              <DocumentLink label="BIR registration" path={currentSubmission.documents.bir} />
              <DocumentLink
                label="Mayor/Business Permit"
                path={currentSubmission.documents.mayorBusinessPermit}
              />
            </div>
          </section>

          <section className="grid gap-2">
            <h3 className="font-medium">Current user summary</h3>
            <dl className="grid gap-2 rounded-md border p-3 sm:grid-cols-2">
              <InfoRow label="Status" value={currentSummary?.status ?? "Not set"} />
              <InfoRow
                label="Required"
                value={currentSummary?.required ? "Yes" : "No"}
              />
              <InfoRow label="Business name" value={currentSummary?.businessName ?? null} />
              <InfoRow label="Business type" value={currentSummary?.businessType ?? null} />
              <InfoRow
                label="Business address"
                value={currentSummary?.businessAddress ?? null}
              />
              <InfoRow
                label="Linked listing review"
                value={currentSummary?.requestedListingReviewSubmissionId ?? null}
              />
            </dl>
          </section>

          <section className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="business-name">Business name</Label>
              <Input
                id="business-name"
                onChange={(event) => setBusinessName(event.target.value)}
                placeholder="Enter approved business name"
                value={businessName}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="business-type">Business type</Label>
              <Input
                id="business-type"
                onChange={(event) => setBusinessType(event.target.value)}
                placeholder="Enter approved business type"
                value={businessType}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="business-address">Business address</Label>
              <Textarea
                id="business-address"
                onChange={(event) => setBusinessAddress(event.target.value)}
                placeholder="Enter approved business address"
                value={businessAddress}
              />
            </div>
          </section>

          <section className="grid gap-2">
            <Label htmlFor="business-notes">Review notes</Label>
            <Textarea
              id="business-notes"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add admin decision notes"
              value={notes}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </section>

          <div className="flex flex-wrap gap-2">
            <Button disabled={submitting} onClick={approveSubmission} type="button">
              <Check className="mr-2 size-4" />
              Approve
            </Button>
            <Button
              disabled={submitting}
              onClick={rejectSubmission}
              type="button"
              variant="destructive"
            >
              <X className="mr-2 size-4" />
              Reject
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-wrap">{value ?? "Not set"}</dd>
    </div>
  );
}

function DocumentLink({ label, path }: { label: string; path: string | null }) {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    if (!path) {
      setUrl(null);
      return;
    }

    getDownloadURL(ref(getFirebaseStorage(), path))
      .then((downloadUrl) => {
        if (!cancelled) setUrl(downloadUrl);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
      <div className="min-w-0">
        <p className="font-medium">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{path ?? "Not provided"}</p>
      </div>
      <Button asChild disabled={!url} size="sm" variant="outline">
        <a href={url ?? "#"} rel="noreferrer" target="_blank">
          <Download className="mr-2 size-4" />
          Open
        </a>
      </Button>
    </div>
  );
}
