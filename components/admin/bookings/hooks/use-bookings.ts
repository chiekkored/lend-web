"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchAdminBookings, bookingQueryKeys } from "../data/booking-queries";

export function useBookings() {
  const bookingsQuery = useQuery({
    queryFn: fetchAdminBookings,
    queryKey: bookingQueryKeys.root,
  });

  return {
    data: bookingsQuery.data ?? [],
    error:
      bookingsQuery.error instanceof Error
        ? bookingsQuery.error.message
        : bookingsQuery.error
          ? "Unable to load bookings."
          : null,
    loading: bookingsQuery.isLoading,
  };
}
