"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";

import { getFirebaseFunctions } from "@/lib/firebase";

import { aiReviewQueueQueryKeys } from "@/components/admin/listings/ai-review-queue/data/ai-review-queue-queries";
import { businessSubmissionQueryKeys } from "../data/business-submission-queries";

export function useBusinessSubmissionMutation() {
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const reviewSubmission = React.useCallback(
    async ({
      action,
      businessAddress,
      businessName,
      businessType,
      notes,
      ownerId,
    }: {
      action: "Approved" | "Rejected";
      businessAddress?: string;
      businessName?: string;
      businessType?: string;
      notes: string;
      ownerId: string;
    }) => {
      setError(null);
      setSubmitting(true);
      try {
        const callable = httpsCallable(
          getFirebaseFunctions(),
          "reviewBusinessRegistrationSubmission",
        );
        await callable({
          action,
          businessAddress,
          businessName,
          businessType,
          notes,
          ownerId,
        });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: businessSubmissionQueryKeys.root }),
          queryClient.invalidateQueries({ queryKey: businessSubmissionQueryKeys.owner(ownerId) }),
          queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
          queryClient.invalidateQueries({ queryKey: aiReviewQueueQueryKeys.root }),
        ]);
        return true;
      } catch (err) {
        console.error("[business-submissions] failed to review submission", err);
        setError("Unable to review business submission.");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [queryClient],
  );

  const approve = React.useCallback(
    ({
      businessAddress,
      businessName,
      businessType,
      notes,
      ownerId,
    }: {
      businessAddress: string;
      businessName: string;
      businessType: string;
      notes: string;
      ownerId: string;
    }) =>
      reviewSubmission({
        action: "Approved",
        businessAddress,
        businessName,
        businessType,
        notes,
        ownerId,
      }),
    [reviewSubmission],
  );

  const reject = React.useCallback(
    ({ notes, ownerId }: { notes: string; ownerId: string }) =>
      reviewSubmission({ action: "Rejected", notes, ownerId }),
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
