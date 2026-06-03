"use client";

import * as React from "react";
import { Lock, MessageCircle, Send, Unlock } from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { getUserDisplayName, type AdminUser } from "@/lib/admin-users";

import { useUserSupportChat } from "../hooks/use-user-support-chat";

type UserSupportChatSheetProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  user: AdminUser;
};

export function UserSupportChatSheet({
  onOpenChange,
  open,
  user,
}: UserSupportChatSheetProps) {
  const [message, setMessage] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const didScrollToLatestRef = React.useRef(false);
  const {
    chat,
    createChat,
    error,
    hasMore,
    loadOlder,
    loading,
    loadingMore,
    messages,
    sendMessage,
    setClosed,
    submitting,
  } = useUserSupportChat({ open, userId: user.uid });
  const displayName = getUserDisplayName(user);
  const isClosed = chat?.status === "Archived";

  React.useEffect(() => {
    if (!open) {
      setMessage("");
    }
  }, [open]);

  React.useEffect(() => {
    didScrollToLatestRef.current = false;
  }, [chat?.chatId, open]);

  React.useEffect(() => {
    if (!open || loading || didScrollToLatestRef.current || !messages.length) {
      return;
    }
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;
    scrollElement.scrollTop = scrollElement.scrollHeight;
    didScrollToLatestRef.current = true;
  }, [loading, messages.length, open]);

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

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    const sent = await sendMessage(trimmed);
    if (sent) {
      setMessage("");
    }
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader className="pr-12">
          <SheetTitle>Lend Support chat</SheetTitle>
          <SheetDescription className="truncate">
            {displayName} · {user.uid}
          </SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-4 overflow-hidden px-4 pb-4">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-md border p-3 text-sm">
            <div className="min-w-0">
              <p className="font-medium">General support</p>
              <p className="truncate text-xs text-muted-foreground">
                {chat?.chatId ?? "No support chat created yet"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {chat ? <StatusBadge value={chat.status} /> : null}
              {chat ? (
                <Button
                  disabled={submitting}
                  onClick={() => setClosed(!isClosed)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {isClosed ? <Unlock className="size-4" /> : <Lock className="size-4" />}
                  {isClosed ? "Reopen" : "Close"}
                </Button>
              ) : null}
            </div>
          </div>

          <div
            className="min-h-0 overflow-y-auto rounded-md border"
            onScroll={handleMessagesScroll}
            ref={scrollRef}
          >
            {loading ? (
              <EmptyChatState text="Loading support chat..." />
            ) : error ? (
              <EmptyChatState destructive text={error} />
            ) : !chat ? (
              <div className="grid min-h-80 place-items-center gap-4 p-6 text-center">
                <div className="grid gap-2">
                  <MessageCircle className="mx-auto size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No general support chat exists for this user.
                  </p>
                </div>
                <Button
                  disabled={submitting}
                  onClick={createChat}
                  type="button"
                >
                  <MessageCircle className="size-4" />
                  Create support chat
                </Button>
              </div>
            ) : messages.length ? (
              <div className="grid gap-3 p-4">
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
                {messages.map((item) => {
                  const fromSystem = item.type === "system" || !item.senderId;
                  const fromSupport = !fromSystem && item.senderId !== user.uid;

                  return (
                    <div
                      className={`grid max-w-[85%] gap-1 rounded-md border p-3 text-sm ${
                        fromSupport
                          ? "ml-auto bg-primary text-primary-foreground"
                          : fromSystem
                            ? "mx-auto bg-muted text-muted-foreground"
                            : "mr-auto bg-background"
                      }`}
                      key={item.id}
                    >
                      <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">
                        {item.text}
                      </p>
                      <span className="text-xs opacity-75">
                        {fromSystem
                          ? "System"
                          : fromSupport
                            ? "Lend Support"
                            : displayName}{" "}
                        · {formatDateTime(item.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyChatState text="No messages in this support chat yet." />
            )}
          </div>

          <form className="grid gap-2" onSubmit={handleSend}>
            <Textarea
              disabled={!chat || isClosed || submitting}
              maxLength={2000}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={
                !chat
                  ? "Create a support chat to send messages"
                  : isClosed
                    ? "Support chat is closed"
                    : "Write a support message"
              }
              value={message}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {message.length}/2000
              </p>
              <Button
                disabled={!chat || isClosed || submitting || !message.trim()}
                type="submit"
              >
                <Send className="size-4" />
                Send
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EmptyChatState({
  destructive,
  text,
}: {
  destructive?: boolean;
  text: string;
}) {
  return (
    <div
      className={`grid min-h-80 place-items-center p-6 text-center text-sm ${
        destructive ? "text-destructive" : "text-muted-foreground"
      }`}
    >
      {text}
    </div>
  );
}

function formatDateTime(value: Date | null) {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}
