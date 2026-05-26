"use client";

import * as React from "react";

import type { AdminCancellationRequestStatusFilter } from "@/lib/admin-bookings";
import { useAdminCursorPagination } from "@/lib/helpers/use-admin-cursor-pagination";

import {
  fetchCancellationBookingsPage,
  listenCancellationBookings,
} from "../data/booking-queries";

export function useCancellationBookings({
  enabled = true,
  statusFilter = "all",
}: {
  enabled?: boolean;
  statusFilter?: AdminCancellationRequestStatusFilter;
} = {}) {
  const fetchPage = React.useCallback(
    (input: Parameters<typeof fetchCancellationBookingsPage>[0]) =>
      fetchCancellationBookingsPage({ ...input, statusFilter }),
    [statusFilter],
  );
  const listenFirstPage = React.useCallback(
    (input: Parameters<typeof listenCancellationBookings>[0]) =>
      listenCancellationBookings({ ...input, statusFilter }),
    [statusFilter],
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
