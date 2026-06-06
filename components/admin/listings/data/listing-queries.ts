import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import {
  listingStatuses,
  mapAdminListing,
  type AdminListing,
} from "@/lib/admin-listings";
import {
  getFirebaseFirestore,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";
import type { AdminCursor, AdminCursorPage } from "@/lib/helpers/use-admin-cursor-pagination";

export const listingQueryKeys = {
  root: ["admin", "listings"] as const,
  detail: (assetId: string | null | undefined) =>
    ["admin", "listings", assetId ?? "missing"] as const,
};

export type ListingStatusFilter = "all" | (typeof listingStatuses)[number];

type FetchAdminListingsPageInput = {
  cursor: AdminCursor;
  pageSize: number;
  statusFilter?: ListingStatusFilter;
};

export async function fetchAdminListings(): Promise<AdminListing[]> {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }

  const snapshot = await getDocs(collection(getFirebaseFirestore(), "assets"));
  return snapshot.docs
    .map(mapAdminListing)
    .filter((listing) => !listing.isDeleted);
}

export async function fetchAdminListingsPage({
  cursor,
  pageSize,
  statusFilter = "all",
}: FetchAdminListingsPageInput): Promise<AdminCursorPage<AdminListing>> {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }

  const constraints: QueryConstraint[] = [
    where("isDeleted", "==", false),
    ...(statusFilter === "all" ? [] : [where("status", "==", statusFilter)]),
    orderBy("createdAt", "desc"),
    ...(cursor ? [startAfter(cursor)] : []),
    limit(pageSize),
  ];
  const listingsQuery = query(
    collection(getFirebaseFirestore(), "assets"),
    ...constraints,
  );
  const snapshot = await getDocs(listingsQuery);
  const listings = snapshot.docs.map(mapAdminListing);

  return {
    hasMore: snapshot.docs.length === pageSize,
    items: listings,
    lastCursor: snapshot.docs.at(-1) ?? null,
  };
}

export async function fetchAdminListing(assetId: string): Promise<AdminListing | null> {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }

  const snapshot = await getDoc(doc(getFirebaseFirestore(), "assets", assetId));
  if (!snapshot.exists()) {
    return null;
  }

  const listing = mapAdminListing(snapshot as QueryDocumentSnapshot<DocumentData>);
  return listing.isDeleted ? null : listing;
}
