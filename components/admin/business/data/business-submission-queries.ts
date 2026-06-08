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

import { getFirebaseFirestore, hasFirebaseConfig, missingFirebaseConfig } from "@/lib/firebase";
import type { AdminCursor, AdminCursorPage } from "@/lib/helpers/use-admin-cursor-pagination";

export type BusinessSubmissionItem = {
  ownerId: string;
  status: string;
  submittedAt: Date | null;
  updatedAt: Date | null;
  reviewedAt: Date | null;
  requestedListingReviewSubmissionId: string | null;
  taxInvoiceAcknowledged: boolean;
  reviewNotes: string | null;
  businessName: string | null;
  businessType: string | null;
  businessAddress: string | null;
  documents: {
    dti: string | null;
    bir: string | null;
    mayorBusinessPermit: string | null;
  };
};

export type BusinessSubmissionOwner = {
  uid: string;
  displayName: string | null;
  email: string | null;
  businessRegistration: {
    status: string | null;
    required: boolean;
    businessName: string | null;
    businessType: string | null;
    businessAddress: string | null;
    requestedListingReviewSubmissionId: string | null;
  } | null;
};

export const businessSubmissionQueryKeys = {
  root: ["admin", "businessSubmissions"] as const,
  owner: (uid: string | null | undefined) =>
    [...businessSubmissionQueryKeys.root, "owner", uid ?? "missing"] as const,
};

export async function fetchBusinessSubmissionPage({
  cursor,
  pageSize,
}: {
  cursor: AdminCursor;
  pageSize: number;
}): Promise<AdminCursorPage<BusinessSubmissionItem>> {
  assertFirebaseConfig();

  const snapshot = await getDocs(
    query(
      collection(getFirebaseFirestore(), "businessRegistrationSubmissions"),
      ...buildBusinessSubmissionQueryConstraints({ cursor, pageSize }),
    ),
  );

  return mapBusinessSubmissionPage(snapshot.docs, pageSize);
}

export function listenPendingBusinessSubmissionPage({
  onError,
  onNext,
  pageSize,
}: {
  onError: (error: Error) => void;
  onNext: (page: AdminCursorPage<BusinessSubmissionItem>) => void;
  pageSize: number;
}) {
  if (!hasFirebaseConfig) {
    onError(new Error(`Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`));
    return () => {};
  }

  return onSnapshot(
    query(
      collection(getFirebaseFirestore(), "businessRegistrationSubmissions"),
      ...buildBusinessSubmissionQueryConstraints({ cursor: null, pageSize }),
    ),
    (snapshot) => onNext(mapBusinessSubmissionPage(snapshot.docs, pageSize)),
    onError,
  );
}

export async function fetchBusinessSubmissionOwner(uid: string): Promise<BusinessSubmissionOwner | null> {
  assertFirebaseConfig();

  const snapshot = await getDoc(doc(getFirebaseFirestore(), "users", uid));
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() ?? {};
  const businessRegistration = asRecord(data.businessRegistration);
  return {
    uid,
    displayName: buildDisplayName(data),
    email: asString(data.email),
    businessRegistration: businessRegistration
      ? {
          status: asString(businessRegistration.status),
          required: businessRegistration.required === true,
          businessName: asString(businessRegistration.businessName),
          businessType: asString(businessRegistration.businessType),
          businessAddress: asString(businessRegistration.businessAddress),
          requestedListingReviewSubmissionId: asString(
            businessRegistration.requestedListingReviewSubmissionId,
          ),
        }
      : null,
  };
}

export function buildBusinessSubmissionSearchText(submission: BusinessSubmissionItem) {
  return [
    submission.ownerId,
    submission.status,
    submission.businessName,
    submission.businessType,
    submission.businessAddress,
    submission.requestedListingReviewSubmissionId,
  ]
    .filter(Boolean)
    .join(" ");
}

export function formatBusinessSubmissionDate(value: Date | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function buildBusinessSubmissionQueryConstraints({
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

function mapBusinessSubmissionPage(
  docs: QueryDocumentSnapshot<DocumentData>[],
  pageSize: number,
): AdminCursorPage<BusinessSubmissionItem> {
  const pageDocs = docs.slice(0, pageSize);

  return {
    hasMore: docs.length > pageSize,
    items: pageDocs.map(mapBusinessSubmissionItem),
    lastCursor: pageDocs.at(-1) ?? null,
  };
}

function mapBusinessSubmissionItem(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): BusinessSubmissionItem {
  const data = snapshot.data();
  const documents = asRecord(data.documents);

  return {
    ownerId: asString(data.ownerId) ?? snapshot.id,
    status: asString(data.status) ?? "Pending",
    submittedAt: toDate(data.submittedAt),
    updatedAt: toDate(data.updatedAt),
    reviewedAt: toDate(data.reviewedAt),
    requestedListingReviewSubmissionId: asString(data.requestedListingReviewSubmissionId),
    taxInvoiceAcknowledged: data.taxInvoiceAcknowledged === true,
    reviewNotes: asString(data.reviewNotes),
    businessName: asString(data.businessName),
    businessType: asString(data.businessType),
    businessAddress: asString(data.businessAddress),
    documents: {
      dti: asString(documents?.dti),
      bir: asString(documents?.bir),
      mayorBusinessPermit: asString(documents?.mayorBusinessPermit),
    },
  };
}

function buildDisplayName(data: Record<string, unknown>) {
  const displayName = asString(data.displayName);
  if (displayName) return displayName;

  const firstName = asString(data.firstName);
  const lastName = asString(data.lastName);
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || null;
}

function assertFirebaseConfig() {
  if (!hasFirebaseConfig) {
    throw new Error(`Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`);
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function toDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate() as Date;
  }
  return null;
}
