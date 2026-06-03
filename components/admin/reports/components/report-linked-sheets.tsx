"use client";

import { useQuery } from "@tanstack/react-query";
import type { DocumentData } from "firebase/firestore";
import { ExternalLink, MessageSquareText } from "lucide-react";
import * as React from "react";
import type { ReactNode } from "react";

import {
  CachedBookingViewSheet,
  CachedListingViewSheet,
  CachedUserViewSheet,
} from "@/components/admin/entity-detail-sheets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  formatBookingDateTime,
  type AdminBookingMessage,
} from "@/lib/admin-bookings";
import type { AdminChatMessageCursor } from "@/lib/admin-chat-messages";
import { useAdminChatMessages } from "@/lib/helpers/use-admin-chat-messages";

import {
  fetchAdminReportChat,
  fetchAdminReportMessagesPage,
  listenAdminReportMessagesPage,
  reportQueryKeys,
} from "../data/report-queries";

type SheetProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function ReportUserSheet({
  onOpenChange,
  open,
  uid,
}: SheetProps & { role: string; uid: string | null }) {
  return <CachedUserViewSheet onOpenChange={onOpenChange} open={open} uid={uid} />;
}

export function ReportAssetSheet({
  assetId,
  onOpenChange,
  open,
}: SheetProps & { assetId: string | null }) {
  return <CachedListingViewSheet assetId={assetId} onOpenChange={onOpenChange} open={open} />;
}

export function ReportBookingSheet({
  assetId,
  bookingId,
  onOpenChange,
  open,
}: SheetProps & { assetId: string | null; bookingId: string | null }) {
  return (
    <CachedBookingViewSheet
      assetId={assetId}
      bookingId={bookingId}
      onOpenChange={onOpenChange}
      open={open}
    />
  );
}

export function ReportChatSheet({
  chatId,
  onOpenChange,
  open,
}: SheetProps & { chatId: string | null }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const didScrollToLatestRef = React.useRef(false);
  const chatQuery = useQuery({
    enabled: open && Boolean(chatId),
    queryFn: () => fetchAdminReportChat(chatId ?? ""),
    queryKey: reportQueryKeys.chat(chatId),
  });
  const listenLatestPage = React.useCallback(
    ({
      onError,
      onNext,
    }: {
      onError: (error: Error) => void;
      onNext: Parameters<typeof listenAdminReportMessagesPage>[0]["onNext"];
    }) => {
      if (!chatId) return () => {};
      return listenAdminReportMessagesPage({ chatId, onError, onNext });
    },
    [chatId],
  );
  const fetchOlderPage = React.useCallback(
    (cursor: AdminChatMessageCursor) =>
      fetchAdminReportMessagesPage({ chatId: chatId ?? "", cursor }),
    [chatId],
  );
  const {
    error: messagesError,
    hasMore,
    loadOlder,
    loading: messagesLoading,
    loadingMore,
    messages,
  } = useAdminChatMessages<AdminBookingMessage>({
    enabled: open && Boolean(chatId),
    fetchOlderPage,
    listenLatestPage,
  });

  const error =
    getQueryError(chatQuery.error, "Unable to load chat.") ??
    messagesError;

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
    if (!open || messagesLoading || didScrollToLatestRef.current || !messages.length) {
      return;
    }
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;
    scrollElement.scrollTop = scrollElement.scrollHeight;
    didScrollToLatestRef.current = true;
  }, [messages.length, messagesLoading, open]);

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader className="pr-12">
          <SheetTitle>Chat</SheetTitle>
          <SheetDescription>{chatId ?? "No chat ID"}</SheetDescription>
        </SheetHeader>
        <EntityBody
          emptyText="No chat is linked to this report."
          errorText={error}
          loading={chatQuery.isLoading || messagesLoading}
          missingText="Chat record was not found."
          onScroll={handleMessagesScroll}
          present={Boolean(chatQuery.data) || Boolean(messages.length)}
          bodyRef={scrollRef}
          requested={Boolean(chatId)}
        >
          <ChatDetails
            chat={chatQuery.data ?? null}
            hasMore={hasMore}
            loadingMore={loadingMore}
            messages={messages}
            onLoadOlder={loadOlderPreservingScroll}
          />
        </EntityBody>
      </SheetContent>
    </Sheet>
  );
}

function ChatDetails({
  chat,
  hasMore,
  loadingMore,
  messages,
  onLoadOlder,
}: {
  chat: DocumentData | null;
  hasMore: boolean;
  loadingMore: boolean;
  messages: AdminBookingMessage[];
  onLoadOlder: () => void;
}) {
  return (
    <div className="grid gap-4">
      {chat ? (
        <div className="grid gap-3 rounded-md border p-4 text-sm">
          <DetailRow label="Last message" value={asText(chat.lastMessage)} />
          <DetailRow label="Last sender" value={asText(chat.lastMessageSenderId)} />
          <DetailRow label="Booking ID" value={asText(chat.bookingId)} />
          <DetailRow label="Renter ID" value={asText(chat.renterId)} />
          <DetailRow label="Status" value={asText(chat.status)} />
        </div>
      ) : null}

      {messages.length ? (
        <div className="grid gap-3">
          {hasMore ? (
            <Button
              disabled={loadingMore}
              onClick={onLoadOlder}
              size="sm"
              type="button"
              variant="outline"
            >
              {loadingMore ? "Loading older messages..." : "Load older messages"}
            </Button>
          ) : null}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      ) : (
        <div className="grid min-h-40 place-items-center rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          <div className="grid justify-items-center gap-3">
            <MessageSquareText className="size-6" />
            <p>No messages in this chat.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: AdminBookingMessage }) {
  const text = message.text ?? message.mediaUrl ?? "No message content";
  const isMedia = ["image", "video"].includes(message.type?.toLowerCase() ?? "");
  const mediaUrl = message.mediaUrl ?? message.text;

  return (
    <div className="grid max-w-full gap-2 rounded-md border p-3 text-sm [overflow-wrap:anywhere]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{message.senderId ?? "Unknown sender"}</span>
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
  );
}

function EntityBody({
  children,
  emptyText,
  errorText,
  loading,
  missingText,
  bodyRef,
  onScroll,
  present,
  requested,
}: {
  children: ReactNode;
  emptyText: string;
  errorText: string | null;
  loading: boolean;
  missingText: string;
  bodyRef?: React.Ref<HTMLDivElement>;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
  present: boolean;
  requested: boolean;
}) {
  return (
    <div
      className="grid flex-1 auto-rows-min gap-5 overflow-y-auto overflow-x-hidden px-4 pb-4"
      onScroll={onScroll}
      ref={bodyRef}
    >
      {!requested ? (
        <EmptyState text={emptyText} />
      ) : loading ? (
        <EmptyState text="Loading details..." />
      ) : errorText ? (
        <EmptyState destructive text={errorText} />
      ) : present ? (
        children
      ) : (
        <EmptyState text={missingText} />
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
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

function EmptyState({
  destructive,
  text,
}: {
  destructive?: boolean;
  text: string;
}) {
  return (
    <div
      className={`grid min-h-48 place-items-center rounded-md border border-dashed p-6 text-center text-sm ${
        destructive ? "text-destructive" : "text-muted-foreground"
      }`}
    >
      {text}
    </div>
  );
}

function getQueryError(error: unknown, fallback: string) {
  if (!error) {
    return null;
  }

  return error instanceof Error ? error.message : fallback;
}

function asText(value: unknown) {
  return typeof value === "string" && value.trim() ? value : "Not set";
}
