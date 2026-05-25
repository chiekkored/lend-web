"use client";

import * as React from "react";

import { useAdminCursorPagination } from "@/lib/helpers/use-admin-cursor-pagination";

import {
  fetchCancellationBookingsPage,
  listenCancellationBookings,
} from "../data/booking-queries";

export function useCancellationBookings({
  enabled = true,
}: {
  enabled?: boolean;
} = {}) {
  const fetchPage = React.useCallback(fetchCancellationBookingsPage, []);
  const listenFirstPage = React.useCallback(
    listenCancellationBookings,
    [],
  );
  const cancellations = useAdminCursorPagination({
    enabled,
    fetchPage,
    listenFirstPage,
  });

  return {
    data: cancellations.data,
    error: cancellations.error,
    loading: cancellations.loading,
    pagination: cancellations.pagination,
  };
}
