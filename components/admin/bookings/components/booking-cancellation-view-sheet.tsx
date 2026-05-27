"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  ReceiptText,
  RotateCcw,
  UserRound,
  XCircle,
} from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  formatBookingDateTime,
  formatBookingMoney,
  formatExactNumber,
  getBookingAssetTitle,
  getBookingOwnerId,
  getBookingOwnerName,
  getBookingRenterId,
  getBookingRenterName,
  type AdminBooking,
} from "@/lib/admin-bookings";

import { BookingCancellationReviewDialog } from "./booking-cancellation-review-dialog";
import { BookingChatSheet } from "./booking-chat-sheet";

type BookingCancellationViewSheetProps = {
  booking: AdminBooking;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function BookingCancellationViewSheet({ booking, onOpenChange, open }: BookingCancellationViewSheetProps) {
  const [chatOpen, setChatOpen] = React.useState(false);
  const [approveOpen, setApproveOpen] = React.useState(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const request = booking.cancellationRequest;
  const requestStatus = request?.status ?? "Pending";
  const isPending = requestStatus === "Pending";
  const isApproved = requestStatus === "Approved" || booking.status === "Cancelled";
  const isRejected = requestStatus === "Rejected";
  const ownerPenalty = request?.ownerPenalty ?? request?.ownerPenaltyPreview ?? null;
  const requestedByOwner = request?.requestedByRole === "owner";
  const paidAmountBreakdown = buildPaidAmountBreakdown(booking);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-2xl">
          <SheetHeader className="pr-12">
            <div className="grid gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <SheetTitle>{getBookingAssetTitle(booking)}</SheetTitle>
                  <SheetDescription className="truncate">{booking.id}</SheetDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={requestStatus} />
                  {booking.status ? <StatusBadge value={booking.status} /> : null}
                </div>
              </div>
              <CancellationOutcomeBanner
                approved={isApproved}
                pending={isPending}
                rejected={isRejected}
                requestedByRole={request?.requestedByRole}
              />
            </div>
          </SheetHeader>

          <div className="grid flex-1 auto-rows-min gap-4 overflow-y-auto overflow-x-hidden px-4 pb-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <MetricTile
                icon={<Clock3 className="size-4" />}
                label="Requested"
                value={formatBookingDateTime(request?.requestedAt ?? null)}
              />
              <MetricTile
                icon={<Clock3 className="size-4" />}
                label="Lead at request"
                value={formatRemainingLeadTime({
                  from: request?.requestedAt ?? null,
                  to: booking.startDate,
                })}
              />
              <MetricTile
                icon={<UserRound className="size-4" />}
                label="Requested by"
                value={request?.requestedByRole ?? "Not set"}
              />
              <MetricTile
                icon={<RotateCcw className="size-4" />}
                label="Restore status"
                value={request?.previousStatus ?? "Not set"}
              />
            </div>

            <FocusedSection title="Cancellation reason">
              <p className="text-sm leading-6 [overflow-wrap:anywhere]">{request?.reason ?? "Not set"}</p>
            </FocusedSection>

            <FocusedSection title="Parties">
              <div className="grid gap-3 sm:grid-cols-2">
                <PartyTile label="Owner" name={getBookingOwnerName(booking)} uid={getBookingOwnerId(booking)} />
                <PartyTile label="Renter" name={getBookingRenterName(booking)} uid={getBookingRenterId(booking)} />
              </div>
            </FocusedSection>

            <FocusedSection title="Refund handling">
              <div className="grid gap-3 sm:grid-cols-3">
                <MetricTile
                  icon={<ReceiptText className="size-4" />}
                  label="Paid amount"
                  value={formatCancellationMoney(paidAmountBreakdown.total, paidAmountBreakdown.currency)}
                />
                <MetricTile
                  icon={<ReceiptText className="size-4" />}
                  label="Refund amount"
                  value={formatBookingMoney(booking.payment?.refundAmount ?? null)}
                />
                <MetricTile
                  icon={<ReceiptText className="size-4" />}
                  label="Refund status"
                  value={request?.refundStatus ?? booking.payment?.refundStatus ?? "Not set"}
                />
              </div>
              <div className="rounded-md border bg-muted/30 p-3">
                <div className="mb-2 text-xs uppercase text-muted-foreground">Paid amount calculation</div>
                {paidAmountBreakdown.lines.length > 0 ? (
                  <div className="grid gap-2">
                    {paidAmountBreakdown.lines.map((line) => (
                      <DetailLine
                        key={line.label}
                        label={line.label}
                        value={formatCancellationMoney(line.amount, paidAmountBreakdown.currency)}
                      />
                    ))}
                    <div className="border-t pt-2">
                      <DetailLine
                        label="Paid amount"
                        value={formatCancellationMoney(paidAmountBreakdown.total, paidAmountBreakdown.currency)}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Breakdown unavailable</p>
                )}
              </div>
              {request?.refundError || booking.payment?.refundError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive [overflow-wrap:anywhere]">
                  {request?.refundError ?? booking.payment?.refundError}
                </div>
              ) : null}
            </FocusedSection>

            {requestedByOwner ? (
              <FocusedSection title={isApproved ? "Owner penalty applied" : "Owner penalty preview"}>
                <div className="grid gap-3 sm:grid-cols-4">
                  <MetricTile
                    emphasized
                    icon={<AlertTriangle className="size-4" />}
                    label="Penalty"
                    value={formatCancellationMoney(ownerPenalty?.penaltyAmount ?? null, ownerPenalty?.currency)}
                  />
                  <MetricTile label="Rate" value={formatPenaltyRate(ownerPenalty?.penaltyRate ?? null)} />
                  <MetricTile
                    label="Base payout"
                    value={formatCancellationMoney(ownerPenalty?.penaltyBaseAmount ?? null, ownerPenalty?.currency)}
                  />
                  <MetricTile
                    label="Remaining"
                    value={formatCancellationMoney(ownerPenalty?.remainingAmount ?? null, ownerPenalty?.currency)}
                  />
                </div>
                <DetailLine
                  label="Listing after approval"
                  value={ownerPenalty?.listingStatusAfterApproval ?? "Not set"}
                />
              </FocusedSection>
            ) : null}

            {isApproved || isRejected ? (
              <FocusedSection title="Review outcome">
                <div className="grid gap-3 sm:grid-cols-2">
                  <MetricTile label="Reviewed" value={formatBookingDateTime(request?.reviewedAt ?? null)} />
                  <MetricTile label="Reviewed by" value={request?.reviewedBy ?? "Not set"} />
                </div>
                <DetailLine label="Admin notes" value={request?.adminNotes ?? "Not set"} />
                <DetailLine
                  label="Chat outcome"
                  value={isRejected ? "Booking chat restored" : isApproved ? "Booking chat archived" : "Not set"}
                />
              </FocusedSection>
            ) : null}

            <FocusedSection title="Admin actions">
              <div className="grid gap-3 sm:grid-cols-3">
                <Button
                  className="justify-center"
                  disabled={!booking.chatId}
                  onClick={() => setChatOpen(true)}
                  type="button"
                  variant="outline"
                >
                  <MessageSquareText className="size-4" />
                  View chat
                </Button>
                <Button
                  className="justify-center"
                  disabled={!isPending}
                  onClick={() => setApproveOpen(true)}
                  type="button"
                  variant="destructive"
                >
                  <CheckCircle2 className="size-4" />
                  Approve
                </Button>
                <Button
                  className="justify-center"
                  disabled={!isPending}
                  onClick={() => setRejectOpen(true)}
                  type="button"
                  variant="default"
                >
                  <XCircle className="size-4" />
                  Reject
                </Button>
              </div>
              <DetailLine label="Chat ID" value={booking.chatId ?? "Not set"} />
            </FocusedSection>
          </div>
        </SheetContent>
      </Sheet>
      <BookingChatSheet booking={booking} onOpenChange={setChatOpen} open={chatOpen} />
      <BookingCancellationReviewDialog
        booking={booking}
        decision="approve"
        onOpenChange={setApproveOpen}
        open={approveOpen}
      />
      <BookingCancellationReviewDialog
        booking={booking}
        decision="reject"
        onOpenChange={setRejectOpen}
        open={rejectOpen}
      />
    </>
  );
}

