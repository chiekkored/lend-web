"use client";

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
import { httpsCallable } from "firebase/functions";
import { getDownloadURL, ref } from "firebase/storage";

import {
  getFirebaseFirestore,
  getFirebaseFunctions,
  getFirebaseStorage,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";
import type {
  AdminCursor,
  AdminCursorPage,
} from "@/lib/helpers/use-admin-cursor-pagination";
import type { AdminUser } from "@/lib/admin-users";

export const listingDeactivationRequestStatuses = [
  "Pending",
  "Approved",
  "Rejected",
] as const;

export type ListingDeactivationRequestStatus =
  (typeof listingDeactivationRequestStatuses)[number] | string;

export type ListingDeactivationRequestStatusFilter =
  | "all"
  | (typeof listingDeactivationRequestStatuses)[number];

export const listingDeactivationRequestStatusFilterOptions: {
  label: string;
  value: ListingDeactivationRequestStatusFilter;
}[] = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
];

export type ListingDeactivationRequest = {
  id: string;
  adminNotes: string | null;
  assetId: string;
  bookingSummaries: ListingDeactivationBookingSummary[];
  createdAt: Date | null;
  evidenceUrls: string[];
  listingSnapshot: ListingDeactivationListingSnapshot;
  notes: string | null;
  ownerId: string;
  reason: string | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  status: ListingDeactivationRequestStatus;
};

export type ListingDeactivationBookingSummary = {
  bookingId: string | null;
  endDate: Date | null;
  refundStatus: string | null;
  renterId: string | null;
  renterName: string | null;
  startDate: Date | null;
  status: string | null;
  totalPrice: number;
};

export type ListingDeactivationListingSnapshot = {
  category: string | null;
  images: string[];
  ownerId: string | null;
  showcase: string[];
  status: string | null;
  title: string | null;
};

export type ListingDeactivationReviewDecision = "approve" | "reject";

export const listingDeactivationRequestQueryKeys = {
  root: ["admin", "listings", "deactivationRequests"] as const,
  page: ({
    pageIndex,
    pageSize,
    statusFilter,
  }: {
    pageIndex: number;
    pageSize: number;
    statusFilter: ListingDeactivationRequestStatusFilter;
  }) =>
    [
      ...listingDeactivationRequestQueryKeys.root,
      "page",
      statusFilter,
      pageSize,
      pageIndex,
    ] as const,
  bookings: (assetId: string | null | undefined) =>
    [
      ...listingDeactivationRequestQueryKeys.root,
      "bookings",
      assetId ?? "missing",
    ] as const,
  evidence: (requestId: string | null | undefined) =>
    [
      ...listingDeactivationRequestQueryKeys.root,
      "evidence",
      requestId ?? "missing",
    ] as const,
  owner: (ownerId: string | null | undefined) =>
    [
      ...listingDeactivationRequestQueryKeys.root,
      "owner",
      ownerId ?? "missing",
    ] as const,
};

const blockingStatuses = [
  "Pending",
  "Confirmed",
  "Cancellation Requested",
] as const;

export async function fetchListingDeactivationRequests() {
  assertFirebaseConfig();
  const snapshot = await getDocs(
    query(
      collection(getFirebaseFirestore(), "listingDeactivationRequests"),
      orderBy("createdAt", "desc"),
      limit(100),
    ),
  );

  return snapshot.docs.map(mapListingDeactivationRequest);
}

export async function fetchListingDeactivationRequestsPage({
  cursor,
  pageSize,
  statusFilter,
}: {
  cursor: AdminCursor;
  pageSize: number;
  statusFilter: ListingDeactivationRequestStatusFilter;
}): Promise<AdminCursorPage<ListingDeactivationRequest>> {
  assertFirebaseConfig();
  const snapshot = await getDocs(
    query(
      collection(getFirebaseFirestore(), "listingDeactivationRequests"),
      ...listingDeactivationRequestQueryConstraints({
        cursor,
        pageSize,
        statusFilter,
      }),
    ),
  );

  return mapListingDeactivationRequestPage(snapshot.docs, pageSize);
}

export function listenListingDeactivationRequestsPage({
  onError,
  onNext,
  pageSize,
  statusFilter,
}: {
  onError: (error: Error) => void;
  onNext: (page: AdminCursorPage<ListingDeactivationRequest>) => void;
  pageSize: number;
  statusFilter: ListingDeactivationRequestStatusFilter;
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
      collection(getFirebaseFirestore(), "listingDeactivationRequests"),
      ...listingDeactivationRequestQueryConstraints({
        cursor: null,
        pageSize,
        statusFilter,
      }),
    ),
    (snapshot) =>
      onNext(mapListingDeactivationRequestPage(snapshot.docs, pageSize)),
    onError,
  );
}

export async function fetchListingDeactivationRequestBookings(assetId: string) {
  assertFirebaseConfig();
  const snapshot = await getDocs(
    query(
      collection(getFirebaseFirestore(), "assets", assetId, "bookings"),
      where("status", "in", [...blockingStatuses]),
    ),
  );
  const today = startOfToday();

  return snapshot.docs
    .map((doc) => mapBookingSummary({ id: doc.id, ...doc.data() }))
    .filter((booking) => booking.endDate && booking.endDate >= today)
    .sort(
      (a, b) =>
        (a.startDate?.getTime() ?? 0) - (b.startDate?.getTime() ?? 0),
    );
}

