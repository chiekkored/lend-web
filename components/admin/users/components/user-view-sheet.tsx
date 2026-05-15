"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, ListChecks, UserRound } from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { fetchAdminBookings, bookingQueryKeys } from "@/components/admin/bookings/data/booking-queries";
import { BookingViewSheet } from "@/components/admin/bookings/components/booking-view-sheet";
import { fetchAdminListings, listingQueryKeys } from "@/components/admin/listings/data/listing-queries";
import { ListingViewSheet } from "@/components/admin/listings/components/listing-view-sheet";
import {
  formatBookingDate,
  formatBookingMoney,
  getBookingAssetTitle,
  getBookingOwnerId,
  getBookingRenterId,
  type AdminBooking,
} from "@/lib/admin-bookings";
import { formatListingDate, formatListingPrice, type AdminListing } from "@/lib/admin-listings";
import { formatUserDate, getUserDisplayName, type AdminUser } from "@/lib/admin-users";

type UserViewSheetProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  user: AdminUser;
};

export function UserViewSheet({ onOpenChange, open, user }: UserViewSheetProps) {
  const [listingsOpen, setListingsOpen] = React.useState(false);
  const [bookingsOpen, setBookingsOpen] = React.useState(false);
  const displayName = getUserDisplayName(user);
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  React.useEffect(() => {
    if (!open) {
      setListingsOpen(false);
      setBookingsOpen(false);
    }
  }, [open]);

  return (
    <>
      <Sheet onOpenChange={onOpenChange} open={open}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader className="pr-12">
            <div className="grid min-w-0 gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="size-12">
                  {user.photoUrl ? <AvatarImage alt={displayName} src={user.photoUrl} /> : null}
                  <AvatarFallback>{initials || <UserRound className="size-4" />}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <SheetTitle>{displayName}</SheetTitle>
                  <SheetDescription className="truncate">{user.uid}</SheetDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.status ? <StatusBadge value={user.status} /> : null}
                {user.isListingEligible ? (
                  <StatusBadge value={formatEligibilityBadge("Listing", user.isListingEligible)} />
                ) : null}
                {user.isRentingEligible ? (
                  <StatusBadge value={formatEligibilityBadge("Renting", user.isRentingEligible)} />
                ) : null}
              </div>
            </div>
          </SheetHeader>

          <div className="grid flex-1 auto-rows-min gap-5 overflow-y-auto overflow-x-hidden px-4 pb-4">
            <Section title="Activity">
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  className="justify-center"
                  onClick={() => setListingsOpen(true)}
                  type="button"
                  variant="outline"
                >
                  <ListChecks className="size-4" />
                  View listings
                </Button>
                <Button
                  className="justify-center"
                  onClick={() => setBookingsOpen(true)}
                  type="button"
                  variant="outline"
                >
                  <CalendarClock className="size-4" />
                  View bookings
                </Button>
              </div>
            </Section>

            <Section title="Profile">
              <DetailRow label="Display name" value={displayName} />
              <DetailRow label="First name" value={user.firstName ?? "Not set"} />
              <DetailRow label="Last name" value={user.lastName ?? "Not set"} />
              <DetailRow label="UID" value={user.uid} />
              <DetailRow label="Photo URL" value={user.photoUrl ?? "Not set"} />
            </Section>

            <Section title="Contact and account">
              <DetailRow label="Email" value={user.email ?? "Not set"} />
              <DetailRow label="Phone" value={user.phone ?? "Not set"} />
              <DetailRow label="Type" value={user.type ?? "Not set"} />
              <DetailRow label="Admin type" value={user.adminType ?? "Not set"} />
              <DetailRow label="Metadata version" value={String(user.userMetadataVersion)} />
            </Section>

            <Section title="Eligibility">
              <DetailRow
                label="Listing"
                value={
                  user.isListingEligible ? (
                    <StatusBadge value={formatEligibilityBadge("Listing", user.isListingEligible)} />
                  ) : (
                    "Not set"
                  )
                }
              />
              <DetailRow
                label="Renting"
                value={
                  user.isRentingEligible ? (
                    <StatusBadge value={formatEligibilityBadge("Renting", user.isRentingEligible)} />
                  ) : (
                    "Not set"
                  )
                }
              />
            </Section>

            <Section title="Dates">
              <DetailRow label="Date of birth" value={formatUserDate(user.dateOfBirth)} />
              <DetailRow label="Created" value={formatUserDate(user.createdAt)} />
              <DetailRow label="Updated" value={formatUserDate(user.updatedAt)} />
              <DetailRow label="Deleted" value={formatUserDate(user.deletedAt)} />
            </Section>

            <Section title="Location">
              <p className="whitespace-pre-wrap text-sm text-muted-foreground [overflow-wrap:anywhere]">
                {formatLocationValue(user.location)}
              </p>
            </Section>
          </div>
        </SheetContent>
      </Sheet>
      <UserListingsSheet onOpenChange={setListingsOpen} open={listingsOpen} user={user} />
      <UserBookingsSheet onOpenChange={setBookingsOpen} open={bookingsOpen} user={user} />
    </>
  );
}