function CancellationOutcomeBanner({
  approved,
  pending,
  rejected,
  requestedByRole,
}: {
  approved: boolean;
  pending: boolean;
  rejected: boolean;
  requestedByRole: string | null | undefined;
}) {
  const text = pending
    ? `Pending admin review. ${requestedByRole === "owner" ? "Owner-requested cancellation may trigger a payout penalty." : "Renter-requested cancellation needs refund handling."}`
    : approved
      ? "Cancellation approved. Review refund and chat archive outcome below."
      : rejected
        ? "Cancellation rejected. Booking status and chat access were restored."
        : "Cancellation request details.";

  return (
    <div className="rounded-md border bg-muted/40 p-3 text-sm">
      <div className="flex gap-2">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="leading-6">{text}</p>
      </div>
    </div>
  );
}

function FocusedSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="grid gap-3 border-t pt-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function MetricTile({
  emphasized = false,
  icon,
  label,
  value,
}: {
  emphasized?: boolean;
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      className={
        emphasized
          ? "grid gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3"
          : "grid gap-2 rounded-md border bg-muted/30 p-3"
      }
    >
      <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold [overflow-wrap:anywhere]">{value}</div>
    </div>
  );
}

function PartyTile({ label, name, uid }: { label: string; name: string; uid: string | null }) {
  return (
    <div className="grid gap-2 rounded-md border bg-muted/30 p-3">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="font-semibold [overflow-wrap:anywhere]">{name}</div>
      <div className="text-xs text-muted-foreground [overflow-wrap:anywhere]">{uid ?? "No UID"}</div>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 text-right [overflow-wrap:anywhere]">{value}</span>
    </div>
  );
}

