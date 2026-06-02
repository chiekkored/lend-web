"use client";

import * as React from "react";
import { Check, X } from "lucide-react";

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

import type { ListingReviewSubmission } from "../data/listing-review-queries";
import { useListingReviewMutation } from "../hooks/use-listing-review-mutation";

type ListingReviewSheetProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  review: ListingReviewSubmission | null;
};

export function ListingReviewSheet({
  onOpenChange,
  open,
  review,
}: ListingReviewSheetProps) {
  const [notes, setNotes] = React.useState("");
  const { approve, error, reject, resetError, submitting } =
    useListingReviewMutation();

  React.useEffect(() => {
    if (open) {
      setNotes("");
      resetError();
    }
  }, [open, resetError]);

  if (!review) return null;

  async function submit(decision: "approve" | "reject") {
    if (!review) return;
    const success =
      decision === "approve"
        ? await approve(review.id, notes)
        : await reject(review.id, notes);
    if (success) onOpenChange(false);
  }

  const images = [...review.listing.images, ...review.listing.showcase];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{review.listing.title ?? review.id}</SheetTitle>
          <SheetDescription>
            {review.submissionType} submission from {review.ownerId}
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-5 overflow-y-auto px-4 pb-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={review.aiReview.decision ?? "manual_review"} />
            <StatusBadge value={review.aiReview.severity ?? "unknown"} />
            {review.aiReview.categories.map((category) => (
              <StatusBadge key={category} value={category} />
            ))}
          </div>

          <section className="grid gap-2">
            <h3 className="font-medium">AI reasons</h3>
            {review.aiReview.reasons.length ? (
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {review.aiReview.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No reasons provided.</p>
            )}
          </section>

          <section className="grid gap-2">
            <h3 className="font-medium">Listing data</h3>
            <dl className="grid gap-2 rounded-md border p-3">
              <InfoRow label="Category" value={review.listing.category} />
              <InfoRow
                label="Description"
                value={review.listing.description}
              />
              <InfoRow
                label="Daily rate"
                value={formatRate(review.listing.rates)}
              />
              <InfoRow
                label="Inclusions"
                value={review.listing.inclusions.join(", ") || null}
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
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
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
    <img
      alt=""
      className="aspect-square rounded-md border object-cover"
      src={url}
    />
  );
}
