"use client";

import * as React from "react";
import { getDownloadURL, ref } from "firebase/storage";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ExternalLink,
  ImageIcon,
  Loader2,
  MessageSquareText,
  ReceiptText,
  SendHorizontal,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";
import {
  formatBookingDate,
  formatBookingMoney,
  getBookingAssetTitle,
  getBookingOwnerId,
  getBookingOwnerName,
  getBookingRenterId,
  getBookingRenterName,
  type AdminBooking,
  type AdminBookingMessage,
  type DamageReviewDecision,
  type DamageSupportChatTarget,
  type DamageSupportStatus,
} from "@/lib/admin-bookings";
import { getFirebaseStorage } from "@/lib/firebase";
import { cn } from "@/lib/utils";

import { CachedUserViewSheet } from "../../entity-detail-sheets";
import { BookingChatSheet } from "./booking-chat-sheet";
import { BookingDamageReviewDialog } from "./booking-damage-review-dialog";
import { listenAdminBookingMessages } from "../data/booking-queries";
import { useBookingMutation } from "../hooks/use-booking-mutation";

type ActionToast = {
  message: string;
  title: string;
  variant: "success" | "error";
};
type DamageCaseStage =
  | "admin_review"
  | "disputed_review"
  | "support_handling"
  | "balance_paid"
  | "resolved"
  | "damage_requested"
  | "unknown";
type DamageFlowStep = {
  key: DamageCaseStage | "owner_payout";
  label: string;
};
type ConnectedIdRow = {
  collection: string;
  id: string;
  purpose: string;
};

