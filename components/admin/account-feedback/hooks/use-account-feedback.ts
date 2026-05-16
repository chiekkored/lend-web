"use client";

import { useQuery } from "@tanstack/react-query";

import {
  accountFeedbackQueryKeys,
  fetchAccountFeedback,
} from "../data/account-feedback-queries";

export function useAccountFeedback() {
  const feedbackQuery = useQuery({
    queryFn: fetchAccountFeedback,
    queryKey: accountFeedbackQueryKeys.root,
  });

  return {
    data: feedbackQuery.data ?? [],
    error:
      feedbackQuery.error instanceof Error
        ? feedbackQuery.error.message
        : feedbackQuery.error
          ? "Unable to load account feedback."
          : null,
    loading: feedbackQuery.isLoading,
  };
}
