import {
  collection,
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
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import {
  adminCancellationRequestStatuses,
  mapAdminBooking,
  mapAdminBookingMessage,
  type AdminBooking,
  type AdminBookingMessage,
  type AdminCancellationRequestStatusFilter,
} from "@/lib/admin-bookings";
import {
  getFirebaseFirestore,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";
import type { AdminCursorPage, AdminCursor } from "@/lib/helpers/use-admin-cursor-pagination";

export const bookingQueryKeys = {
  root: ["admin", "bookings"] as const,
  cancellations: ["admin", "bookings", "cancellations"] as const,
  pendingDamage: ["admin", "bookings", "pendingDamage"] as const,
  detail: (
    bookingId: string | null | undefined,
    assetId: string | null | undefined,
  ) => [...bookingQueryKeys.root, assetId ?? "missing", bookingId ?? "missing"] as const,
  messages: (chatId: string | null | undefined) =>
    [...bookingQueryKeys.root, "messages", chatId ?? "missing"] as const,
};

export const BOOKING_QUEUE_LIVE_LIMIT = 50;

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

export async function fetchAdminBookingsPage({
  cursor,
  pageSize,
}: {
  cursor: AdminCursor;
  pageSize: number;
}): Promise<AdminCursorPage<AdminBooking>> {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }

  const bookingsQuery = cursor
    ? query(
        collection(getFirebaseFirestore(), "bookings"),
        orderBy("createdAt", "desc"),
        startAfter(cursor),
        limit(pageSize),
      )
    : query(
        collection(getFirebaseFirestore(), "bookings"),
        orderBy("createdAt", "desc"),
        limit(pageSize),
      );
  const snapshot = await getDocs(bookingsQuery);

  return mapBookingPageSnapshot(snapshot.docs, pageSize);
}

export async function fetchCancellationBookingsPage({
  cursor,
  pageSize,
  statusFilter = "all",
}: {
  cursor: AdminCursor;
  pageSize: number;
  statusFilter?: AdminCancellationRequestStatusFilter;
}): Promise<AdminCursorPage<AdminBooking>> {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }

  const cancellationsCollection = collection(getFirebaseFirestore(), "bookings");
  const constraints = cancellationBookingQueryConstraints({
    cursor,
    pageSize,
    statusFilter,
  });
  const cancellationsQuery = query(cancellationsCollection, ...constraints);
  const snapshot = await getDocs(cancellationsQuery);

  return mapBookingPageSnapshot(snapshot.docs, pageSize);
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

export function listenCancellationBookings({
  onError,
  onNext,
  pageSize = BOOKING_QUEUE_LIVE_LIMIT,
  statusFilter = "all",
}: {
  onError: (error: Error) => void;
  onNext: (page: AdminCursorPage<AdminBooking>) => void;
  pageSize?: number;
  statusFilter?: AdminCancellationRequestStatusFilter;
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
      collection(getFirebaseFirestore(), "bookings"),
      ...cancellationBookingQueryConstraints({
        cursor: null,
        pageSize,
        statusFilter,
      }),
    ),
    (snapshot) =>
      onNext(mapBookingPageSnapshot(snapshot.docs, pageSize)),
    onError,
  );
}

function cancellationBookingQueryConstraints({
  cursor,
  pageSize,
  statusFilter,
}: {
  cursor: AdminCursor;
  pageSize: number;
  statusFilter: AdminCancellationRequestStatusFilter;
}): QueryConstraint[] {
  const statusConstraint =
    statusFilter === "all"
      ? where(
          "cancellationRequest.status",
          "in",
          [...adminCancellationRequestStatuses],
        )
      : where("cancellationRequest.status", "==", statusFilter);
  const constraints: QueryConstraint[] = [
    statusConstraint,
    orderBy("createdAt", "desc"),
  ];

  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  constraints.push(limit(pageSize));
  return constraints;
}

export function listenPendingDamageBookings({
  onError,
  onNext,
  pageSize = BOOKING_QUEUE_LIVE_LIMIT,
}: {
  onError: (error: Error) => void;
  onNext: (sourceIndex: number, page: AdminCursorPage<AdminBooking>) => void;
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

  const db = getFirebaseFirestore();
  const bookingsCollection = collection(db, "bookings");
  const queries = [
    query(
      bookingsCollection,
      where("disputeFlow.status", "in", [
        "disputed",
        "support_review",
        "outstanding_payment_pending",
        "outstanding_paid",
      ]),
      orderBy("createdAt", "desc"),
      limit(pageSize),
    ),
    query(
      bookingsCollection,
      where("disputeFlow.supportStatus", "in", [
        "pending",
        "in_progress",
        "resolved",
        "closed",
      ]),
      orderBy("createdAt", "desc"),
      limit(pageSize),
    ),
    query(
      bookingsCollection,
      where("depositFlow.status", "in", [
        "disputed",
        "support_review",
        "outstanding_payment_pending",
      ]),
      orderBy("createdAt", "desc"),
      limit(pageSize),
    ),
  ];

  const unsubscribes = queries.map((pendingDamageQuery, sourceIndex) =>
    onSnapshot(
      pendingDamageQuery,
      (snapshot) =>
        onNext(
          sourceIndex,
          mapBookingPageSnapshot(snapshot.docs, pageSize),
        ),
      onError,
    ),
  );

  return () => {
    unsubscribes.forEach((unsubscribe) => unsubscribe());
  };
}

function mapBookingPageSnapshot(
  docs: QueryDocumentSnapshot<DocumentData>[],
  pageSize: number,
): AdminCursorPage<AdminBooking> {
  return {
    hasMore: docs.length === pageSize,
    items: docs.map((snapshotDoc) =>
      mapAdminBooking({
        assetId: snapshotDoc.data().asset?.id ?? "unknown",
        snapshot: snapshotDoc,
      }),
    ),
    lastCursor: docs.at(-1) ?? null,
  };
}
