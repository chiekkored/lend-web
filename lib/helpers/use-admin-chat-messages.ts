"use client";

import * as React from "react";

import type {
  AdminChatMessageCursor,
  AdminChatMessagePage,
} from "@/lib/admin-chat-messages";

type UseAdminChatMessagesOptions<TMessage extends { id: string }> = {
  enabled: boolean;
  fetchOlderPage: (cursor: AdminChatMessageCursor) => Promise<AdminChatMessagePage<TMessage>>;
  listenLatestPage: (input: {
    onError: (error: Error) => void;
    onNext: (page: AdminChatMessagePage<TMessage>) => void;
  }) => () => void;
};

export function useAdminChatMessages<TMessage extends { id: string }>({
  enabled,
  fetchOlderPage,
  listenLatestPage,
}: UseAdminChatMessagesOptions<TMessage>) {
  const [latestMessages, setLatestMessages] = React.useState<TMessage[]>([]);
  const [olderMessages, setOlderMessages] = React.useState<TMessage[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(enabled);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(false);
  const [lastCursor, setLastCursor] = React.useState<AdminChatMessageCursor>(null);

  React.useEffect(() => {
    if (!enabled) {
      setLatestMessages([]);
      setOlderMessages([]);
      setError(null);
      setLoading(false);
      setLoadingMore(false);
      setHasMore(false);
      setLastCursor(null);
      return;
    }

    setLatestMessages([]);
    setOlderMessages([]);
    setError(null);
    setLoading(true);
    setLoadingMore(false);
    setHasMore(false);
    setLastCursor(null);

    return listenLatestPage({
      onError: (nextError) => {
        console.error("[admin-chat-messages] live page failed", nextError);
        setError("Unable to load chat messages.");
        setLoading(false);
      },
      onNext: (page) => {
        const latestIds = new Set(page.items.map((message) => message.id));
        setLatestMessages(page.items);
        setOlderMessages((current) => {
          const nextOlderMessages = current.filter(
            (message) => !latestIds.has(message.id),
          );
          if (!nextOlderMessages.length) {
            setLastCursor(page.lastCursor);
          } else {
            setLastCursor((currentCursor) => currentCursor ?? page.lastCursor);
          }
          return nextOlderMessages;
        });
        setHasMore(page.hasMore);
        setLoading(false);
      },
    });
  }, [enabled, listenLatestPage]);

  const loadOlder = React.useCallback(async () => {
    if (!enabled || loading || loadingMore || !hasMore || !lastCursor) {
      return false;
    }

    setLoadingMore(true);
    setError(null);

    try {
      const page = await fetchOlderPage(lastCursor);
      setOlderMessages((current) => mergeMessages(current, page.items));
      setLastCursor(page.lastCursor);
      setHasMore(page.hasMore);
      return page.items.length > 0;
    } catch (nextError) {
      console.error("[admin-chat-messages] older page failed", nextError);
      setError("Unable to load older chat messages.");
      return false;
    } finally {
      setLoadingMore(false);
    }
  }, [enabled, fetchOlderPage, hasMore, lastCursor, loading, loadingMore]);

  const messages = React.useMemo(
    () => mergeMessages(olderMessages, latestMessages),
    [latestMessages, olderMessages],
  );

  return {
    error,
    hasMore,
    loadOlder,
    loading,
    loadingMore,
    messages,
  };
}

function mergeMessages<TMessage extends { id: string }>(
  older: TMessage[],
  newer: TMessage[],
) {
  const byId = new Map<string, TMessage>();
  for (const message of older) byId.set(message.id, message);
  for (const message of newer) byId.set(message.id, message);
  return Array.from(byId.values());
}