function formatPenaltyRate(value: number | null) {
  return value == null ? "Not set" : `${formatExactNumber(value * 100)}%`;
}

function formatCancellationMoney(value: number | null, currency: string | null | undefined) {
  return formatBookingMoney(value, currency ?? "PHP");
}

type PaidAmountBreakdown = {
  currency: string | null;
  lines: Array<{ label: string; amount: number }>;
  total: number | null;
};

function buildPaidAmountBreakdown(booking: AdminBooking): PaidAmountBreakdown {
  const pricingBreakdown = booking.payment?.pricingBreakdown ?? {};
  const total = firstFiniteNumber([
    booking.payment?.amount,
    numberValue(pricingBreakdown.paymentAmount),
    booking.totalPrice,
  ]);
  const rentalSubtotal = firstFiniteNumber([
    booking.payment?.rentalSubtotal,
    numberValue(pricingBreakdown.rentalSubtotal),
  ]);
  const securityDeposit = firstFiniteNumber([
    numberValue(pricingBreakdown.securityDepositAmount),
    booking.securityDeposit.enabled ? booking.securityDeposit.amount : null,
  ]);
  const calculatedProcessingFee =
    total != null && rentalSubtotal != null
      ? roundMoney(total - rentalSubtotal - (securityDeposit ?? 0))
      : null;
  const storedProcessingFee = positiveSum([
    numberValue(pricingBreakdown.renterPlatformFee),
    numberValue(pricingBreakdown.renterProcessingFee),
  ]);
  const processingFee =
    calculatedProcessingFee != null && calculatedProcessingFee > 0
      ? calculatedProcessingFee
      : storedProcessingFee > 0
        ? storedProcessingFee
        : null;
  const lines: PaidAmountBreakdown["lines"] = [];

  if (rentalSubtotal != null && rentalSubtotal > 0) {
    lines.push({ label: "Rental subtotal", amount: rentalSubtotal });
  }

  if (securityDeposit != null && securityDeposit > 0) {
    lines.push({ label: "Security deposit", amount: securityDeposit });
  }

  if (processingFee != null && processingFee > 0) {
    lines.push({ label: "Processing/platform fees", amount: processingFee });
  }

  return {
    currency: booking.payment?.currency ?? null,
    lines,
    total,
  };
}

function firstFiniteNumber(values: Array<number | null | undefined>) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }

  return null;
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function positiveSum(values: Array<number | null | undefined>): number {
  return values.reduce<number>((sum, value) => {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return sum;
    return sum + value;
  }, 0);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function formatRemainingLeadTime({ from, to }: { from: Date | null; to: Date | null }) {
  if (!from || !to) return "Not set";

  const diffMs = policyStartBoundary(to).getTime() - from.getTime();
  if (diffMs <= 0) return "Started";

  const totalHours = Math.max(Math.ceil(diffMs / (60 * 60 * 1000)), 1);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days <= 0) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  if (hours <= 0) return `${days} ${days === 1 ? "day" : "days"}`;
  return `${days} ${days === 1 ? "day" : "days"} ${hours} ${hours === 1 ? "hour" : "hours"}`;
}

function policyStartBoundary(startDate: Date) {
  return new Date(Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate(),
  ) - 8 * 60 * 60 * 1000);
}
