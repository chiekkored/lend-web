"use client";

import * as React from "react";

import { useAdminCursorPagination } from "@/lib/helpers/use-admin-cursor-pagination";

import {
  fetchAllListingsPage,
  type AllListingStatusFilter,
} from "../data/all-listing-queries";

export function useAllListings() {
  const [statusFilter, setStatusFilter] =
    React.useState<AllListingStatusFilter>("all");
  const fetchPage = React.useCallback(
    (input: Parameters<typeof fetchAllListingsPage>[0]) =>
      fetchAllListingsPage({ ...input, statusFilter }),
    [statusFilter],
  );
  const listings = useAdminCursorPagination({ fetchPage });

  return {
    data: listings.data,
    error: listings.error,
    onStatusFilterChange: setStatusFilter,
    loading: listings.loading,
    pagination: listings.pagination,
    statusFilter,
  };
}
