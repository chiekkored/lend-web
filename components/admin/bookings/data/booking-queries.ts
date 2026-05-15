import { collection, collectionGroup, doc, getDoc, getDocs, orderBy, query, where, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";

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
  const assetsSnapshot = await getDocs(collection(db, "assets"));
  const bookingGroups = await Promise.all(
    assetsSnapshot.docs
      .filter((assetDoc) => assetDoc.data().isDeleted !== true)
      .map(async (assetDoc) => {
        const bookingsSnapshot = await getDocs(
          collection(db, "assets", assetDoc.id, "bookings"),
        );

        return bookingsSnapshot.docs.map((snapshot) =>
          mapAdminBooking({ assetId: assetDoc.id, snapshot }),
        );
      }),
  );

  return bookingGroups.flat();
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
