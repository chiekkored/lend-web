"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createUserSupportChat,
  fetchUserSupportChat,
  listenUserSupportMessages,
  sendUserSupportMessage,
  updateUserSupportChatStatus,
  type AdminUserSupportChat,
  type AdminUserSupportMessage,
  userSupportChatQueryKeys,
} from "../data/user-support-chat-queries";

export function useUserSupportChat({
  open,
  userId,
}: {
  open: boolean;
  userId: string;
}) {
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<AdminUserSupportMessage[]>([]);
  const [messagesError, setMessagesError] = React.useState<string | null>(null);
  const [messagesLoading, setMessagesLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const chatQuery = useQuery({
    enabled: open,
    queryFn: () => fetchUserSupportChat(userId),
    queryKey: userSupportChatQueryKeys.chat(userId),
  });
  const chatId = chatQuery.data?.chatId ?? null;

  const resetError = React.useCallback(() => setError(null), []);

  React.useEffect(() => {
    if (!open || !chatId) {
      setMessages([]);
      setMessagesError(null);
      setMessagesLoading(false);
      return;
    }

    setMessagesLoading(true);
    setMessagesError(null);
    const unsubscribe = listenUserSupportMessages({
      chatId,
      onError: (nextError) => {
        console.error("[user-support-chat] live messages failed", nextError);
        setMessagesError("Unable to load support messages.");
        setMessagesLoading(false);
      },
      onNext: (nextMessages) => {
        setMessages(nextMessages);
        setMessagesLoading(false);
      },
    });

    return unsubscribe;
  }, [chatId, open]);

  async function createChat() {
    return runChatAction(async () => {
      const chat = await createUserSupportChat(userId);
      queryClient.setQueryData(userSupportChatQueryKeys.chat(userId), chat);
      return chat;
    }, "Unable to create support chat.");
  }

  async function sendMessage(text: string) {
    if (!chatId) {
      setError("Create a support chat before sending a message.");
      return false;
    }

    const sent = await runChatAction(async () => {
      await sendUserSupportMessage({ chatId, text, userId });
      await queryClient.invalidateQueries({
        queryKey: userSupportChatQueryKeys.chat(userId),
      });
      return true;
    }, "Unable to send support message.");

    return Boolean(sent);
  }

  async function setClosed(closed: boolean) {
    if (!chatId) {
      setError("Create a support chat before changing its status.");
      return false;
    }

    const updated = await runChatAction(async () => {
      const status = await updateUserSupportChatStatus({
        action: closed ? "close" : "reopen",
        chatId,
        userId,
      });
      queryClient.setQueryData<AdminUserSupportChat | null>(
        userSupportChatQueryKeys.chat(userId),
        (current) =>
          current
            ? {
                ...current,
                status: status ?? (closed ? "Archived" : "Active"),
              }
            : current,
      );
      return true;
    }, closed ? "Unable to close support chat." : "Unable to reopen support chat.");

    return Boolean(updated);
  }

  async function runChatAction<T>(
    action: () => Promise<T>,
    fallbackMessage: string,
  ) {
    setError(null);
    setSubmitting(true);

    try {
      return await action();
    } catch (err) {
      console.error("[user-support-chat]", err);
      setError(fallbackMessage);
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  const queryError =
    (chatQuery.error instanceof Error
      ? chatQuery.error.message
      : chatQuery.error
        ? "Unable to load support chat."
        : null) ?? messagesError;

  return {
    chat: chatQuery.data ?? null,
    createChat,
    error: error ?? queryError,
    loading: chatQuery.isLoading || messagesLoading,
    messages,
    refetch: chatQuery.refetch,
    resetError,
    sendMessage,
    setClosed,
    submitting,
  };
}