function UserListingsSheet({
  onOpenChange,
  open,
  user,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  user: AdminUser;
}) {
  const [selectedListing, setSelectedListing] = React.useState<AdminListing | null>(null);
  const listingsQuery = useQuery({
    enabled: open,
    queryFn: fetchAdminListings,
    queryKey: listingQueryKeys.root,
  });
  const listings = (listingsQuery.data ?? []).filter((listing) => isUserListing(listing, user.uid));
  const error =
    listingsQuery.error instanceof Error
      ? listingsQuery.error.message
      : listingsQuery.error
        ? "Unable to load listings."
        : null;

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader className="pr-12">
          <SheetTitle>User listings</SheetTitle>
          <SheetDescription>{getUserDisplayName(user)} owned listings</SheetDescription>
        </SheetHeader>
        <SheetListBody emptyText="No listings found for this user." error={error} loading={listingsQuery.isLoading}>
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} onView={() => setSelectedListing(listing)} />
          ))}
        </SheetListBody>
      </SheetContent>
      {selectedListing ? (
        <ListingViewSheet
          listing={selectedListing}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setSelectedListing(null);
            }
          }}
          open={Boolean(selectedListing)}
        />
      ) : null}
    </Sheet>
  );
}

function UserBookingsSheet({
  onOpenChange,
  open,
  user,
}: {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  user: AdminUser;
}) {
  const [selectedBooking, setSelectedBooking] = React.useState<AdminBooking | null>(null);
  const bookingsQuery = useQuery({
    enabled: open,
    queryFn: fetchAdminBookings,
    queryKey: bookingQueryKeys.root,
  });
  const bookings = (bookingsQuery.data ?? []).filter((booking) => getUserBookingRole(booking, user.uid));
  const error =
    bookingsQuery.error instanceof Error
      ? bookingsQuery.error.message
      : bookingsQuery.error
        ? "Unable to load bookings."
        : null;

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader className="pr-12">
          <SheetTitle>User bookings</SheetTitle>
          <SheetDescription>{getUserDisplayName(user)} renter and owner bookings</SheetDescription>
        </SheetHeader>
        <SheetListBody emptyText="No bookings found for this user." error={error} loading={bookingsQuery.isLoading}>
          {bookings.map((booking) => (
            <BookingCard
              booking={booking}
              key={`${booking.assetId}:${booking.id}`}
              onView={() => setSelectedBooking(booking)}
              role={getUserBookingRole(booking, user.uid) ?? "Unknown"}
            />
          ))}
        </SheetListBody>
      </SheetContent>
      {selectedBooking ? (
        <BookingViewSheet
          booking={selectedBooking}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setSelectedBooking(null);
            }
          }}
          open={Boolean(selectedBooking)}
        />
      ) : null}
    </Sheet>
  );
}

