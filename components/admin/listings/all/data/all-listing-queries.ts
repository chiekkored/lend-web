import {
  fetchAdminListingsPage,
  type ListingStatusFilter,
} from "@/components/admin/listings/data/listing-queries";
import { listingStatuses } from "@/lib/admin-listings";

export const allListingQueryKeys = {
  root: ["admin", "listings", "all"] as const,
};

export type AllListingStatusFilter = ListingStatusFilter;

export const allListingStatusFilterOptions: {
  label: string;
  value: AllListingStatusFilter;
}[] = [
  { label: "All statuses", value: "all" },
  ...listingStatuses.map((status) => ({ label: status, value: status })),
];

export { fetchAdminListingsPage as fetchAllListingsPage };
