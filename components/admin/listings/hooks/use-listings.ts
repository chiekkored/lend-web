"use client";

import * as React from "react";

import { useAdminCursorPagination } from "@/lib/helpers/use-admin-cursor-pagination";

import { fetchAdminListingsPage } from "../data/listing-queries";

export function useListings() {
  const fetchPage = React.useCallback(fetchAdminListingsPage, []);
  const listings = useAdminCursorPagination({
    fetchPage,
  });

  return {
    data: listings.data,
    error: listings.error,
    loading: listings.loading,
    pagination: listings.pagination,
  };
}
