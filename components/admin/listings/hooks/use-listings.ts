"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchAdminListings,
  listingQueryKeys,
} from "../data/listing-queries";

export function useListings() {
  const listingsQuery = useQuery({
    queryFn: fetchAdminListings,
    queryKey: listingQueryKeys.root,
  });

  return {
    data: listingsQuery.data ?? [],
    error:
      listingsQuery.error instanceof Error
        ? listingsQuery.error.message
        : listingsQuery.error
          ? "Unable to load listings."
          : null,
    loading: listingsQuery.isLoading,
  };
}
