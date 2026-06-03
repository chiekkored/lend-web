import { fetchAdminListingsPage } from "@/components/admin/listings/data/listing-queries";

export const allListingQueryKeys = {
  root: ["admin", "listings", "all"] as const,
};

export { fetchAdminListingsPage as fetchAllListingsPage };
