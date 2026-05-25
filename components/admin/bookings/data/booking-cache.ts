"use client";

import type { QueryClient } from "@tanstack/react-query";

import type { AdminBooking } from "@/lib/admin-bookings";

import { bookingQueryKeys, fetchAdminBooking } from "./booking-queries";

export function setCachedAdminBooking(
  queryClient: QueryClient,
  booking: AdminBooking,
) {
  queryClient.setQueryData<AdminBooking[]>(bookingQueryKeys.root, (current) =>
    upsertBooking(current, booking),
  );
  queryClient.setQueryData<AdminBooking[]>(
    bookingQueryKeys.pendingDamage,
    (current) => upsertBooking(current, booking),
  );
  queryClient.setQueryData(
    bookingQueryKeys.detail(booking.id, booking.assetId),
    booking,
  );
}

export function patchCachedAdminBooking(
  queryClient: QueryClient,
  booking: AdminBooking,
  patcher: (booking: AdminBooking) => AdminBooking,
) {
  setCachedAdminBooking(queryClient, patcher(booking));
}

export async function refetchCachedAdminBooking({
  assetId,
  bookingId,
  queryClient,
}: {
  assetId: string | null;
  bookingId: string;
  queryClient: QueryClient;
}) {
  const booking = await fetchAdminBooking({ assetId, bookingId });
  if (booking) {
    setCachedAdminBooking(queryClient, booking);
  }

  return booking;
}

function upsertBooking(current: AdminBooking[] | undefined, booking: AdminBooking) {
  if (!current) {
    return [booking];
  }

  const next = current.some((item) => item.id === booking.id)
    ? current.map((item) => (item.id === booking.id ? booking : item))
    : [booking, ...current];

  return next.toSorted(
    (left, right) =>
      (right.createdAt?.getTime() ?? 0) - (left.createdAt?.getTime() ?? 0),
  );
}
