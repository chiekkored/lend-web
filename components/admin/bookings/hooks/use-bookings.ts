"use client";

import * as React from "react";

import { useAdminCursorPagination } from "@/lib/helpers/use-admin-cursor-pagination";

import { fetchAdminBookingsPage } from "../data/booking-queries";

export function useBookings({ enabled = true }: { enabled?: boolean } = {}) {
  const fetchPage = React.useCallback(fetchAdminBookingsPage, []);
  const bookings = useAdminCursorPagination({
    enabled,
    fetchPage,
  });

  return {
    data: bookings.data,
    error: bookings.error,
    loading: bookings.loading,
    pagination: bookings.pagination,
  };
}
