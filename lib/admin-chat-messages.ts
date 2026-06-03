"use client";

import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import {
  getFirebaseFirestore,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";

export const ADMIN_CHAT_MESSAGE_PAGE_SIZE = 50;

export type AdminChatMessageCursor = QueryDocumentSnapshot<DocumentData> | null;

export type AdminChatMessagePage<TMessage> = {
  hasMore: boolean;
  items: TMessage[];
  lastCursor: AdminChatMessageCursor;
};

type MessageMapper<TMessage> = (
  snapshot: QueryDocumentSnapshot<DocumentData>,
) => TMessage;

export async function fetchAdminChatMessagePage<TMessage>({
  chatId,
  cursor = null,
  mapMessage,
  pageSize = ADMIN_CHAT_MESSAGE_PAGE_SIZE,
}: {
  chatId: string;
  cursor?: AdminChatMessageCursor;
  mapMessage: MessageMapper<TMessage>;
  pageSize?: number;
}): Promise<AdminChatMessagePage<TMessage>> {
  assertFirebaseConfig();

  const snapshot = await getDocs(
    query(
      collection(getFirebaseFirestore(), "chats", chatId, "messages"),
      orderBy("createdAt", "desc"),
      ...(cursor ? [startAfter(cursor)] : []),
      limit(pageSize),
    ),
  );

  return mapChatMessagePage(snapshot.docs, mapMessage, pageSize);
}

export function listenAdminChatMessagePage<TMessage>({
  chatId,
  mapMessage,
  onError,
  onNext,
  pageSize = ADMIN_CHAT_MESSAGE_PAGE_SIZE,
}: {
  chatId: string;
  mapMessage: MessageMapper<TMessage>;
  onError: (error: Error) => void;
  onNext: (page: AdminChatMessagePage<TMessage>) => void;
  pageSize?: number;
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
      orderBy("createdAt", "desc"),
      limit(pageSize),
    ),
    (snapshot) => onNext(mapChatMessagePage(snapshot.docs, mapMessage, pageSize)),
    onError,
  );
}

function mapChatMessagePage<TMessage>(
  docs: QueryDocumentSnapshot<DocumentData>[],
  mapMessage: MessageMapper<TMessage>,
  pageSize: number,
): AdminChatMessagePage<TMessage> {
  return {
    hasMore: docs.length >= pageSize,
    items: docs.map(mapMessage).reverse(),
    lastCursor: docs.at(-1) ?? null,
  };
}

function assertFirebaseConfig() {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }
}
