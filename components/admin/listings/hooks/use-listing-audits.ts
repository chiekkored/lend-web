"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchListingAudits,
  listingAuditQueryKeys,
} from "../data/listing-audit-queries";

export function useListingAudits(listingId: string, enabled: boolean) {
  const auditsQuery = useQuery({
    enabled,
    queryFn: () => fetchListingAudits(listingId),
    queryKey: listingAuditQueryKeys.audits(listingId),
  });

  return {
    data: auditsQuery.data ?? [],
    error:
      auditsQuery.error instanceof Error
        ? auditsQuery.error.message
        : auditsQuery.error
          ? "Unable to load audit history."
          : null,
    loading: auditsQuery.isLoading,
  };
}
