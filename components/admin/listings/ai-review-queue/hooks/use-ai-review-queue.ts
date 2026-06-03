"use client";

import { useListingReviews } from "@/components/admin/listing-reviews/hooks/use-listing-reviews";

export function useAiReviewQueue() {
  return useListingReviews();
}
