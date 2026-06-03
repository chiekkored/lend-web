import {
  collection,
  getDocs,
  limit,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import {
  getFirebaseFirestore,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";

export type ListingReviewDecision = "approve" | "reject";

export type ListingReviewSubmission = {
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
};

export const listingReviewQueryKeys = {
  root: ["admin", "listingReviews"] as const,
};

export async function fetchPendingListingReviews(): Promise<ListingReviewSubmission[]> {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }

  const snapshot = await getDocs(
    query(
      collection(getFirebaseFirestore(), "listingReviewSubmissions"),
      where("status", "==", "Pending"),
      limit(100),
    ),
  );

  return snapshot.docs
    .map(mapListingReviewSubmission)
    .sort((a, b) => (b.submittedAt?.getTime() ?? 0) - (a.submittedAt?.getTime() ?? 0));
}

function mapListingReviewSubmission(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): ListingReviewSubmission {
  const data = snapshot.data();
  const listing = asRecord(data.listing);
  const aiReview = asRecord(data.aiReview);

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
  };
}

export function buildListingReviewSearchText(review: ListingReviewSubmission) {
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
  ]
    .filter(Boolean)
    .join(" ");
}

export function formatReviewDate(value: Date | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
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
