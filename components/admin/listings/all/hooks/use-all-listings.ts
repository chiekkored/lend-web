"use client";

import * as React from "react";

import { useAdminCursorPagination } from "@/lib/helpers/use-admin-cursor-pagination";

import { fetchAllListingsPage } from "../data/all-listing-queries";

export function useAllListings() {
  const fetchPage = React.useCallback(fetchAllListingsPage, []);
  const listings = useAdminCursorPagination({ fetchPage });

  return {
    data: listings.data,
    error: listings.error,
    loading: listings.loading,
    pagination: listings.pagination,
  };
}
