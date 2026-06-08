"use client";

import * as React from "react";

import { useAdminCursorPagination } from "@/lib/helpers/use-admin-cursor-pagination";

import {
  fetchBusinessSubmissionPage,
  listenPendingBusinessSubmissionPage,
} from "../data/business-submission-queries";

const LIVE_LIMIT = 50;

export function useBusinessSubmissions({ enabled = true }: { enabled?: boolean } = {}) {
  const fetchPage = React.useCallback(fetchBusinessSubmissionPage, []);
  const listenFirstPage = React.useCallback(listenPendingBusinessSubmissionPage, []);
  const pagination = useAdminCursorPagination({
    enabled,
    fetchPage,
    listenFirstPage,
  });

  return {
    data: pagination.data,
    error: pagination.error,
    loading: pagination.loading,
    pagination: pagination.pagination,
  };
}

export function usePendingBusinessSubmissionIndicator() {
  const [ids, setIds] = React.useState<string[]>([]);

  React.useEffect(
    () =>
      listenPendingBusinessSubmissionPage({
        pageSize: LIVE_LIMIT,
        onError: (error) => {
          console.error("[business-submissions] sidebar pending listener failed", error);
          setIds([]);
        },
        onNext: (page) => {
          setIds(page.items.map((item) => item.ownerId));
        },
      }),
    [],
  );

  return { ids };
}
