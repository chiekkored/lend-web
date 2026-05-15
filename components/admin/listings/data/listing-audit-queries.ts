import {
  collection,
  getDocs,
  orderBy,
  query,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import {
  getFirebaseFirestore,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";

export type ListingAudit = {
  id: string;
  type: "Approved" | "Deleted" | "Edited" | "Rejected" | string;
  notes: string;
  createdBy: {
    name: string;
    uid: string;
  };
  createdAt: Date | null;
};

export const listingAuditQueryKeys = {
  audits: (listingId: string) =>
    ["admin", "listings", listingId, "audits"] as const,
};

export async function fetchListingAudits(listingId: string) {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }

  const auditsCollection = collection(
    getFirebaseFirestore(),
    "assets",
    listingId,
    "audits",
  );
  const snapshot = await getDocs(
    query(auditsCollection, orderBy("createdAt", "desc")),
  );

  return snapshot.docs.map(mapListingAudit);
}

function mapListingAudit(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): ListingAudit {
  const data = snapshot.data();
  const createdBy = asRecord(data.createdBy);

  return {
    id: snapshot.id,
    type: asString(data.type) ?? "Unknown",
    notes: asString(data.notes) ?? "No notes",
    createdBy: {
      name: asString(createdBy?.name) ?? "Unknown admin",
      uid: asString(createdBy?.uid) ?? "unknown",
    },
    createdAt: toDate(data.createdAt),
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
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
    "_seconds" in value &&
    typeof value._seconds === "number"
  ) {
    return new Date(value._seconds * 1000);
  }

  return null;
}
