"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchPendingListingReviews,
  listingReviewQueryKeys,
} from "../data/listing-review-queries";

export function useListingReviews() {
  const query = useQuery({
    queryKey: listingReviewQueryKeys.root,
    queryFn: fetchPendingListingReviews,
  });

  return {
    data: query.data ?? [],
    error: query.error instanceof Error ? query.error.message : null,
    loading: query.isLoading,
  };
}