type BookingPendingDamageViewSheetProps = {
  booking: AdminBooking;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function BookingPendingDamageViewSheet({ booking, onOpenChange, open }: BookingPendingDamageViewSheetProps) {
  const initialSupportStatus = normalizeSupportStatus(booking.settlement?.supportStatus);
  const isAdminReviewRequired = booking.settlement?.status === "admin_review_required";
  const isSupportHandling =
    !isAdminReviewRequired &&
    (booking.settlement?.status === "support_pending" ||
      booking.settlement?.supportStatus === "pending" ||
      booking.settlement?.supportStatus === "in_progress");
  const canManageSupportChats = isAdminReviewRequired || isSupportHandling;
  const canReleaseDamageBalancePayment =
    booking.settlement?.damageBalancePaymentStatus === "paid" &&
    booking.settlement?.ownerDamageBalancePayoutStatus !== "processing" &&
    booking.settlement?.ownerDamageBalancePayoutStatus !== "succeeded";
  const canRejectSupportHandling =
    isSupportHandling &&
    !["pending", "paid"].includes(booking.settlement?.damageBalancePaymentStatus ?? "") &&
    booking.settlement?.ownerDamageBalancePayoutStatus !== "processing" &&
    booking.settlement?.ownerDamageBalancePayoutStatus !== "succeeded";
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [reviewDecision, setReviewDecision] = React.useState<DamageReviewDecision>("approve_adjusted");
  const [bookingChatOpen, setBookingChatOpen] = React.useState(false);
  const [chatTarget, setChatTarget] = React.useState<DamageSupportChatTarget | null>(null);
  const [toast, setToast] = React.useState<ActionToast | null>(null);
  const [releaseBalanceMessage, setReleaseBalanceMessage] = React.useState<string | null>(null);
  const supportStatus = initialSupportStatus;
  const adminNotes = booking.damageDeductionRequest?.adminNotes ?? "";
  const [renterSupportChatId, setRenterSupportChatId] = React.useState(
    booking.settlement?.renterSupportChatId ?? booking.damageDeductionRequest?.renterSupportChatId ?? null,
  );
  const [ownerSupportChatId, setOwnerSupportChatId] = React.useState(
    booking.settlement?.ownerSupportChatId ?? booking.damageDeductionRequest?.ownerSupportChatId ?? null,
  );
  const { createDamageSupportChat, error, resetError, releaseDamageBalancePayment, submitting } =
    useBookingMutation(booking);
  const evidenceUrls = booking.damageDeductionRequest?.evidenceUrls ?? [];
  const stage = getDamageCaseStage(booking);
  const primaryStatus =
    stage === "admin_review"
      ? "admin_review_required"
      : stage === "support_handling"
        ? supportStatus
        : stage === "balance_paid"
          ? "paid"
          : stage === "resolved"
            ? "resolved"
            : (booking.settlement?.status ?? booking.damageDeductionRequest?.status ?? "pending");

  React.useEffect(() => {
    if (!open) return;
    setRenterSupportChatId(
      booking.settlement?.renterSupportChatId ?? booking.damageDeductionRequest?.renterSupportChatId ?? null,
    );
    setOwnerSupportChatId(
      booking.settlement?.ownerSupportChatId ?? booking.damageDeductionRequest?.ownerSupportChatId ?? null,
    );
    setToast(null);
    setReleaseBalanceMessage(null);
    resetError();
  }, [booking, open, resetError]);

  async function onCreateSupportChat(target: DamageSupportChatTarget) {
    const chatId = await createDamageSupportChat(target);
    if (!chatId) return;
    if (target === "renter") {
      setRenterSupportChatId(chatId);
    } else {
      setOwnerSupportChatId(chatId);
    }
  }

  async function onReleaseDamageBalancePayment() {
    setReleaseBalanceMessage(null);
    const result = await releaseDamageBalancePayment();
    if (result.success) {
      setToast({
        message: "Paid damage balance released.",
        title: "Success",
        variant: "success",
      });
      return;
    }

    const message = result.error ?? "Unable to release paid balance.";
    setReleaseBalanceMessage(message);
    setToast({
      message: "Please try again.",
      title: "Unable to release paid balance",
      variant: "error",
    });
  }

  function openReviewDialog(decision: DamageReviewDecision = "approve_adjusted") {
    setReviewDecision(decision);
    setReviewOpen(true);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-2xl">
          <SheetHeader className="pr-12">
            <div className="grid gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <SheetTitle>{getBookingAssetTitle(booking)}</SheetTitle>
                  <SheetDescription>{booking.id}</SheetDescription>
                </div>
                <StatusBadge value={primaryStatus} />
              </div>
              <DamageStatusFlow booking={booking} stage={stage} />
            </div>
          </SheetHeader>
          <div className="hover-scrollbar grid flex-1 auto-rows-min gap-5 overflow-y-auto overflow-x-hidden px-4 pb-4">
            <DamageCaseHero booking={booking} stage={stage} status={primaryStatus} />

            <SummaryGrid booking={booking} />

            <Section title={getStagePanelTitle(stage)}>
              <StagePanel
                adminNotes={adminNotes}
                booking={booking}
                canReleaseDamageBalancePayment={canReleaseDamageBalancePayment}
                evidenceCount={evidenceUrls.length}
                isAdminReviewRequired={isAdminReviewRequired}
                canRejectSupportHandling={canRejectSupportHandling}
                onReleaseDamageBalancePayment={onReleaseDamageBalancePayment}
                onReview={openReviewDialog}
                releaseBalanceMessage={releaseBalanceMessage}
                stage={stage}
                submitting={submitting}
                supportStatus={supportStatus}
              />
            </Section>

            <Section title="Chats">
              <Button
                className="w-full justify-between"
                disabled={!booking.chatId}
                onClick={() => setBookingChatOpen(true)}
                type="button"
                variant="outline"
              >
                <span className="inline-flex items-center gap-2">
                  <MessageSquareText className="size-4" />
                  View buyer-renter chat
                </span>
                <span className="max-w-40 truncate text-muted-foreground">{booking.chatId ?? "No chat"}</span>
              </Button>
              <div className="grid gap-2 rounded-md border bg-muted/30 p-3">
                <div className="text-xs font-medium uppercase text-muted-foreground">Support chats</div>
                {canManageSupportChats ? (
                  <>
                    <SupportChatAction
                      chatId={renterSupportChatId}
                      createLabel="Create renter support chat"
                      disabled={submitting}
                      onCreate={() => onCreateSupportChat("renter")}
                      onView={() => setChatTarget("renter")}
                      viewLabel="View renter support chat"
                    />
                    <SupportChatAction
                      chatId={ownerSupportChatId}
                      createLabel="Create owner support chat"
                      disabled={submitting}
                      onCreate={() => onCreateSupportChat("owner")}
                      onView={() => setChatTarget("owner")}
                      viewLabel="View owner support chat"
                    />
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Support chats become available after the request enters admin review.
                  </p>
                )}
              </div>
            </Section>

            <Section title="Booking context">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoTile icon={<UserRound className="size-4" />} label="Owner" value={getBookingOwnerName(booking)} />
                <InfoTile
                  icon={<UserRound className="size-4" />}
                  label="Renter"
                  value={getBookingRenterName(booking)}
                />
                <InfoTile label="Start" value={formatBookingDate(booking.startDate)} />
                <InfoTile label="End" value={formatBookingDate(booking.endDate)} />
                <InfoTile label="Booking total" value={formatBookingMoney(booking.totalPrice)} />
                <InfoTile
                  label="Security deposit"
                  value={
                    booking.securityDeposit.enabled ? formatBookingMoney(booking.securityDeposit.amount) : "Disabled"
                  }
                />
              </div>
            </Section>

            <Section title="Evidence">
              <EvidenceGrid urls={evidenceUrls} />
            </Section>

            <ConnectedIdsAccordion booking={booking} />
          </div>
        </SheetContent>
      </Sheet>

      <BookingDamageReviewDialog
        booking={booking}
        initialDecision={reviewDecision}
        onOpenChange={setReviewOpen}
        open={reviewOpen}
        rejectOnly={stage === "support_handling"}
      />

      <BookingChatSheet booking={booking} onOpenChange={setBookingChatOpen} open={bookingChatOpen} />

      <SupportChatSheet
        booking={booking}
        chatId={chatTarget === "renter" ? renterSupportChatId : ownerSupportChatId}
        onOpenChange={(nextOpen) => setChatTarget(nextOpen ? chatTarget : null)}
        open={chatTarget !== null}
        target={chatTarget ?? "renter"}
        title={chatTarget === "owner" ? "Owner support chat" : "Renter support chat"}
      />

      {toast ? (
        <Toast message={toast.message} onDismiss={() => setToast(null)} title={toast.title} variant={toast.variant} />
      ) : null}
    </>
  );
}

function Section({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="grid min-w-0 gap-3 rounded-md border p-4 text-sm">
      <h3 className="font-medium">{title}</h3>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function DamageStatusFlow({ booking, stage }: { booking: AdminBooking; stage: DamageCaseStage }) {
  const steps = getDamageFlowSteps();
  const currentIndex = getDamageFlowCurrentIndex(booking, stage);

  return (
    <div className="hover-scrollbar overflow-x-auto pb-1">
      <div className="flex min-w-max items-center gap-2">
        {steps.map((step, index) => {
          const state = index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming";
          return (
            <React.Fragment key={step.key}>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium",
                  state === "complete" && "border-primary/30 bg-primary/10 text-primary",
                  state === "current" && "border-primary bg-primary text-primary-foreground",
                  state === "upcoming" && "bg-background text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid size-5 place-items-center rounded-full border text-[10px]",
                    state === "complete" && "border-primary bg-primary text-primary-foreground",
                    state === "current" && "border-primary-foreground/70",
                    state === "upcoming" && "border-muted-foreground/40",
                  )}
                >
                  {state === "complete" ? <CheckCircle2 className="size-3" /> : index + 1}
                </span>
                {step.label}
              </div>
              {index < steps.length - 1 ? (
                <div className={cn("h-px w-8 shrink-0", index < currentIndex ? "bg-primary" : "bg-border")} />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function DamageCaseHero({ booking, stage, status }: { booking: AdminBooking; stage: DamageCaseStage; status: string }) {
  const isSupportReviewRequest = booking.damageDeductionRequest?.requiresSupportReview === true;

  return (
    <section className="grid gap-4 rounded-md border bg-muted/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium">
            {getStageIcon(stage)}
            {getStageTitle(stage)}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{getStageDescription(stage, booking)}</p>
        </div>
        <StatusBadge value={status} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label={isSupportReviewRequest ? "Support review" : "Requested"}
          value={
            isSupportReviewRequest
              ? "No amount set"
              : formatBookingMoney(booking.damageDeductionRequest?.requestedAmount ?? null)
          }
        />
        <MetricCard
          label="Approved"
          value={formatBookingMoney(
            booking.settlement?.approvedDamageDeductionAmount ?? booking.damageDeductionRequest?.approvedAmount ?? null,
          )}
        />
        <MetricCard
          label="Outstanding"
          value={formatBookingMoney(booking.settlement?.outstandingDamageAmount ?? null)}
        />
      </div>
    </section>
  );
}

function ConnectedIdsAccordion({ booking }: { booking: AdminBooking }) {
  const rows = getConnectedIdRows(booking);

  if (!rows.length) {
    return null;
  }

  return (
    <Collapsible className="rounded-md border">
      <CollapsibleTrigger asChild>
        <button
          className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium"
          type="button"
        >
          <span>Connected IDs ({rows.length})</span>
          <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid gap-2 border-t p-4">
          {rows.map((row) => (
            <div
              className="grid gap-1 rounded-md border bg-muted/30 p-3 text-sm sm:grid-cols-[15rem_minmax(0,1fr)] sm:gap-3"
              key={`${row.collection}-${row.purpose}-${row.id}`}
            >
              <div className="font-medium">{row.collection}</div>
              <div className="min-w-0">
                <div className="font-mono text-xs [overflow-wrap:anywhere]">{row.id}</div>
                <div className="mt-1 text-xs text-muted-foreground">{row.purpose}</div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function SummaryGrid({ booking }: { booking: AdminBooking }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <InfoTile
        icon={<AlertTriangle className="size-4" />}
        label="Damage reason"
        value={booking.damageDeductionRequest?.reason ?? "Not set"}
      />
      <InfoTile
        icon={<ShieldCheck className="size-4" />}
        label="Renter response"
        value={booking.settlement?.renterResponse ?? booking.damageDeductionRequest?.renterResponse ?? "Not set"}
      />
      <InfoTile
        label="Request status"
        value={
          booking.damageDeductionRequest?.status ? (
            <StatusBadge value={booking.damageDeductionRequest.status} />
          ) : (
            "Not set"
          )
        }
      />
      <InfoTile
        label="Settlement status"
        value={booking.settlement?.status ? <StatusBadge value={booking.settlement.status} /> : "Not set"}
      />
    </div>
  );
}

function StagePanel({
  adminNotes,
  booking,
  canReleaseDamageBalancePayment,
  canRejectSupportHandling,
  evidenceCount,
  isAdminReviewRequired,
  onReleaseDamageBalancePayment,
  onReview,
  releaseBalanceMessage,
  stage,
  submitting,
  supportStatus,
}: {
  adminNotes: string;
  booking: AdminBooking;
  canReleaseDamageBalancePayment: boolean;
  canRejectSupportHandling: boolean;
  evidenceCount: number;
  isAdminReviewRequired: boolean;
  onReleaseDamageBalancePayment: () => void;
  onReview: (decision?: DamageReviewDecision) => void;
  releaseBalanceMessage: string | null;
  stage: DamageCaseStage;
  submitting: boolean;
  supportStatus: DamageSupportStatus;
}) {
  if (stage === "disputed_review") {
    return (
      <>
        <DetailRow
          label="Requested amount"
          value={formatBookingMoney(booking.damageDeductionRequest?.requestedAmount ?? null)}
        />
        <DetailRow
          label="Security deposit"
          value={booking.securityDeposit.enabled ? formatBookingMoney(booking.securityDeposit.amount) : "Disabled"}
        />
        <DetailRow label="Renter response" value={<StatusBadge value="disputed" />} />
        <DetailRow label="Owner notes" value={booking.damageDeductionRequest?.notes ?? "Not set"} />
        <DetailRow label="Evidence photos" value={String(evidenceCount)} />
        <DetailRow label="Admin notes" value={adminNotes || "Not set"} />
        <div className="grid gap-2 sm:grid-cols-3">
          <Button
            className="justify-center"
            disabled={submitting}
            onClick={() => onReview("approve_adjusted")}
            type="button"
          >
            Change amount
          </Button>
          <Button
            className="justify-center"
            disabled={submitting}
            onClick={() => onReview("approve_full")}
            type="button"
            variant="secondary"
          >
            Approve requested fee
          </Button>
          <Button
            className="justify-center"
            disabled={submitting}
            onClick={() => onReview("reject")}
            type="button"
            variant="destructive"
          >
            Reject request
          </Button>
        </div>
      </>
    );
  }

  if (stage === "admin_review") {
    const isSupportReviewRequest = booking.damageDeductionRequest?.requiresSupportReview === true;
    return (
      <>
        {isSupportReviewRequest ? (
          <DetailRow label="Requested amount" value="Not set by owner" />
        ) : (
          <DetailRow
            label="Requested amount"
            value={formatBookingMoney(booking.damageDeductionRequest?.requestedAmount ?? null)}
          />
        )}
        <DetailRow
          label="Security deposit"
          value={booking.securityDeposit.enabled ? formatBookingMoney(booking.securityDeposit.amount) : "Disabled"}
        />
        <DetailRow label="Owner notes" value={booking.damageDeductionRequest?.notes ?? "Not set"} />
        <DetailRow label="Evidence photos" value={String(evidenceCount)} />
        <DetailRow
          label="Needs support review"
          value={booking.damageDeductionRequest?.requiresSupportReview ? "Yes" : "No"}
        />
        <Button
          className="w-full justify-center"
          disabled={submitting || !isAdminReviewRequired}
          onClick={() => onReview()}
          type="button"
        >
          {isSupportReviewRequest ? "Reject request" : "Review request"}
        </Button>
      </>
    );
  }

  if (stage === "support_handling" || stage === "balance_paid") {
    return (
      <>
        <DetailRow label="Support status" value={<StatusBadge value={supportStatus} />} />
        <DetailRow
          label="Approved damage"
          value={formatBookingMoney(booking.settlement?.approvedDamageDeductionAmount ?? null)}
        />
        <DetailRow
          label="Deposit-covered damage"
          value={formatBookingMoney(booking.settlement?.depositCoveredDamageAmount ?? null)}
        />
        <DetailRow
          label="Outstanding amount"
          value={formatBookingMoney(booking.settlement?.outstandingDamageAmount ?? null)}
        />
        <DetailRow
          label="Balance payment"
          value={
            booking.settlement?.damageBalancePaymentStatus ? (
              <StatusBadge value={booking.settlement.damageBalancePaymentStatus} />
            ) : (
              "Not requested"
            )
          }
        />
        <DetailRow
          label="Owner balance payout"
          value={
            booking.settlement?.ownerDamageBalancePayoutStatus ? (
              <StatusBadge value={booking.settlement.ownerDamageBalancePayoutStatus} />
            ) : (
              "Not released"
            )
          }
        />
        <DetailRow label="Admin notes" value={adminNotes || "Not set"} />
        {canRejectSupportHandling ? (
          <Button
            className="w-full justify-center"
            disabled={submitting}
            onClick={() => onReview()}
            type="button"
            variant="destructive"
          >
            Reject damage request
          </Button>
        ) : null}
        {canReleaseDamageBalancePayment ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" disabled={submitting} onClick={onReleaseDamageBalancePayment} type="button">
              {submitting ? <Loader2 className="animate-spin" /> : null}
              Release paid balance
            </Button>
          </div>
        ) : null}
        {releaseBalanceMessage ? <ActionMessage text={releaseBalanceMessage} /> : null}
      </>
    );
  }

  if (stage === "resolved") {
    return (
      <>
        <DetailRow
          label="Final approved damage"
          value={formatBookingMoney(booking.settlement?.approvedDamageDeductionAmount ?? null)}
        />
        <DetailRow label="Deposit return" value={formatBookingMoney(booking.settlement?.depositReturnAmount ?? null)} />
        <DetailRow label="Owner payout" value={formatBookingMoney(booking.settlement?.ownerPayoutAmount ?? null)} />
        <DetailRow
          label="Balance payment"
          value={
            booking.settlement?.damageBalancePaymentStatus ? (
              <StatusBadge value={booking.settlement.damageBalancePaymentStatus} />
            ) : (
              "Not needed"
            )
          }
        />
        <DetailRow label="Admin notes" value={adminNotes || "Not set"} />
      </>
    );
  }

  return (
    <>
      <DetailRow label="Owner notes" value={booking.damageDeductionRequest?.notes ?? "Not set"} />
      <DetailRow label="Evidence photos" value={String(evidenceCount)} />
      <DetailRow
        label="Security deposit"
        value={booking.securityDeposit.enabled ? formatBookingMoney(booking.securityDeposit.amount) : "Disabled"}
      />
      <DetailRow label="Admin notes" value={adminNotes || "Not set"} />
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid min-w-0 gap-1 rounded-md border bg-background p-3">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="truncate text-lg font-semibold">{value}</div>
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="grid min-w-0 gap-2 rounded-md border p-3 text-sm">
      <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="min-w-0 [overflow-wrap:anywhere]">{value}</div>
    </div>
  );
}

function ActionMessage({ text }: { text: string }) {
  return <p className="text-sm text-destructive [overflow-wrap:anywhere]">{text}</p>;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 text-right [overflow-wrap:anywhere]">{value}</span>
    </div>
  );
}

function SupportChatAction({
  chatId,
  createLabel,
  disabled,
  onCreate,
  onView,
  viewLabel,
}: {
  chatId: string | null;
  createLabel: string;
  disabled: boolean;
  onCreate: () => void;
  onView: () => void;
  viewLabel: string;
}) {
  return chatId ? (
    <Button className="justify-between" onClick={onView} type="button" variant="outline">
      <span className="inline-flex items-center gap-2">
        <MessageSquareText className="size-4" />
        {viewLabel}
      </span>
      <span className="max-w-40 truncate text-muted-foreground">{chatId}</span>
    </Button>
  ) : (
    <Button disabled={disabled} onClick={onCreate} type="button" variant="outline">
      {disabled ? <Loader2 className="animate-spin" /> : <MessageSquareText className="size-4" />}
      {createLabel}
    </Button>
  );
}

function EvidenceGrid({ urls }: { urls: string[] }) {
  if (!urls.length) {
    return (
      <div className="grid min-h-32 place-items-center rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        <div className="grid justify-items-center gap-3">
          <ImageIcon className="size-6" />
          <p>No evidence photos uploaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {urls.map((url, index) => (
        <EvidenceImage key={`${url}-${index}`} label={`Evidence ${index + 1}`} url={url} />
      ))}
    </div>
  );
}

function EvidenceImage({ label, url }: { label: string; url: string }) {
  const [open, setOpen] = React.useState(false);
  const { error, resolvedUrl } = useResolvedImageUrl(url);

  if (error) {
    return <p className="rounded-md border p-3 text-sm text-destructive">{error}</p>;
  }

  return (
    <>
      <button
        className="group relative aspect-square overflow-hidden rounded-md border bg-muted text-left"
        disabled={!resolvedUrl}
        onClick={() => setOpen(true)}
        type="button"
      >
        {resolvedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={label}
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
            src={resolvedUrl}
          />
        ) : (
          <span className="flex h-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
            Loading...
          </span>
        )}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>{url}</DialogDescription>
          </DialogHeader>
          {resolvedUrl ? (
            <div className="grid gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={`${label} preview`}
                className="max-h-[70vh] w-full rounded-md object-contain"
                src={resolvedUrl}
              />
              <Button asChild variant="outline">
                <a href={resolvedUrl} rel="noreferrer" target="_blank">
                  <ExternalLink className="size-4" />
                  Open image
                </a>
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SupportChatSheet({
  booking,
  chatId,
  onOpenChange,
  open,
  target,
  title,
}: {
  booking: AdminBooking;
  chatId: string | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  target: DamageSupportChatTarget;
  title: string;
}) {
  const [messageText, setMessageText] = React.useState("");
  const [messages, setMessages] = React.useState<AdminBookingMessage[]>([]);
  const [messagesError, setMessagesError] = React.useState<string | null>(null);
  const [messagesLoading, setMessagesLoading] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
  const [paymentAmount, setPaymentAmount] = React.useState(String(booking.settlement?.outstandingDamageAmount ?? ""));
  const { error, resetError, sendDamageBalancePaymentRequest, sendDamageSupportMessage, submitting } =
    useBookingMutation(booking);
  const trimmedMessage = messageText.trim();
  const parsedPaymentAmount = Number(paymentAmount);
  const paymentAmountError =
    paymentAmount.trim() && (!Number.isInteger(parsedPaymentAmount) || parsedPaymentAmount <= 0)
      ? "Enter a whole amount greater than 0."
      : null;
  const targetUid = target === "renter" ? getBookingRenterId(booking) : getBookingOwnerId(booking);
  const targetName = target === "renter" ? getBookingRenterName(booking) : getBookingOwnerName(booking);
  const securityDepositText = booking.securityDeposit.enabled
    ? formatBookingMoney(booking.securityDeposit.amount)
    : "Disabled";
  const outstandingDamageBalanceText = formatBookingMoney(booking.settlement?.outstandingDamageAmount ?? null);
  const canRequestDamageBalancePayment =
    target === "renter" &&
    Boolean(chatId) &&
    !["pending", "paid"].includes(booking.settlement?.damageBalancePaymentStatus ?? "") &&
    booking.settlement?.ownerDamageBalancePayoutStatus !== "processing" &&
    booking.settlement?.ownerDamageBalancePayoutStatus !== "succeeded";

  React.useEffect(() => {
    if (!open) return;
    setMessageText("");
    setPaymentAmount(String(booking.settlement?.outstandingDamageAmount ?? ""));
    resetError();
  }, [booking.settlement?.outstandingDamageAmount, open, resetError]);

  React.useEffect(() => {
    if (!open || !chatId) {
      setMessages([]);
      setMessagesError(null);
      setMessagesLoading(false);
      return;
    }

    setMessagesLoading(true);
    setMessagesError(null);
    const unsubscribe = listenAdminBookingMessages({
      chatId,
      onError: (nextError) => {
        setMessagesError(nextError.message || "Unable to load support chat.");
        setMessagesLoading(false);
      },
      onNext: (nextMessages) => {
        setMessages(nextMessages);
        setMessagesLoading(false);
      },
    });

    return unsubscribe;
  }, [chatId, open]);

  async function onSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!chatId || !trimmedMessage) return;

    const success = await sendDamageSupportMessage({
      chatId,
      target,
      text: trimmedMessage,
    });
    if (success) {
      setMessageText("");
    }
  }

  async function onSendPaymentRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!chatId || paymentAmountError || !Number.isInteger(parsedPaymentAmount) || parsedPaymentAmount <= 0) {
      return;
    }

    const success = await sendDamageBalancePaymentRequest({
      chatId,
      amount: parsedPaymentAmount,
    });
    if (success) {
      setPaymentDialogOpen(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader className="pr-12">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{chatId ?? "No chat ID"}</SheetDescription>
        </SheetHeader>
        <div className="border-b px-4 pb-4">
          <Button
            className="w-full justify-start"
            disabled={!targetUid}
            onClick={() => setProfileOpen(true)}
            type="button"
            variant="outline"
          >
            <UserRound className="size-4" />
            View {targetName} profile
          </Button>
        </div>
        <div className="grid flex-1 auto-rows-min gap-3 overflow-y-auto overflow-x-hidden px-4 pb-4">
          {!chatId ? (
            <EmptyChatState text="No support chat exists yet." />
          ) : messagesLoading ? (
            <EmptyChatState text="Loading messages..." />
          ) : messagesError ? (
            <EmptyChatState text={messagesError} />
          ) : messages.length ? (
            messages.map((message) => <SupportMessageBubble booking={booking} key={message.id} message={message} />)
          ) : (
            <EmptyChatState text="No messages in this support chat yet." />
          )}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        {chatId ? (
          <SheetFooter className="border-t px-4 pt-4">
            <form className="grid w-full gap-3" onSubmit={onSendMessage}>
              <Textarea
                disabled={submitting}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder="Message as Lend Support"
                value={messageText}
              />
              <div className="flex gap-2">
                <Button className="flex-1" disabled={submitting || !trimmedMessage} type="submit">
                  {submitting ? <Loader2 className="animate-spin" /> : <SendHorizontal className="size-4" />}
                  Send
                </Button>
                {target === "renter" ? (
                  <Button
                    disabled={submitting || !canRequestDamageBalancePayment}
                    onClick={() => setPaymentDialogOpen(true)}
                    type="button"
                    variant="secondary"
                  >
                    <ReceiptText className="size-4" />
                    Payment
                  </Button>
                ) : null}
              </div>
            </form>
          </SheetFooter>
        ) : null}
      </SheetContent>
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request damage balance payment</DialogTitle>
            <DialogDescription>{booking.id}</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={onSendPaymentRequest}>
            <div className="grid gap-3 rounded-md border bg-muted/30 p-3 text-sm">
              <p className="text-muted-foreground">
                Enter only the amount beyond the security deposit. This is not the full damage amount or a new security
                deposit.
              </p>
              <div className="grid gap-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Security deposit</span>
                  <span className="font-medium">{securityDepositText}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Outstanding damage balance</span>
                  <span className="font-medium">{outstandingDamageBalanceText}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Example: if the deposit is PHP 500 and approved damage is PHP 700, request PHP 200.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`damage-balance-payment-${booking.id}`}>Amount</Label>
              <Input
                disabled={submitting}
                id={`damage-balance-payment-${booking.id}`}
                min={1}
                onChange={(event) => setPaymentAmount(event.target.value)}
                step={1}
                type="number"
                value={paymentAmount}
              />
              {paymentAmountError ? <p className="text-sm text-destructive">{paymentAmountError}</p> : null}
              {!paymentAmountError && Number.isInteger(parsedPaymentAmount) && parsedPaymentAmount > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Request message amount: {formatBookingMoney(parsedPaymentAmount)}
                </p>
              ) : null}
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button disabled={submitting || Boolean(paymentAmountError) || !paymentAmount.trim()} type="submit">
                {submitting ? <Loader2 className="animate-spin" /> : null}
                Send request
              </Button>
              <Button disabled={submitting} onClick={() => setPaymentDialogOpen(false)} type="button" variant="outline">
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <CachedUserViewSheet onOpenChange={setProfileOpen} open={profileOpen} uid={targetUid} />
    </Sheet>
  );
}

function SupportMessageBubble({ booking, message }: { booking: AdminBooking; message: AdminBookingMessage }) {
  const sender = getSupportSenderDetails(booking, message.senderId);
  return (
    <div className={cn("flex", sender.role === "Support" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "grid max-w-[82%] gap-2 rounded-md border p-3 text-sm [overflow-wrap:anywhere]",
          sender.role === "Support" && "border-primary/30 bg-primary/5",
          sender.role === "System" && "bg-muted",
        )}
      >
        <span className="font-medium">{sender.label}</span>
        <p className="whitespace-pre-wrap break-words text-muted-foreground">
          {message.text ?? message.mediaUrl ?? "No message content"}
        </p>
        <span className="text-xs text-muted-foreground">{booking.id}</span>
      </div>
    </div>
  );
}

function getSupportSenderDetails(booking: AdminBooking, senderId: string | null) {
  if (!senderId) {
    return { label: "System", role: "System" as const };
  }

  if (senderId === getBookingOwnerId(booking)) {
    return { label: getBookingOwnerName(booking), role: "User" as const };
  }

  if (senderId === getBookingRenterId(booking)) {
    return { label: getBookingRenterName(booking), role: "User" as const };
  }

  return { label: "Lend Support", role: "Support" as const };
}

function EmptyChatState({ text }: { text: string }) {
  return (
    <div className="grid min-h-48 place-items-center rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
      <div className="grid justify-items-center gap-3">
        <MessageSquareText className="size-6" />
        <p>{text}</p>
      </div>
    </div>
  );
}

function useResolvedImageUrl(photoUrl: string | null) {
  const [resolvedUrl, setResolvedUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setResolvedUrl(null);
    setError(null);

    if (!photoUrl) return;

    if (isUrl(photoUrl)) {
      setResolvedUrl(photoUrl);
      return;
    }

    async function resolveStoragePath() {
      try {
        const url = await getDownloadURL(ref(getFirebaseStorage(), photoUrl ?? ""));
        if (!cancelled) setResolvedUrl(url);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load evidence photo.");
        }
      }
    }

    void resolveStoragePath();

    return () => {
      cancelled = true;
    };
  }, [photoUrl]);

  return { error, resolvedUrl };
}

function isUrl(value: string) {
  return /^https?:\/\//i.test(value) || value.startsWith("/");
}

function getDamageFlowSteps(): DamageFlowStep[] {
  return [
    { key: "damage_requested", label: "Damage requested" },
    { key: "admin_review", label: "Lend Support review" },
    { key: "balance_paid", label: "Balance payment" },
    { key: "owner_payout", label: "Owner payout" },
    { key: "resolved", label: "Resolved" },
  ];
}

function getDamageFlowCurrentIndex(booking: AdminBooking, stage: DamageCaseStage) {
  if (stage === "resolved") {
    return 4;
  }

  if (
    booking.settlement?.ownerDamageBalancePayoutStatus === "processing" ||
    booking.settlement?.ownerDamageBalancePayoutStatus === "succeeded" ||
    booking.settlement?.ownerDamageBalancePayoutStatus === "failed"
  ) {
    return 3;
  }

  if (
    stage === "balance_paid" ||
    booking.settlement?.damageBalancePaymentStatus === "pending" ||
    booking.settlement?.damageBalancePaymentStatus === "paid" ||
    booking.settlement?.damageBalancePaymentStatus === "failed"
  ) {
    return 2;
  }

  if (stage === "admin_review" || stage === "support_handling") {
    return 1;
  }

  if (stage === "disputed_review") {
    return 1;
  }

  return 0;
}

function getConnectedIdRows(booking: AdminBooking): ConnectedIdRow[] {
  return [
    {
      collection: "bookings",
      id: booking.id,
      purpose: "Canonical booking document",
    },
    {
      collection: "assets",
      id: booking.assetId,
      purpose: "Linked rental asset",
    },
    {
      collection: "chats",
      id: booking.chatId,
      purpose: "Buyer-renter booking chat",
    },
    {
      collection: "users",
      id: getBookingOwnerId(booking),
      purpose: "Owner user profile",
    },
    {
      collection: "users",
      id: getBookingRenterId(booking),
      purpose: "Renter user profile",
    },
    {
      collection: "chats",
      id: booking.settlement?.renterSupportChatId ?? booking.damageDeductionRequest?.renterSupportChatId ?? null,
      purpose: "Renter support chat",
    },
    {
      collection: "chats",
      id: booking.settlement?.ownerSupportChatId ?? booking.damageDeductionRequest?.ownerSupportChatId ?? null,
      purpose: "Owner support chat",
    },
    {
      collection: "damageBalancePaymentRequests",
      id: booking.settlement?.damageBalancePaymentRequestId ?? null,
      purpose: "Damage balance payment request",
    },
  ].filter((row): row is ConnectedIdRow => Boolean(row.id));
}

function normalizeSupportStatus(value: string | null | undefined): DamageSupportStatus {
  if (value === "in_progress" || value === "resolved" || value === "closed") {
    return value;
  }
  return "pending";
}

function getDamageCaseStage(booking: AdminBooking): DamageCaseStage {
  if (
    booking.settlement?.damageBalancePaymentStatus === "paid" &&
    booking.settlement?.ownerDamageBalancePayoutStatus !== "succeeded"
  ) {
    return "balance_paid";
  }

  if (
    booking.settlement?.status === "completed" ||
    booking.damageDeductionRequest?.status === "resolved" ||
    booking.settlement?.supportStatus === "resolved" ||
    booking.settlement?.supportStatus === "closed"
  ) {
    return "resolved";
  }

  if (booking.settlement?.status === "admin_review_required") {
    return "admin_review";
  }

  if (isRenterDisputedDamageRequest(booking)) {
    return "disputed_review";
  }

  if (
    booking.settlement?.status === "support_pending" ||
    booking.settlement?.supportStatus === "pending" ||
    booking.settlement?.supportStatus === "in_progress"
  ) {
    return "support_handling";
  }

  if (booking.settlement?.status === "damage_deduction_requested") {
    return "damage_requested";
  }

  return "unknown";
}

function isRenterDisputedDamageRequest(booking: AdminBooking) {
  return booking.damageDeductionRequest?.status === "disputed" || booking.disputeFlow?.status === "disputed";
}

function getStagePanelTitle(stage: DamageCaseStage) {
  switch (stage) {
    case "admin_review":
      return "Review needed";
    case "disputed_review":
      return "Renter disputed";
    case "support_handling":
      return "Support chats";
    case "balance_paid":
      return "Payment received";
    case "resolved":
      return "Final outcome";
    case "damage_requested":
      return "Renter response needed";
    default:
      return "Damage details";
  }
}

function getStageTitle(stage: DamageCaseStage) {
  switch (stage) {
    case "admin_review":
      return "Lend Support review required";
    case "disputed_review":
      return "Renter disputed the request";
    case "support_handling":
      return "Support chat active";
    case "balance_paid":
      return "Damage balance paid";
    case "resolved":
      return "Damage case resolved";
    case "damage_requested":
      return "Waiting for renter response";
    default:
      return "Damage request";
  }
}

function getStageDescription(stage: DamageCaseStage, booking: AdminBooking) {
  const reason = booking.damageDeductionRequest?.reason ?? "damage";
  switch (stage) {
    case "admin_review":
      if (booking.damageDeductionRequest?.requiresSupportReview) {
        return `Review the ${reason} request, support chats, and evidence. Reject only if the request should be declined.`;
      }
      return `Review the ${reason} request and decide the approved damage amount.`;
    case "disputed_review":
      return "The renter declined the owner damage fee. Approve the requested fee, change the amount, or reject it.";
    case "support_handling":
      return "Use support chats, payment requests, and admin notes for this damage case.";
    case "balance_paid":
      return "The renter paid the outstanding balance. Release the paid balance to the owner when ready.";
    case "resolved":
      return "Review the final settlement amounts and retained record for this damage case.";
    case "damage_requested":
      return "The owner submitted a deduction request and the renter response is still pending.";
    default:
      return "Review the request, settlement, chat, and evidence details for this booking.";
  }
}

function getStageIcon(stage: DamageCaseStage) {
  switch (stage) {
    case "admin_review":
    case "disputed_review":
      return <AlertTriangle className="size-4 text-destructive" />;
    case "support_handling":
      return <MessageSquareText className="size-4 text-primary" />;
    case "balance_paid":
      return <CircleDollarSign className="size-4 text-primary" />;
    case "resolved":
      return <CheckCircle2 className="size-4 text-primary" />;
    default:
      return <ShieldCheck className="size-4 text-muted-foreground" />;
  }
}
