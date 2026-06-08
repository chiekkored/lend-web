"use client";

import {
  collection,
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
  getFirebaseFirestore,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";
import type {
  AdminCursor,
  AdminCursorPage,
} from "@/lib/helpers/use-admin-cursor-pagination";

export type AiReviewQueueDecision = "approve" | "reject";

export type AiReviewQueueItem = {
  id: string;
  assetId: string | null;
  ownerId: string | null;
  submissionType: "create" | "update";
  status: string;
  submittedAt: Date | null;
  listing: {
    title: string | null;
    description: string | null;
    categoryId: string | null;
    categoryName: string | null;
    subcategoryId: string | null;
    subcategoryName: string | null;
    rates: Record<string, unknown> | null;
    images: string[];
    showcase: string[];
    inclusions: string[];
    securityDeposit: Record<string, unknown> | null;
  };
  aiReview: {
    decision: string | null;
    severity: string | null;
    categories: string[];
    reasons: string[];
  };
  ownerComplianceRisk: {
    triggered: boolean;
    reasons: string[];
    metrics: Record<string, unknown>;
    thresholds: Record<string, unknown>;
  } | null;
  businessRegistrationRequest: {
    status: string | null;
    requestedAt: Date | null;
    requestedBy: {
      uid: string | null;
      name: string | null;
    } | null;
  } | null;
};

export const aiReviewQueueQueryKeys = {
  root: ["admin", "listings", "aiReviewQueue"] as const,
  page: ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) =>
    [...aiReviewQueueQueryKeys.root, "page", pageSize, pageIndex] as const,
};

export async function fetchAiReviewQueuePage({
  cursor,
  pageSize,
}: {
  cursor: AdminCursor;
  pageSize: number;
}): Promise<AdminCursorPage<AiReviewQueueItem>> {
  assertFirebaseConfig();

  const snapshot = await getDocs(
    query(
      collection(getFirebaseFirestore(), "listingReviewSubmissions"),
      ...buildAiReviewQueueQueryConstraints({ cursor, pageSize }),
    ),
  );

  return mapAiReviewQueuePage(snapshot.docs, pageSize);
}

export function listenAiReviewQueuePage({
  onError,
  onNext,
  pageSize,
}: {
  onError: (error: Error) => void;
  onNext: (page: AdminCursorPage<AiReviewQueueItem>) => void;
  pageSize: number;
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
      collection(getFirebaseFirestore(), "listingReviewSubmissions"),
      ...buildAiReviewQueueQueryConstraints({ cursor: null, pageSize }),
    ),
    (snapshot) => onNext(mapAiReviewQueuePage(snapshot.docs, pageSize)),
    onError,
  );
}

export function buildAiReviewQueueSearchText(review: AiReviewQueueItem) {
  return [
    review.id,
    review.assetId,
    review.ownerId,
    review.submissionType,
    review.listing.title,
    review.listing.categoryName,
    review.aiReview.decision,
    review.aiReview.severity,
    ...review.aiReview.categories,
    ...(review.ownerComplianceRisk?.reasons ?? []),
  ]
    .filter(Boolean)
    .join(" ");
}

export function formatAiReviewQueueDate(value: Date | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function buildAiReviewQueueQueryConstraints({
  cursor,
  pageSize,
}: {
  cursor: AdminCursor;
  pageSize: number;
}) {
  const constraints: QueryConstraint[] = [
    where("status", "==", "Pending"),
    orderBy("submittedAt", "desc"),
    limit(pageSize + 1),
  ];

  if (cursor) {
    constraints.splice(2, 0, startAfter(cursor));
  }

  return constraints;
}

function mapAiReviewQueuePage(
  docs: QueryDocumentSnapshot<DocumentData>[],
  pageSize: number,
): AdminCursorPage<AiReviewQueueItem> {
  const pageDocs = docs.slice(0, pageSize);

  return {
    hasMore: docs.length > pageSize,
    items: pageDocs.map(mapAiReviewQueueItem),
    lastCursor: pageDocs.at(-1) ?? null,
  };
}

function mapAiReviewQueueItem(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): AiReviewQueueItem {
  const data = snapshot.data();
  const listing = asRecord(data.listing);
  const aiReview = asRecord(data.aiReview);
  const ownerComplianceRisk = asRecord(data.ownerComplianceRisk);
  const businessRegistrationRequest = asRecord(data.businessRegistrationRequest);
  const requestedBy = asRecord(businessRegistrationRequest?.requestedBy);

  return {
    id: asString(data.id) ?? snapshot.id,
    assetId: asString(data.assetId),
    ownerId: asString(data.ownerId),
    submissionType: data.submissionType === "update" ? "update" : "create",
    status: asString(data.status) ?? "Pending",
    submittedAt: toDate(data.submittedAt),
    listing: {
      title: asString(listing?.title),
      description: asString(listing?.description),
      categoryId: asString(listing?.categoryId),
      categoryName: asString(listing?.categoryName),
      subcategoryId: asString(listing?.subcategoryId),
      subcategoryName: asString(listing?.subcategoryName),
      rates: asRecord(listing?.rates),
      images: asStringList(listing?.images),
      showcase: asStringList(listing?.showcase),
      inclusions: asStringList(listing?.inclusions),
      securityDeposit: asRecord(listing?.securityDeposit),
    },
    aiReview: {
      decision: asString(aiReview?.decision),
      severity: asString(aiReview?.severity),
      categories: asStringList(aiReview?.categories),
      reasons: asStringList(aiReview?.reasons),
    },
    ownerComplianceRisk: ownerComplianceRisk
      ? {
          triggered: ownerComplianceRisk.triggered === true,
          reasons: asStringList(ownerComplianceRisk.reasons),
          metrics: asRecord(ownerComplianceRisk.metrics) ?? {},
          thresholds: asRecord(ownerComplianceRisk.thresholds) ?? {},
        }
      : null,
    businessRegistrationRequest: businessRegistrationRequest
      ? {
          status: asString(businessRegistrationRequest.status),
          requestedAt: toDate(businessRegistrationRequest.requestedAt),
          requestedBy: requestedBy
            ? {
                uid: asString(requestedBy.uid),
                name: asString(requestedBy.name),
              }
            : null,
        }
      : null,
  };
}

function assertFirebaseConfig() {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }
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
  return null;
}