export async function fetchListingDeactivationRequestOwner(ownerId: string) {
  assertFirebaseConfig();
  const snapshot = await getDoc(
    doc(getFirebaseFirestore(), "users", ownerId),
  );

  if (!snapshot.exists()) {
    return minimalAdminUser(ownerId);
  }

  const data = snapshot.data();
  return {
    ...minimalAdminUser(ownerId),
    firstName: asString(data.firstName),
    lastName: asString(data.lastName),
    displayName: asString(data.displayName),
    email: asString(data.email),
    phone: asString(data.phone),
    photoUrl: asString(data.photoUrl),
    status: asString(data.status),
    type: asString(data.type),
    verified: asString(data.verified) ?? "None",
  } satisfies AdminUser;
}

export async function resolveListingDeactivationEvidenceUrls(urls: string[]) {
  assertFirebaseConfig();
  return Promise.all(
    urls.map((url) => {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return Promise.resolve(url);
      }
      return getDownloadURL(ref(getFirebaseStorage(), url));
    }),
  );
}

export async function reviewListingDeactivationRequest({
  adminNotes,
  decision,
  requestId,
}: {
  adminNotes?: string;
  decision: ListingDeactivationReviewDecision;
  requestId: string;
}) {
  assertFirebaseConfig();
  const callable = httpsCallable(
    getFirebaseFunctions(),
    "reviewListingDeactivationRequest",
  );
  await callable({
    adminNotes: adminNotes?.trim() || null,
    decision,
    requestId,
  });
}

export function buildListingDeactivationRequestSearchText(
  request: ListingDeactivationRequest,
) {
  return [
    request.id,
    request.assetId,
    request.ownerId,
    request.status,
    request.reason,
    request.listingSnapshot.title,
    request.listingSnapshot.category,
  ]
    .filter(Boolean)
    .join(" ");
}

export function formatDeactivationDate(value: Date | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function mapListingDeactivationRequest(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): ListingDeactivationRequest {
  const data = snapshot.data();
  const listingSnapshot = asRecord(data.listingSnapshot);

  return {
    id: asString(data.id) ?? snapshot.id,
    adminNotes: asString(data.adminNotes),
    assetId: asString(data.assetId) ?? "",
    bookingSummaries: Array.isArray(data.bookingSummaries)
      ? data.bookingSummaries
          .map(asRecord)
          .filter((item): item is Record<string, unknown> => item !== null)
          .map(mapBookingSummary)
      : [],
    createdAt: toDate(data.createdAt),
    evidenceUrls: asStringList(data.evidenceUrls),
    listingSnapshot: {
      category: asString(listingSnapshot?.category),
      images: asStringList(listingSnapshot?.images),
      ownerId: asString(listingSnapshot?.ownerId),
      showcase: asStringList(listingSnapshot?.showcase),
      status: asString(listingSnapshot?.status),
      title: asString(listingSnapshot?.title),
    },
    notes: asString(data.notes),
    ownerId: asString(data.ownerId) ?? "",
    reason: asString(data.reason),
    reviewedAt: toDate(data.reviewedAt),
    reviewedBy: asString(data.reviewedBy),
    status: asString(data.status) ?? "Pending",
  };
}

function mapListingDeactivationRequestPage(
  docs: QueryDocumentSnapshot<DocumentData>[],
  pageSize: number,
): AdminCursorPage<ListingDeactivationRequest> {
  return {
    hasMore: docs.length === pageSize,
    items: docs.map(mapListingDeactivationRequest),
    lastCursor: docs.at(-1) ?? null,
  };
}

function listingDeactivationRequestQueryConstraints({
  cursor,
  pageSize,
  statusFilter,
}: {
  cursor: AdminCursor;
  pageSize: number;
  statusFilter: ListingDeactivationRequestStatusFilter;
}): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];

  if (statusFilter !== "all") {
    constraints.push(where("status", "==", statusFilter));
  }

  constraints.push(orderBy("createdAt", "desc"));

  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  constraints.push(limit(pageSize));
  return constraints;
}

function mapBookingSummary(
  data: Record<string, unknown>,
): ListingDeactivationBookingSummary {
  const renter = asRecord(data.renter);
  const renterName = [asString(renter?.firstName), asString(renter?.lastName)]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    bookingId: asString(data.bookingId) ?? asString(data.id),
    endDate: toDate(data.endDate),
    refundStatus: asString(data.refundStatus),
    renterId: asString(data.renterId) ?? asString(renter?.uid),
    renterName: asString(data.renterName) ?? (renterName || null),
    startDate: toDate(data.startDate),
    status: asString(data.status),
    totalPrice:
      asNumber(data.totalPrice) ??
      asNumber(asRecord(data.paymentFlow)?.amount) ??
      0,
  };
}

function minimalAdminUser(uid: string): AdminUser {
  return {
    adminType: null,
    createdAt: null,
    dateOfBirth: null,
    deletedAt: null,
    displayName: null,
    email: null,
    firstName: null,
    fullVerification: null,
    fullVerificationSubmission: null,
    lastName: null,
    location: null,
    phone: null,
    photoUrl: null,
    status: null,
    type: null,
    uid,
    updatedAt: null,
    userMetadataVersion: 1,
    verified: "None",
  };
}

function assertFirebaseConfig() {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function asStringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
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
    "_seconds" in value &&
    typeof value._seconds === "number"
  ) {
    return new Date(value._seconds * 1000);
  }
  return null;
}
