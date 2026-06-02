"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";

import { getFirebaseFunctions } from "@/lib/firebase";

import {
  listingReviewQueryKeys,
  type ListingReviewDecision,
} from "../data/listing-review-queries";

export function useListingReviewMutation() {
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const reviewSubmission = React.useCallback(
    async ({
      decision,
      notes,
      submissionId,
    }: {
      decision: ListingReviewDecision;
      notes: string;
      submissionId: string;
    }) => {
      setError(null);
      setSubmitting(true);
      try {
        const callable = httpsCallable(
          getFirebaseFunctions(),
          "reviewListingSubmission",
        );
        await callable({ decision, notes, submissionId });
        await queryClient.invalidateQueries({
          queryKey: listingReviewQueryKeys.root,
        });
        return true;
      } catch (err) {
        console.error("[listing-review] failed to review submission", err);
        setError("Unable to update listing review.");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [queryClient],
  );

  const approve = React.useCallback(
    (submissionId: string, notes: string) =>
      reviewSubmission({ decision: "approve", notes, submissionId }),
    [reviewSubmission],
  );
  const reject = React.useCallback(
    (submissionId: string, notes: string) =>
      reviewSubmission({ decision: "reject", notes, submissionId }),
    [reviewSubmission],
  );
  const resetError = React.useCallback(() => setError(null), []);

  return {
    approve,
    error,
    reject,
    resetError,
    submitting,
  };
}
