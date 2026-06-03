"use client";

import * as React from "react";
import Image from "next/image";
import { MessageSquareText } from "lucide-react";

import { UserSupportChatSheet } from "@/components/admin/users/components/user-support-chat-sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { getUserDisplayName } from "@/lib/admin-users";

import {
  formatDeactivationDate,
  type ListingDeactivationBookingSummary,
  type ListingDeactivationRequest,
} from "../data/deactivation-request-queries";
import { useDeactivationRequestDetails } from "../hooks/use-deactivation-request-details";
import { useDeactivationRequestReview } from "../hooks/use-deactivation-request-review";

type ReviewDecision = "approve" | "reject";

type DeactivationRequestViewSheetProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  request: ListingDeactivationRequest | null;
};

export function DeactivationRequestViewSheet({
  onOpenChange,
  open,
  request,
}: DeactivationRequestViewSheetProps) {
  const [reviewDecision, setReviewDecision] =
    React.useState<ReviewDecision | null>(null);
  const [reviewNotes, setReviewNotes] = React.useState("");
  const [supportChatOpen, setSupportChatOpen] = React.useState(false);
  const {
    bookings,
    bookingsLoading,
    evidenceLoading,
    evidenceUrls,
    owner,
    ownerLoading,
  } = useDeactivationRequestDetails({ open, request });
  const { error, review, submitting } = useDeactivationRequestReview();

  React.useEffect(() => {
    setReviewDecision(null);
    setReviewNotes("");
    setSupportChatOpen(false);
  }, [request?.id]);

  function openReviewDialog(decision: ReviewDecision) {
    setReviewNotes("");
    setReviewDecision(decision);
  }

  async function onReview() {
    if (!request || !reviewDecision) return;
    const success = await review({
      adminNotes: reviewNotes,
      decision: reviewDecision,
      requestId: request.id,
    });
    if (success) {
      setReviewDecision(null);
      onOpenChange(false);
    }
  }

  const isPending = request?.status === "Pending";
  const ownerLabel = ownerLoading
    ? "Loading..."
    : owner
      ? getUserDisplayName(owner)
      : request?.ownerId ?? "Not set";
  const bookingCount = bookingsLoading
    ? (request?.bookingSummaries.length ?? 0)
    : bookings.length;

  return (
    <>
      <Sheet onOpenChange={onOpenChange} open={open}>
        <SheetContent className="w-full gap-0 p-0 sm:max-w-3xl">
          {request ? (
            <>
              <SheetHeader className="border-b px-6 pb-5 pr-12 pt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <SheetTitle className="truncate">
                      {request.listingSnapshot.title ?? "Deactivation request"}
                    </SheetTitle>
                    <SheetDescription className="truncate">
                      {request.assetId}
                    </SheetDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{request.status}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDeactivationDate(request.createdAt)}
                    </span>
                  </div>
                </div>
              </SheetHeader>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <div className="space-y-6">
                  <section className="grid gap-3 rounded-md border p-4 sm:grid-cols-2">
                    <SummaryItem label="Listing ID" value={request.assetId} />
                    <SummaryItem label="Owner" value={ownerLabel} />
                    <SummaryItem
                      label="Reason"
                      value={request.reason ?? "Not set"}
                    />
                    <SummaryItem
                      label="Upcoming bookings"
                      value={`${bookingCount}`}
                    />
                    <div className="sm:col-span-2">
                      <Button
                        disabled={!owner}
                        onClick={() => setSupportChatOpen(true)}
                        type="button"
                        variant="outline"
                      >
                        <MessageSquareText className="mr-2 size-4" />
                        Open support chat
                      </Button>
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h3 className="text-sm font-medium">Owner notes</h3>
                    <p className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                      {request.notes ?? "No notes provided."}
                    </p>
                  </section>

                  <Separator />

                  <section className="space-y-3">
                    <h3 className="font-medium">Upcoming bookings</h3>
                    {bookingsLoading ? (
                      <p className="text-sm text-muted-foreground">
                        Loading bookings...
                      </p>
                    ) : bookings.length ? (
                      <div className="overflow-hidden rounded-md border">
                        {bookings.map((booking) => (
                          <BookingRow
                            booking={booking}
                            key={
                              booking.bookingId ??
                              `${booking.renterId}-${booking.startDate}`
                            }
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No upcoming blocking bookings found.
                      </p>
                    )}
                  </section>

                  <Separator />

                  <section className="space-y-3">
                    <h3 className="font-medium">Evidence photos</h3>
                    {evidenceLoading ? (
                      <p className="text-sm text-muted-foreground">
                        Loading evidence...
                      </p>
                    ) : evidenceUrls.length ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {evidenceUrls.map((url) => (
                          <div
                            className="relative aspect-[4/3] overflow-hidden rounded-md border"
                            key={url}
                          >
                            <Image
                              alt="Deactivation evidence"
                              className="object-cover"
                              fill
                              sizes="(min-width: 640px) 220px, 45vw"
                              src={url}
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No evidence photos available.
                      </p>
                    )}
                  </section>
                </div>
              </div>

              <SheetFooter className="mt-0 border-t bg-background px-6 py-4">
                <Button
                  disabled={!isPending || submitting}
                  onClick={() => openReviewDialog("reject")}
                  type="button"
                  variant="outline"
                >
                  Reject
                </Button>
                <Button
                  disabled={!isPending || submitting}
                  onClick={() => openReviewDialog("approve")}
                  type="button"
                >
                  Approve and cancel bookings
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
      {request ? (
        <DeactivationReviewDialog
          decision={reviewDecision}
          error={error}
          notes={reviewNotes}
          onConfirm={onReview}
          onNotesChange={setReviewNotes}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setReviewDecision(null);
          }}
          request={request}
          submitting={submitting}
        />
      ) : null}
      {owner ? (
        <UserSupportChatSheet
          onOpenChange={setSupportChatOpen}
          open={supportChatOpen}
          user={owner}
        />
      ) : null}
    </>
  );
}

function DeactivationReviewDialog({
  decision,
  error,
  notes,
  onConfirm,
  onNotesChange,
  onOpenChange,
  request,
  submitting,
}: {
  decision: ReviewDecision | null;
  error: string | null;
  notes: string;
  onConfirm: () => void;
  onNotesChange: (notes: string) => void;
  onOpenChange: (open: boolean) => void;
  request: ListingDeactivationRequest;
  submitting: boolean;
}) {
  const approving = decision === "approve";
  const open = decision != null;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {approving ? "Approve deactivation" : "Reject deactivation"}
          </DialogTitle>
          <DialogDescription>
            {approving
              ? "This archives the listing, cancels upcoming bookings, and starts full refund handling for renters."
              : "This rejects the owner request without cancelling upcoming bookings."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md border p-4 text-sm">
            <p className="font-medium">
              {request.listingSnapshot.title ?? request.assetId}
            </p>
            <p className="mt-1 text-muted-foreground">Request: {request.id}</p>
            <p className="mt-1 text-muted-foreground">
              Reason: {request.reason ?? "Not set"}
            </p>
          </div>
          <Textarea
            onChange={(event) => onNotesChange(event.target.value)}
            placeholder="Review notes"
            value={notes}
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={submitting} type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={submitting}
            onClick={onConfirm}
            type="button"
            variant={approving ? "default" : "destructive"}
          >
            {approving ? "Approve and cancel bookings" : "Reject request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-sm font-medium">{value}</div>
    </div>
  );
}

function BookingRow({ booking }: { booking: ListingDeactivationBookingSummary }) {
  return (
    <div className="border-b p-3 text-sm last:border-b-0">
      <div className="grid gap-3 md:grid-cols-[1.3fr_1fr_auto] md:items-start">
        <div className="min-w-0">
          <div className="truncate font-medium">
            {booking.renterName ?? booking.renterId ?? "No renter"}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {booking.bookingId ?? "No booking ID"}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          <div>
            {formatDeactivationDate(booking.startDate)} -{" "}
            {formatDeactivationDate(booking.endDate)}
          </div>
          <div>
            {formatMoney(booking.totalPrice)} · Refund:{" "}
            {booking.refundStatus ?? "Not started"}
          </div>
        </div>
        <Badge className="w-fit" variant="outline">
          {booking.status ?? "Unknown"}
        </Badge>
      </div>
    </div>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}
