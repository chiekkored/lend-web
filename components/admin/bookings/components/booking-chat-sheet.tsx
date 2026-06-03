"use client";

import * as React from "react";
import { ExternalLink, MessageSquareText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { AdminChatMessageCursor } from "@/lib/admin-chat-messages";
import { cn } from "@/lib/utils";
import { useAdminChatMessages } from "@/lib/helpers/use-admin-chat-messages";
import {
  formatBookingDateTime,
  getBookingAssetTitle,
  getBookingOwnerId,
  getBookingOwnerName,
  getBookingRenterId,
  getBookingRenterName,
  type AdminBooking,
  type AdminBookingMessage,
} from "@/lib/admin-bookings";

import {
  fetchAdminBookingMessagesPage,
  listenAdminBookingMessagesPage,
} from "../data/booking-queries";

type BookingChatSheetProps = {
  booking: AdminBooking;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function BookingChatSheet({
  booking,
  onOpenChange,
  open,
}: BookingChatSheetProps) {
  const chatId = booking.chatId;
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const didScrollToLatestRef = React.useRef(false);
  const listenLatestPage = React.useCallback(
    ({
      onError,
      onNext,
    }: {
      onError: (error: Error) => void;
      onNext: Parameters<typeof listenAdminBookingMessagesPage>[0]["onNext"];
    }) => {
      if (!chatId) return () => {};
      return listenAdminBookingMessagesPage({ chatId, onError, onNext });
    },
    [chatId],
  );
  const fetchOlderPage = React.useCallback(
    (cursor: AdminChatMessageCursor) =>
      fetchAdminBookingMessagesPage({ chatId: chatId ?? "", cursor }),
    [chatId],
  );
  const {
    error,
    hasMore,
    loadOlder,
    loading,
    loadingMore,
    messages,
  } = useAdminChatMessages<AdminBookingMessage>({
    enabled: open && Boolean(chatId),
    fetchOlderPage,
    listenLatestPage,
  });

  const loadOlderPreservingScroll = React.useCallback(async () => {
    const scrollElement = scrollRef.current;
    const previousHeight = scrollElement?.scrollHeight ?? 0;
    const previousTop = scrollElement?.scrollTop ?? 0;
    const loaded = await loadOlder();

    if (!loaded || !scrollElement) return;
    requestAnimationFrame(() => {
      scrollElement.scrollTop =
        scrollElement.scrollHeight - previousHeight + previousTop;
    });
  }, [loadOlder]);

  const handleMessagesScroll = React.useCallback(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || scrollElement.scrollTop > 80) return;
    void loadOlderPreservingScroll();
  }, [loadOlderPreservingScroll]);

  React.useEffect(() => {
    didScrollToLatestRef.current = false;
  }, [chatId, open]);

  React.useEffect(() => {
    if (!open || loading || didScrollToLatestRef.current || !messages.length) {
      return;
    }
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;
    scrollElement.scrollTop = scrollElement.scrollHeight;
    didScrollToLatestRef.current = true;
  }, [loading, messages.length, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader className="pr-12">
          <SheetTitle>Booking chat</SheetTitle>
          <SheetDescription>
            {getBookingAssetTitle(booking)} - {chatId ?? "No chat ID"}
          </SheetDescription>
        </SheetHeader>

        <div
          className="grid flex-1 auto-rows-min gap-4 overflow-y-auto overflow-x-hidden px-4 pb-4"
          onScroll={handleMessagesScroll}
          ref={scrollRef}
        >
          <div className="grid min-w-0 gap-2 rounded-md border p-4 text-sm">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <span className="shrink-0 text-muted-foreground">Owner</span>
              <span className="min-w-0 flex-1 text-right [overflow-wrap:anywhere]">
                {getBookingOwnerName(booking)}
              </span>
            </div>
            <div className="flex min-w-0 items-center justify-between gap-3">
              <span className="shrink-0 text-muted-foreground">Renter</span>
              <span className="min-w-0 flex-1 text-right [overflow-wrap:anywhere]">
                {getBookingRenterName(booking)}
              </span>
            </div>
          </div>

          {!chatId ? (
            <EmptyChatState text="No chat is linked to this booking." />
          ) : loading ? (
            <EmptyChatState text="Loading chat messages..." />
          ) : error ? (
            <EmptyChatState text={error} />
          ) : messages.length ? (
            <div className="grid min-w-0 gap-3">
              {hasMore ? (
                <Button
                  disabled={loadingMore}
                  onClick={loadOlderPreservingScroll}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {loadingMore ? "Loading older messages..." : "Load older messages"}
                </Button>
              ) : null}
              {messages.map((message) => (
                <MessageBubble
                  booking={booking}
                  key={message.id}
                  message={message}
                />
              ))}
            </div>
          ) : (
            <EmptyChatState text="No messages in this chat yet." />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MessageBubble({
  booking,
  message,
}: {
  booking: AdminBooking;
  message: AdminBookingMessage;
}) {
  const sender = getSenderDetails(booking, message.senderId);
  const isSystem = sender.role === "System";
  const isOwner = sender.role === "Owner";
  const text = message.text ?? message.mediaUrl ?? "No message content";
  const isMedia = isMediaMessage(message);
  const mediaUrl = message.mediaUrl ?? message.text;

  return (
    <div
      className={cn(
        "flex",
        isSystem ? "justify-center" : isOwner ? "justify-start" : "justify-end",
      )}
    >
      <div
        className={cn(
        "grid max-w-[82%] gap-2 rounded-md border p-3 text-sm [overflow-wrap:anywhere]",
          isSystem && "max-w-full bg-muted text-center",
          isOwner && "bg-background",
          sender.role === "Renter" && "border-primary/30 bg-primary/5",
        )}
      >
        <div
          className={cn(
            "flex flex-wrap items-center gap-2",
            isSystem && "justify-center",
          )}
        >
          <span className="font-medium">{sender.label}</span>
          {message.type ? (
            <Badge className="font-normal" variant="outline">
              {message.type}
            </Badge>
          ) : null}
        </div>

        {isMedia && mediaUrl ? (
          <a
            className="inline-flex items-center gap-1 break-all text-primary underline-offset-4 hover:underline"
            href={mediaUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open media <ExternalLink className="size-3.5 shrink-0" />
          </a>
        ) : (
          <p className="whitespace-pre-wrap break-words text-muted-foreground">
            {text}
          </p>
        )}

        <span className="text-xs text-muted-foreground">
          {formatBookingDateTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
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

function getSenderDetails(booking: AdminBooking, senderId: string | null) {
  if (!senderId) {
    return { label: "System", role: "System" as const };
  }

  if (senderId === getBookingOwnerId(booking)) {
    return { label: getBookingOwnerName(booking), role: "Owner" as const };
  }

  if (senderId === getBookingRenterId(booking)) {
    return { label: getBookingRenterName(booking), role: "Renter" as const };
  }

  return { label: senderId, role: "Unknown" as const };
}

function isMediaMessage(message: AdminBookingMessage) {
  return ["image", "video"].includes(message.type?.toLowerCase() ?? "");
}
