import { collection, getDocs } from "firebase/firestore";

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