function ListingCard({ listing, onView }: { listing: AdminListing; onView: () => void }) {
  return (
    <div className="grid gap-3 rounded-md border p-4 text-sm">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{listing.title ?? "Untitled listing"}</p>
          <p className="truncate text-xs text-muted-foreground">{listing.id}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {listing.status ? <StatusBadge value={listing.status} /> : null}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <DetailRow label="Category" value={listing.category ?? "Not set"} />
        <DetailRow label="Daily" value={formatListingPrice(listing.rates.daily)} />
        <DetailRow label="Created" value={formatListingDate(listing.createdAt)} />
        <DetailRow label="Pending" value={String(listing.pendingBookingCount)} />
      </div>
      <Button onClick={onView} size="sm" type="button" variant="outline">
        View
      </Button>
    </div>
  );
}

function BookingCard({ booking, onView, role }: { booking: AdminBooking; onView: () => void; role: string }) {
  return (
    <div className="grid gap-3 rounded-md border p-4 text-sm">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{getBookingAssetTitle(booking)}</p>
          <p className="truncate text-xs text-muted-foreground">{booking.id}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {booking.status ? <StatusBadge value={booking.status} /> : null}
          <Button onClick={onView} size="sm" type="button" variant="outline">
            View
          </Button>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <DetailRow label="Role" value={role} />
        <DetailRow label="Total" value={formatBookingMoney(booking.totalPrice)} />
        <DetailRow label="Start" value={formatBookingDate(booking.startDate)} />
        <DetailRow label="End" value={formatBookingDate(booking.endDate)} />
        <DetailRow label="Chat ID" value={booking.chatId ?? "Not set"} />
        <DetailRow label="Asset ID" value={booking.assetId} />
      </div>
    </div>
  );
}

function SheetListBody({
  children,
  emptyText,
  error,
  loading,
}: {
  children: React.ReactNode;
  emptyText: string;
  error: string | null;
  loading: boolean;
}) {
  const hasChildren = React.Children.count(children) > 0;

  return (
    <div className="grid flex-1 auto-rows-min gap-3 overflow-y-auto overflow-x-hidden px-4 pb-4">
      {loading ? (
        <EmptyState text="Loading records..." />
      ) : error ? (
        <EmptyState destructive text={error} />
      ) : hasChildren ? (
        children
      ) : (
        <EmptyState text={emptyText} />
      )}
    </div>
  );
}

function Section({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="grid min-w-0 gap-3 rounded-md border p-4 text-sm">
      <h3 className="font-medium">{title}</h3>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 text-right [overflow-wrap:anywhere]">{value}</span>
    </div>
  );
}

function EmptyState({ destructive, text }: { destructive?: boolean; text: string }) {
  return (
    <div
      className={`grid min-h-48 place-items-center rounded-md border border-dashed p-6 text-center text-sm ${
        destructive ? "text-destructive" : "text-muted-foreground"
      }`}
    >
      {text}
    </div>
  );
}

function isUserListing(listing: AdminListing, uid: string) {
  return listing.ownerId === uid || listing.owner?.uid === uid;
}

function getUserBookingRole(booking: AdminBooking, uid: string) {
  const isOwner = getBookingOwnerId(booking) === uid;
  const isRenter = getBookingRenterId(booking) === uid;

  if (isOwner && isRenter) {
    return "Owner and renter";
  }

  if (isOwner) {
    return "Owner";
  }

  if (isRenter) {
    return "Renter";
  }

  return null;
}

function formatEligibilityBadge(label: "Listing" | "Renting", value: string) {
  if (value === "Yes") {
    return `${label} Eligible`;
  }

  if (value === "No") {
    return `${label} Ineligible`;
  }

  return `${label} ${value}`;
}

function formatLocationValue(value: unknown) {
  if (!value) {
    return "Not set";
  }

  if (typeof value === "string") {
    return value.trim() || "Not set";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "Location set";
    }
  }

  return String(value);
}
