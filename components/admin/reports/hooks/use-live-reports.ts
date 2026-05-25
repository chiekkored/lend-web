"use client";

import * as React from "react";

import { useAdminCursorPagination } from "@/lib/helpers/use-admin-cursor-pagination";

import { fetchAdminReportsPage, listenAdminReports } from "../data/report-queries";

export function useLiveReports({ enabled = true }: { enabled?: boolean } = {}) {
  const fetchPage = React.useCallback(fetchAdminReportsPage, []);
  const listenFirstPage = React.useCallback(listenAdminReports, []);
  const reports = useAdminCursorPagination({
    enabled,
    fetchPage,
    listenFirstPage,
  });

  return {
    data: reports.data,
    error: reports.error,
    loading: reports.loading,
    pagination: reports.pagination,
  };
}
