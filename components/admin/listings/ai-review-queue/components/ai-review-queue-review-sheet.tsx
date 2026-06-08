"use client";

import * as React from "react";
import { Check, FileText, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/admin/status-badge";
import { getFirebaseStorage } from "@/lib/firebase";
import { getDownloadURL, ref } from "firebase/storage";

import type { AiReviewQueueItem } from "../data/ai-review-queue-queries";
import { useAiReviewQueueMutation } from "../hooks/use-ai-review-queue-mutation";

type AiReviewQueueReviewSheetProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  review: AiReviewQueueItem | null;
};

export function AiReviewQueueReviewSheet({
  onOpenChange,
  open,
  review,
}: AiReviewQueueReviewSheetProps) {
  const [notes, setNotes] = React.useState("");
  const {
    approve,
    error,
    reject,
    requestComplianceDocuments,
    resetError,
    submitting,
  } = useAiReviewQueueMutation();

  React.useEffect(() => {
    if (open) {
      setNotes("");
      resetError();
    }
  }, [open, resetError]);

  if (!review) return null;
  const currentReview = review;

  async function submit(decision: "approve" | "reject") {
    const success =
      decision === "approve"
        ? await approve(currentReview.id, notes)
        : await reject(currentReview.id, notes);
    if (success) onOpenChange(false);
  }

  async function requestDocuments() {
    await requestComplianceDocuments(currentReview.id);
  }

  const images = [...currentReview.listing.images, ...currentReview.listing.showcase];
  const complianceRequestStatus =
    currentReview.businessRegistrationRequest?.status ?? "Not requested";
  const complianceRequestSent =
    currentReview.businessRegistrationRequest?.status === "Required" ||
    currentReview.businessRegistrationRequest?.status === "Submitted";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{currentReview.listing.title ?? currentReview.id}</SheetTitle>
          <SheetDescription>
            {currentReview.submissionType} submission from {currentReview.ownerId}
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-5 overflow-y-auto px-4 pb-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={currentReview.aiReview.decision ?? "manual_review"} />
            <StatusBadge value={currentReview.aiReview.severity ?? "unknown"} />
            {currentReview.aiReview.categories.map((category) => (
              <StatusBadge key={category} value={category} />
            ))}
          </div>

          <section className="grid gap-2">
            <h3 className="font-medium">AI reasons</h3>
            {currentReview.aiReview.reasons.length ? (
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {currentReview.aiReview.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No reasons provided.</p>
            )}
          </section>

          {currentReview.ownerComplianceRisk?.triggered ? (
            <section className="grid gap-2">
              <h3 className="font-medium">Owner compliance risk</h3>
              <div className="grid gap-3 rounded-md border p-3">
                {currentReview.ownerComplianceRisk.reasons.length ? (
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    {currentReview.ownerComplianceRisk.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    This owner may need permit, tax, licensing, insurance,
                    property, transport, LGU, or other compliance document
                    review.
                  </p>
                )}
                <dl className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(currentReview.ownerComplianceRisk.metrics).map(
                    ([key, value]) => (
                      <InfoRow
                        key={key}
                        label={formatMetricLabel(key)}
                        value={formatMetricValue(value)}
                      />
                    ),
                  )}
                </dl>
                <div className="grid gap-2 border-t pt-3">
                  <InfoRow
                    label="Business registration request"
                    value={
                      currentReview.businessRegistrationRequest?.requestedAt
                        ? `${complianceRequestStatus} on ${formatRequestDate(
                            currentReview.businessRegistrationRequest.requestedAt,
                          )}`
                        : complianceRequestStatus
                    }
                  />
                  <Button
                    disabled={submitting || complianceRequestSent}
                    onClick={requestDocuments}
                    type="button"
                    variant="default"
                  >
                    <FileText className="mr-2 size-4" />
                    Request compliance documents
                  </Button>
                </div>
              </div>
            </section>
          ) : null}

          <section className="grid gap-2">
            <h3 className="font-medium">Listing data</h3>
            <dl className="grid gap-2 rounded-md border p-3">
              <InfoRow label="Category" value={currentReview.listing.categoryName} />
              <InfoRow
                label="Description"
                value={currentReview.listing.description}
              />
              <InfoRow
                label="Daily rate"
                value={formatRate(currentReview.listing.rates)}
              />
              <InfoRow
                label="Inclusions"
                value={currentReview.listing.inclusions.join(", ") || null}
              />
            </dl>
          </section>

          {images.length ? (
            <section className="grid gap-2">
              <h3 className="font-medium">Images</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {images.map((image) => (
                  <ReviewImage key={image} src={image} />
                ))}
              </div>
            </section>
          ) : null}

          <section className="grid gap-2">
            <h3 className="font-medium">Policy notes</h3>
            <Textarea
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add admin decision notes"
              value={notes}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </section>

          <div className="flex flex-wrap gap-2">
            <Button
              disabled={submitting}
              onClick={() => submit("approve")}
              type="button"
            >
              <Check className="mr-2 size-4" />
              Approve
            </Button>
            <Button
              disabled={submitting}
              onClick={() => submit("reject")}
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
      <dt className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="whitespace-pre-wrap">{value ?? "Not set"}</dd>
    </div>
  );
}

function formatRate(rates: Record<string, unknown> | null) {
  const daily = rates?.daily;
  const currency = typeof rates?.currency === "string" ? rates.currency : "PHP";
  return typeof daily === "number" ? `${currency} ${daily}` : null;
}

function formatMetricLabel(value: string) {
  return value
    .replace(/30d/g, "30d")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function formatMetricValue(value: unknown) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-PH", {
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return "Not set";
}

function formatRequestDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function ReviewImage({ src }: { src: string }) {
  const [url, setUrl] = React.useState(() =>
    src.startsWith("https://") ? src : null,
  );

  React.useEffect(() => {
    let cancelled = false;
    if (src.startsWith("https://")) {
      setUrl(src);
      return;
    }

    getDownloadURL(ref(getFirebaseStorage(), src))
      .then((downloadUrl) => {
        if (!cancelled) setUrl(downloadUrl);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!url) {
    return <div className="aspect-square rounded-md border bg-muted" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt="" className="aspect-square rounded-md border object-cover" src={url} />
  );
}
