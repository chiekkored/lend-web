import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import {
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
}: {
  cursor: AdminCursor;
  pageSize: number;
}): Promise<AdminCursorPage<AdminListing>> {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }

  const listingsQuery = cursor
    ? query(
        collection(getFirebaseFirestore(), "assets"),
        orderBy("createdAt", "desc"),
        startAfter(cursor),
        limit(pageSize),
      )
    : query(
        collection(getFirebaseFirestore(), "assets"),
        orderBy("createdAt", "desc"),
        limit(pageSize),
      );
  const snapshot = await getDocs(listingsQuery);
  const listings = snapshot.docs.map(mapAdminListing).filter((listing) => !listing.isDeleted);

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
