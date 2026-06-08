"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";

import { getFirebaseFunctions } from "@/lib/firebase";

import {
  aiReviewQueueQueryKeys,
  type AiReviewQueueDecision,
} from "../data/ai-review-queue-queries";

export function useAiReviewQueueMutation() {
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const reviewSubmission = React.useCallback(
    async ({
      decision,
      notes,
      submissionId,
    }: {
      decision: AiReviewQueueDecision;
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
          queryKey: aiReviewQueueQueryKeys.root,
        });
        return true;
      } catch (err) {
        console.error("[ai-review-queue] failed to review submission", err);
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
  const requestComplianceDocuments = React.useCallback(
    async (submissionId: string) => {
      setError(null);
      setSubmitting(true);
      try {
        const callable = httpsCallable(
          getFirebaseFunctions(),
          "requestListingComplianceDocuments",
        );
        await callable({ submissionId });
        await queryClient.invalidateQueries({
          queryKey: aiReviewQueueQueryKeys.root,
        });
        return true;
      } catch (err) {
        console.error(
          "[ai-review-queue] failed to request compliance documents",
          err,
        );
        setError("Unable to request compliance documents.");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [queryClient],
  );
  const resetError = React.useCallback(() => setError(null), []);

  return {
    approve,
    error,
    reject,
    requestComplianceDocuments,
    resetError,
    submitting,
  };
}
