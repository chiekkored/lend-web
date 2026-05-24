import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";

import {
  mapAdminBooking,
  mapAdminBookingMessage,
  type AdminBooking,
  type AdminBookingMessage,
} from "@/lib/admin-bookings";
import {
  getFirebaseFirestore,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";

export const bookingQueryKeys = {
  root: ["admin", "bookings"] as const,
  detail: (
    bookingId: string | null | undefined,
    assetId: string | null | undefined,
  ) => [...bookingQueryKeys.root, assetId ?? "missing", bookingId ?? "missing"] as const,
  messages: (chatId: string | null | undefined) =>
    [...bookingQueryKeys.root, "messages", chatId ?? "missing"] as const,
};

export async function fetchAdminBookings(): Promise<AdminBooking[]> {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }

  const db = getFirebaseFirestore();
  const bookingsSnapshot = await getDocs(
    query(collection(db, "bookings"), orderBy("createdAt", "desc")),
  );

  return bookingsSnapshot.docs.map((snapshot) =>
    mapAdminBooking({
      assetId: snapshot.data().asset?.id ?? "unknown",
      snapshot,
    }),
  );
}

export async function fetchAdminBooking({
  assetId,
  bookingId,
}: {
  assetId: string | null;
  bookingId: string;
}): Promise<AdminBooking | null> {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }

  const db = getFirebaseFirestore();

  const snapshot = await getDoc(doc(db, "bookings", bookingId));
  if (snapshot.exists()) {
    return mapAdminBooking({
      assetId: snapshot.data().asset?.id ?? assetId ?? "unknown",
      snapshot: snapshot as QueryDocumentSnapshot<DocumentData>,
    });
  }

  return null;
}

export async function fetchAdminBookingMessages(
  chatId: string,
): Promise<AdminBookingMessage[]> {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }

  const db = getFirebaseFirestore();
  const messagesSnapshot = await getDocs(
    query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc"),
    ),
  );

  return messagesSnapshot.docs.map(mapAdminBookingMessage);
}

export function listenAdminBookingMessages({
  chatId,
  onError,
  onNext,
}: {
  chatId: string;
  onError: (error: Error) => void;
  onNext: (messages: AdminBookingMessage[]) => void;
}) {
  if (!hasFirebaseConfig) {
    onError(
      new Error(
        `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
      ),
    );
    return () => {};
  }

  const db = getFirebaseFirestore();
  return onSnapshot(
    query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc"),
    ),
    (snapshot) => onNext(snapshot.docs.map(mapAdminBookingMessage)),
    onError,
  );
}
