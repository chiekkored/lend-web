"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchAdminBooking,
  bookingQueryKeys,
} from "@/components/admin/bookings/data/booking-queries";
import { BookingViewSheet } from "@/components/admin/bookings/components/booking-view-sheet";
import {
  fetchAdminListing,
  listingQueryKeys,
} from "@/components/admin/listings/data/listing-queries";
import { ListingViewSheet } from "@/components/admin/listings/components/listing-view-sheet";
import {
  fetchAdminUser,
  userDirectoryQueryKeys,
} from "@/components/admin/users/data/user-directory-queries";
import { UserViewSheet } from "@/components/admin/users/components/user-view-sheet";
import {
  getBookingOwnerId,
  getBookingRenterId,
  type AdminBooking,
} from "@/lib/admin-bookings";
import type { AdminListing } from "@/lib/admin-listings";
import type { AdminUser } from "@/lib/admin-users";

type SheetProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function CachedUserViewSheet({
  onOpenChange,
  open,
  uid,
}: SheetProps & { uid: string | null }) {
  const queryClient = useQueryClient();
  const userQuery = useQuery({
    enabled: open && Boolean(uid),
    initialData: () => findCachedUser(queryClient, uid),
    queryFn: () => fetchAdminUser(uid ?? ""),
    queryKey: userDirectoryQueryKeys.user(uid),
  });

  return userQuery.data ? (
    <UserViewSheet onOpenChange={onOpenChange} open={open} user={userQuery.data} />
  ) : null;
}

export function CachedListingViewSheet({
  assetId,
  onOpenChange,
  open,
}: SheetProps & { assetId: string | null }) {
  const queryClient = useQueryClient();
  const listingQuery = useQuery({
    enabled: open && Boolean(assetId),
    initialData: () => findCachedListing(queryClient, assetId),
    queryFn: () => fetchAdminListing(assetId ?? ""),
    queryKey: listingQueryKeys.detail(assetId),
  });

  return listingQuery.data ? (
    <ListingViewSheet
      listing={listingQuery.data}
      onOpenChange={onOpenChange}
      open={open}
    />
  ) : null;
}

export function CachedBookingViewSheet({
  assetId,
  bookingId,
  onOpenChange,
  open,
}: SheetProps & { assetId: string | null; bookingId: string | null }) {
  const queryClient = useQueryClient();
  const bookingQuery = useQuery({
    enabled: open && Boolean(bookingId),
    initialData: () => findCachedBooking(queryClient, bookingId, assetId),
    queryFn: () =>
      fetchAdminBooking({
        assetId,
        bookingId: bookingId ?? "",
      }),
    queryKey: bookingQueryKeys.detail(bookingId, assetId),
  });

  return bookingQuery.data ? (
    <BookingViewSheet
      booking={bookingQuery.data}
      onOpenChange={onOpenChange}
      open={open}
    />
  ) : null;
}

function findCachedUser(queryClient: ReturnType<typeof useQueryClient>, uid: string | null) {
  if (!uid) {
    return undefined;
  }

  const allUsers = queryClient.getQueryData<AdminUser[]>(userDirectoryQueryKeys.users);
  const adminUsers = queryClient.getQueryData<AdminUser[]>(userDirectoryQueryKeys.adminUsers);
  return [...(allUsers ?? []), ...(adminUsers ?? [])].find((user) => user.uid === uid);
}

function findCachedListing(
  queryClient: ReturnType<typeof useQueryClient>,
  assetId: string | null,
) {
  if (!assetId) {
    return undefined;
  }

  return queryClient
    .getQueryData<AdminListing[]>(listingQueryKeys.root)
    ?.find((listing) => listing.id === assetId);
}

function findCachedBooking(
  queryClient: ReturnType<typeof useQueryClient>,
  bookingId: string | null,
  assetId: string | null,
) {
  if (!bookingId) {
    return undefined;
  }

  return queryClient
    .getQueryData<AdminBooking[]>(bookingQueryKeys.root)
    ?.find(
      (booking) =>
        booking.id === bookingId &&
        (!assetId || booking.assetId === assetId || booking.asset?.id === assetId),
    );
}

export function userMatchesBooking(booking: AdminBooking, uid: string) {
  return getBookingOwnerId(booking) === uid || getBookingRenterId(booking) === uid;
}
