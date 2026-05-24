"use client";

import * as React from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { ExternalLink, ImageIcon, Loader2, MessageSquareText, ReceiptText, SendHorizontal, UserRound } from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/lib/admin-bookings";
import { getFirebaseStorage } from "@/lib/firebase";
import { cn } from "@/lib/utils";

import { CachedUserViewSheet } from "../../entity-detail-sheets";
import { BookingDamageReviewDialog } from "./booking-damage-review-dialog";
import { listenAdminBookingMessages } from "../data/booking-queries";
import { useBookingMutation } from "../hooks/use-booking-mutation";

type SupportStatus = "pending" | "in_progress" | "resolved" | "closed";
type SupportChatTarget = "renter" | "owner";

type BookingPendingDamageViewSheetProps = {
  booking: AdminBooking;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function BookingPendingDamageViewSheet({
  booking,
  onOpenChange,
  open,
}: BookingPendingDamageViewSheetProps) {
  const initialSupportStatus = normalizeSupportStatus(
    booking.settlement?.supportStatus,
  );
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
  const [updateOpen, setUpdateOpen] = React.useState(false);
  const [reviewOpen, setReviewOpen] = React.useState(false);
  const [chatTarget, setChatTarget] = React.useState<SupportChatTarget | null>(null);
  const [supportStatus, setSupportStatus] = React.useState<SupportStatus>(initialSupportStatus);
  const [adminNotes, setAdminNotes] = React.useState(
    booking.damageDeductionRequest?.adminNotes ?? "",
  );
  const [renterSupportChatId, setRenterSupportChatId] = React.useState(
    booking.settlement?.renterSupportChatId ??
      booking.damageDeductionRequest?.renterSupportChatId ??
      null,
  );
  const [ownerSupportChatId, setOwnerSupportChatId] = React.useState(
    booking.settlement?.ownerSupportChatId ??
      booking.damageDeductionRequest?.ownerSupportChatId ??
      null,
  );
  const {
    createDamageSupportChat,
    error,
    resetError,
    releaseDamageBalancePayment,
    submitting,
    updateDamageSupportRequest,
  } = useBookingMutation(booking);
  const evidenceUrls = booking.damageDeductionRequest?.evidenceUrls ?? [];

  React.useEffect(() => {
    if (!open) return;
    setSupportStatus(initialSupportStatus);
    setAdminNotes(booking.damageDeductionRequest?.adminNotes ?? "");
    setRenterSupportChatId(
      booking.settlement?.renterSupportChatId ??
        booking.damageDeductionRequest?.renterSupportChatId ??
        null,
    );
    setOwnerSupportChatId(
      booking.settlement?.ownerSupportChatId ??
        booking.damageDeductionRequest?.ownerSupportChatId ??
        null,
    );
    resetError();
  }, [booking, initialSupportStatus, open, resetError]);

  async function onCreateSupportChat(target: SupportChatTarget) {
    const chatId = await createDamageSupportChat(target);
    if (!chatId) return;
    if (target === "renter") {
      setRenterSupportChatId(chatId);
    } else {
      setOwnerSupportChatId(chatId);
    }
  }

  async function onUpdateRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const success = await updateDamageSupportRequest({
      adminNotes,
      supportStatus,
    });
    if (success) {
      setUpdateOpen(false);
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-2xl">
          <SheetHeader className="pr-12">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <SheetTitle>{getBookingAssetTitle(booking)}</SheetTitle>
                <SheetDescription>{booking.id}</SheetDescription>
              </div>
              <StatusBadge value={isAdminReviewRequired ? "admin_review_required" : supportStatus} />
            </div>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-5 overflow-y-auto overflow-x-hidden px-4 pb-4">
            <Section title="Damage request">
              <DetailRow label="Reason" value={booking.damageDeductionRequest?.reason ?? "Not set"} />
              <DetailRow label="Owner notes" value={booking.damageDeductionRequest?.notes ?? "Not set"} />
              <DetailRow label="Admin notes" value={adminNotes || "Not set"} />
              <DetailRow label="Request status" value={booking.damageDeductionRequest?.status ?? "Not set"} />
            </Section>

            <Section title="Settlement">
              <DetailRow
                label="Settlement status"
                value={booking.settlement?.status ? <StatusBadge value={booking.settlement.status} /> : "Not set"}
              />
              <DetailRow
                label="Support status"
                value={isSupportHandling ? <StatusBadge value={supportStatus} /> : "Not started"}
              />
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
                label="Deposit return"
                value={formatBookingMoney(booking.settlement?.depositReturnAmount ?? null)}
              />
              <DetailRow
                label="Balance payment"
                value={
                  booking.settlement?.damageBalancePaymentStatus ? (
                    <StatusBadge value={booking.settlement.damageBalancePaymentStatus} />
                  ) : (
                    "Not paid"
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
            </Section>

            <Section title="Booking">
              <DetailRow label="Owner" value={getBookingOwnerName(booking)} />
              <DetailRow label="Renter" value={getBookingRenterName(booking)} />
              <DetailRow label="Start" value={formatBookingDate(booking.startDate)} />
              <DetailRow label="End" value={formatBookingDate(booking.endDate)} />
              <DetailRow label="Total" value={formatBookingMoney(booking.totalPrice)} />
              <DetailRow label="Security deposit" value={formatBookingMoney(booking.securityDeposit.amount)} />
            </Section>

            {canManageSupportChats ? (
              <Section title="Support chats">
                <SupportChatAction
                  chatId={renterSupportChatId}
                  createLabel="Create renter support chat"
                  disabled={submitting}
                  onCreate={() => onCreateSupportChat("renter")}
                  onView={() => setChatTarget("renter")}
                  viewLabel="View renter chat"
                />
                <SupportChatAction
                  chatId={ownerSupportChatId}
                  createLabel="Create owner support chat"
                  disabled={submitting}
                  onCreate={() => onCreateSupportChat("owner")}
                  onView={() => setChatTarget("owner")}
                  viewLabel="View owner chat"
                />
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
              </Section>
            ) : null}

            <Section title="Evidence">
              <EvidenceGrid urls={evidenceUrls} />
            </Section>
          </div>
          <SheetFooter>
            {isAdminReviewRequired ? (
              <Button disabled={submitting} onClick={() => setReviewOpen(true)} type="button">
                Review request
              </Button>
            ) : null}
            {isSupportHandling ? (
              <Button disabled={submitting} onClick={() => setUpdateOpen(true)} type="button">
                Update request
              </Button>
            ) : null}
            {canReleaseDamageBalancePayment ? (
              <Button disabled={submitting} onClick={releaseDamageBalancePayment} type="button">
                {submitting ? <Loader2 className="animate-spin" /> : null}
                Release paid balance
              </Button>
            ) : null}
            <Button disabled={submitting} onClick={() => onOpenChange(false)} type="button" variant="outline">
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <BookingDamageReviewDialog
        booking={booking}
        onOpenChange={setReviewOpen}
        open={reviewOpen}
      />

      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update support request</DialogTitle>
            <DialogDescription>{booking.id}</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={onUpdateRequest}>
            <div className="grid gap-2">
              <Label htmlFor={`support-status-${booking.id}`}>Support status</Label>
              <Select onValueChange={(value) => setSupportStatus(value as SupportStatus)} value={supportStatus}>
                <SelectTrigger id={`support-status-${booking.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              disabled={submitting}
              onChange={(event) => setAdminNotes(event.target.value)}
              placeholder="Admin notes"
              value={adminNotes}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <DialogFooter>
              <Button disabled={submitting} type="submit">
                {submitting ? <Loader2 className="animate-spin" /> : null}
                Save
              </Button>
              <Button disabled={submitting} onClick={() => setUpdateOpen(false)} type="button" variant="outline">
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <SupportChatSheet
        booking={booking}
        chatId={chatTarget === "renter" ? renterSupportChatId : ownerSupportChatId}
        onOpenChange={(nextOpen) => setChatTarget(nextOpen ? chatTarget : null)}
        open={chatTarget !== null}
        target={chatTarget ?? "renter"}
        title={chatTarget === "owner" ? "Owner support chat" : "Renter support chat"}
      />
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
          <img alt={label} className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]" src={resolvedUrl} />
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
              <img alt={`${label} preview`} className="max-h-[70vh] w-full rounded-md object-contain" src={resolvedUrl} />
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
  target: SupportChatTarget;
  title: string;
}) {
  const [messageText, setMessageText] = React.useState("");
  const [messages, setMessages] = React.useState<AdminBookingMessage[]>([]);
  const [messagesError, setMessagesError] = React.useState<string | null>(null);
  const [messagesLoading, setMessagesLoading] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
  const [paymentAmount, setPaymentAmount] = React.useState(
    String(booking.settlement?.outstandingDamageAmount ?? ""),
  );
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
            messages.map((message) => (
              <SupportMessageBubble booking={booking} key={message.id} message={message} />
            ))
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
                    disabled={submitting}
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
      <CachedUserViewSheet
        onOpenChange={setProfileOpen}
        open={profileOpen}
        uid={targetUid}
      />
    </Sheet>
  );
}

function SupportMessageBubble({
  booking,
  message,
}: {
  booking: AdminBooking;
  message: AdminBookingMessage;
}) {
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
        <span className="text-xs text-muted-foreground">
          {booking.id}
        </span>
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

function normalizeSupportStatus(value: string | null | undefined): SupportStatus {
  if (value === "in_progress" || value === "resolved" || value === "closed") {
    return value;
  }
  return "pending";
}
