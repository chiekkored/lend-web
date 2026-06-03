import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import {
  mapAdminBooking,
  mapAdminBookingMessage,
  type AdminBooking,
  type AdminBookingMessage,
} from "@/lib/admin-bookings";
import {
  mapAdminListing,
  type AdminListing,
} from "@/lib/admin-listings";
import {
  mapAdminReport,
  type AdminReport,
  type AdminReportSection,
} from "@/lib/admin-reports";
import { mapAdminUser, type AdminUser } from "@/lib/admin-users";
import {
  getFirebaseFirestore,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";
import {
  fetchAdminChatMessagePage,
  listenAdminChatMessagePage,
  type AdminChatMessageCursor,
  type AdminChatMessagePage,
} from "@/lib/admin-chat-messages";
import type { AdminCursor, AdminCursorPage } from "@/lib/helpers/use-admin-cursor-pagination";

export const reportQueryKeys = {
  root: ["admin", "reports"] as const,
  live: ["admin", "reports", "live"] as const,
  section: (section: AdminReportSection) =>
    [...reportQueryKeys.root, section] as const,
  user: (uid: string | null | undefined) =>
    [...reportQueryKeys.root, "user", uid ?? "missing"] as const,
  asset: (assetId: string | null | undefined) =>
    [...reportQueryKeys.root, "asset", assetId ?? "missing"] as const,
  booking: (
    bookingId: string | null | undefined,
    assetId: string | null | undefined,
  ) => [...reportQueryKeys.root, "booking", assetId ?? "missing", bookingId ?? "missing"] as const,
  chat: (chatId: string | null | undefined) =>
    [...reportQueryKeys.root, "chat", chatId ?? "missing"] as const,
  messages: (chatId: string | null | undefined) =>
    [...reportQueryKeys.root, "messages", chatId ?? "missing"] as const,
};

export const REPORTS_LIVE_LIMIT = 50;

export async function fetchAdminReports(): Promise<AdminReport[]> {
  assertFirebaseConfig();

  const snapshot = await getDocs(
    query(collection(getFirebaseFirestore(), "reports"), orderBy("createdAt", "desc")),
  );

  return snapshot.docs.map(mapAdminReport);
}

export async function fetchAdminReportsPage({
  cursor,
  pageSize,
}: {
  cursor: AdminCursor;
  pageSize: number;
}): Promise<AdminCursorPage<AdminReport>> {
  assertFirebaseConfig();

  const reportsQuery = cursor
    ? query(
        collection(getFirebaseFirestore(), "reports"),
        orderBy("createdAt", "desc"),
        startAfter(cursor),
        limit(pageSize),
      )
    : query(
        collection(getFirebaseFirestore(), "reports"),
        orderBy("createdAt", "desc"),
        limit(pageSize),
      );
  const snapshot = await getDocs(reportsQuery);

  return {
    hasMore: snapshot.docs.length === pageSize,
    items: snapshot.docs.map(mapAdminReport),
    lastCursor: snapshot.docs.at(-1) ?? null,
  };
}

export function listenAdminReports({
  onError,
  onNext,
  pageSize = REPORTS_LIVE_LIMIT,
}: {
  onError: (error: Error) => void;
  onNext: (page: AdminCursorPage<AdminReport>) => void;
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
      collection(getFirebaseFirestore(), "reports"),
      orderBy("createdAt", "desc"),
      limit(pageSize),
    ),
    (snapshot) =>
      onNext({
        hasMore: snapshot.docs.length === pageSize,
        items: snapshot.docs.map(mapAdminReport),
        lastCursor: snapshot.docs.at(-1) ?? null,
      }),
    onError,
  );
}

export async function fetchAdminReportUser(uid: string): Promise<AdminUser | null> {
  assertFirebaseConfig();

  const snapshot = await getDoc(doc(getFirebaseFirestore(), "users", uid));
  if (!snapshot.exists()) {
    return null;
  }

  return mapAdminUser(snapshot as QueryDocumentSnapshot<DocumentData>);
}

export async function fetchAdminReportAsset(assetId: string): Promise<AdminListing | null> {
  assertFirebaseConfig();

  const snapshot = await getDoc(doc(getFirebaseFirestore(), "assets", assetId));
  if (!snapshot.exists()) {
    return null;
  }

  return mapAdminListing(snapshot as QueryDocumentSnapshot<DocumentData>);
}

export async function fetchAdminReportBooking({
  assetId,
  bookingId,
}: {
  assetId: string | null;
  bookingId: string;
}): Promise<AdminBooking | null> {
  assertFirebaseConfig();

  const db = getFirebaseFirestore();

  if (assetId) {
    const snapshot = await getDoc(doc(db, "assets", assetId, "bookings", bookingId));
    if (snapshot.exists()) {
      return mapAdminBooking({
        assetId,
        snapshot: snapshot as QueryDocumentSnapshot<DocumentData>,
      });
    }
  }

  const byFieldSnapshot = await getDocs(
    query(collectionGroup(db, "bookings"), where("id", "==", bookingId)),
  );
  const byFieldMatch = byFieldSnapshot.docs[0];
  if (byFieldMatch) {
    return mapAdminBooking({
      assetId: byFieldMatch.ref.parent.parent?.id ?? assetId ?? "unknown",
      snapshot: byFieldMatch,
    });
  }

  const assetsSnapshot = await getDocs(collection(db, "assets"));
  for (const assetDoc of assetsSnapshot.docs) {
    const bookingSnapshot = await getDoc(
      doc(db, "assets", assetDoc.id, "bookings", bookingId),
    );
    if (bookingSnapshot.exists()) {
      return mapAdminBooking({
        assetId: assetDoc.id,
        snapshot: bookingSnapshot as QueryDocumentSnapshot<DocumentData>,
      });
    }
  }

  return null;
}

export async function fetchAdminReportChat(chatId: string) {
  assertFirebaseConfig();

  const snapshot = await getDoc(doc(getFirebaseFirestore(), "chats", chatId));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function fetchAdminReportMessages(
  chatId: string,
): Promise<AdminBookingMessage[]> {
  const page = await fetchAdminReportMessagesPage({ chatId });
  return page.items;
}

export function fetchAdminReportMessagesPage({
  chatId,
  cursor = null,
  pageSize,
}: {
  chatId: string;
  cursor?: AdminChatMessageCursor;
  pageSize?: number;
}): Promise<AdminChatMessagePage<AdminBookingMessage>> {
  return fetchAdminChatMessagePage({
    chatId,
    cursor,
    mapMessage: mapAdminBookingMessage,
    pageSize,
  });
}

export function listenAdminReportMessagesPage({
  chatId,
  onError,
  onNext,
  pageSize,
}: {
  chatId: string;
  onError: (error: Error) => void;
  onNext: (page: AdminChatMessagePage<AdminBookingMessage>) => void;
  pageSize?: number;
}) {
  return listenAdminChatMessagePage({
    chatId,
    mapMessage: mapAdminBookingMessage,
    onError,
    onNext,
    pageSize,
  });
}

function assertFirebaseConfig() {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }
}
