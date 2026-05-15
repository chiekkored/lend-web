import { collection, doc, getDoc, getDocs, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";

import {
  mapAdminListing,
  type AdminListing,
} from "@/lib/admin-listings";
import {
  getFirebaseFirestore,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";

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
