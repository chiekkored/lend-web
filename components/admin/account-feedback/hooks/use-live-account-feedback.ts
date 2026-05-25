"use client";

import * as React from "react";

import { useAdminCursorPagination } from "@/lib/helpers/use-admin-cursor-pagination";

import {
  fetchAccountFeedbackPage,
  listenAccountFeedback,
} from "../data/account-feedback-queries";

export function useLiveAccountFeedback({
  enabled = true,
}: {
  enabled?: boolean;
} = {}) {
  const fetchPage = React.useCallback(fetchAccountFeedbackPage, []);
  const listenFirstPage = React.useCallback(listenAccountFeedback, []);
  const feedback = useAdminCursorPagination({
    enabled,
    fetchPage,
    listenFirstPage,
  });

  return {
    data: feedback.data,
    error: feedback.error,
    loading: feedback.loading,
    pagination: feedback.pagination,
  };
}
