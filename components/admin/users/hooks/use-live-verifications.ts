"use client";

import * as React from "react";

import { useAdminCursorPagination } from "@/lib/helpers/use-admin-cursor-pagination";

import {
  fetchPendingVerificationUsersPage,
  listenPendingVerificationUsers,
} from "../data/user-directory-queries";

export function useLiveVerifications({
  enabled = true,
}: {
  enabled?: boolean;
} = {}) {
  const fetchPage = React.useCallback(fetchPendingVerificationUsersPage, []);
  const listenFirstPage = React.useCallback(listenPendingVerificationUsers, []);
  const verifications = useAdminCursorPagination({
    enabled,
    fetchPage,
    listenFirstPage,
  });

  return {
    data: verifications.data,
    error: verifications.error,
    loading: verifications.loading,
    pagination: verifications.pagination,
  };
}
