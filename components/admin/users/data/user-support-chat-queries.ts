"use client";

import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

import {
  getFirebaseFirestore,
  getFirebaseFunctions,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";

export type UserSupportChatStatus = "Active" | "Archived" | string;

export type AdminUserSupportChat = {
  chatId: string;
  createdAt: Date | null;
  lastMessage: string | null;
  lastMessageDate: Date | null;
  status: UserSupportChatStatus;
};

export type AdminUserSupportMessage = {
  id: string;
  text: string;
  senderId: string | null;
  type: string | null;
  createdAt: Date | null;
};

type SupportChatResponse = {
  chat?: unknown;
};

type SupportChatActionResponse = {
  chat?: unknown;
  chatId?: unknown;
  messageId?: unknown;
  status?: unknown;
};

export const userSupportChatQueryKeys = {
  root: ["admin", "users", "supportChat"] as const,
  chat: (userId: string | null | undefined) =>
    [...userSupportChatQueryKeys.root, userId ?? "missing"] as const,
  messages: (chatId: string | null | undefined) =>
    [...userSupportChatQueryKeys.root, "messages", chatId ?? "missing"] as const,
};

export async function fetchUserSupportChat(userId: string) {
  assertFirebaseConfig();
  const callable = httpsCallable(getFirebaseFunctions(), "manageUserSupportChat");
  const result = await callable({ action: "get", userId });
  const data = result.data as SupportChatResponse;

  return mapSupportChat(data.chat);
}

export async function createUserSupportChat(userId: string) {
  assertFirebaseConfig();
  const callable = httpsCallable(getFirebaseFunctions(), "manageUserSupportChat");
  const result = await callable({ action: "create", userId });
  const data = result.data as SupportChatActionResponse;
  const chat = mapSupportChat(data.chat);

  if (!chat) {
    throw new Error("Support chat was not returned.");
  }

  return chat;
}

export async function sendUserSupportMessage({
  chatId,
  text,
  userId,
}: {
  chatId: string;
  text: string;
  userId: string;
}) {
  assertFirebaseConfig();
  const callable = httpsCallable(getFirebaseFunctions(), "manageUserSupportChat");
  const result = await callable({ action: "send", chatId, text, userId });
  const data = result.data as SupportChatActionResponse;

  return typeof data.messageId === "string" ? data.messageId : null;
}

export async function updateUserSupportChatStatus({
  action,
  chatId,
  userId,
}: {
  action: "close" | "reopen";
  chatId: string;
  userId: string;
}) {
  assertFirebaseConfig();
  const callable = httpsCallable(getFirebaseFunctions(), "manageUserSupportChat");
  const result = await callable({ action, chatId, userId });
  const data = result.data as SupportChatActionResponse;

  return typeof data.status === "string" ? data.status : null;
}

export async function fetchUserSupportMessages(chatId: string) {
  assertFirebaseConfig();
  const snapshot = await getDocs(
    query(
      collection(getFirebaseFirestore(), "chats", chatId, "messages"),
      orderBy("createdAt", "asc"),
      limit(100),
    ),
  );

  return snapshot.docs.map(mapSupportMessage);
}

export function listenUserSupportMessages({
  chatId,
  onError,
  onNext,
}: {
  chatId: string;
  onError: (error: Error) => void;
  onNext: (messages: AdminUserSupportMessage[]) => void;
}) {
  if (!hasFirebaseConfig) {
    onError(
      new Error(
        `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
      ),
    );
    return () => {};
  }

  return onSnapshot(
    query(
      collection(getFirebaseFirestore(), "chats", chatId, "messages"),
      orderBy("createdAt", "asc"),
      limit(100),
    ),
    (snapshot) => onNext(snapshot.docs.map(mapSupportMessage)),
    onError,
  );
}

function assertFirebaseConfig() {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }
}

function mapSupportChat(value: unknown): AdminUserSupportChat | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const data = value as Record<string, unknown>;
  const chatId = asString(data.chatId);

  if (!chatId) {
    return null;
  }

  return {
    chatId,
    createdAt: toDate(data.createdAt),
    lastMessage: asString(data.lastMessage),
    lastMessageDate: toDate(data.lastMessageDate),
    status: asString(data.status) ?? "Active",
  };
}

function mapSupportMessage(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): AdminUserSupportMessage {
  const data = snapshot.data();

  return {
    id: asString(data.id) ?? snapshot.id,
    text: asString(data.text) ?? "",
    senderId: asString(data.senderId),
    type: asString(data.type),
    createdAt: toDate(data.createdAt),
  };
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function toDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value &&
    typeof value.seconds === "number"
  ) {
    return new Date(value.seconds * 1000);
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "_seconds" in value &&
    typeof value._seconds === "number"
  ) {
    return new Date(value._seconds * 1000);
  }

  return null;
}
