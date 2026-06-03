"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { listingQueryKeys } from "@/components/admin/listings/data/listing-queries";

import {
  listingDeactivationRequestQueryKeys,
  reviewListingDeactivationRequest,
  type ListingDeactivationReviewDecision,
} from "../data/deactivation-request-queries";

export function useDeactivationRequestReview() {
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);
  const resetError = React.useCallback(() => setError(null), []);

  const mutation = useMutation({
    mutationFn: reviewListingDeactivationRequest,
    onError: (err) => {
      console.error("[listing-deactivation] review failed", err);
      setError("Unable to review deactivation request.");
    },
    onSuccess: async () => {
      setError(null);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: listingDeactivationRequestQueryKeys.root,
        }),
        queryClient.invalidateQueries({ queryKey: listingQueryKeys.root }),
      ]);
    },
  });

  async function review({
    adminNotes,
    decision,
    requestId,
  }: {
    adminNotes?: string;
    decision: ListingDeactivationReviewDecision;
    requestId: string;
  }) {
    setError(null);
    try {
      await mutation.mutateAsync({ adminNotes, decision, requestId });
      return true;
    } catch {
      return false;
    }
  }

  return {
    error,
    resetError,
    review,
    submitting: mutation.isPending,
  };
}
