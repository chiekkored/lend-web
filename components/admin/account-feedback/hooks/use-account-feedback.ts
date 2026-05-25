"use client";

import { useLiveAccountFeedback } from "./use-live-account-feedback";

export function useAccountFeedback() {
  const liveFeedback = useLiveAccountFeedback();

  return {
    data: liveFeedback.data,
    error: liveFeedback.error,
    loading: liveFeedback.loading,
    pagination: liveFeedback.pagination,
  };
}
