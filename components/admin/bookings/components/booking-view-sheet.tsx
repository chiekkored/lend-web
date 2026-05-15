"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { ArrowRight, CalendarDays, MessageSquareText, UserRound } from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  fetchAdminListing,
  listingQueryKeys,
} from "@/components/admin/listings/data/listing-queries";
import { ListingViewSheet } from "@/components/admin/listings/components/listing-view-sheet";
import {
  fetchAdminUser,
  userDirectoryQueryKeys,
} from "@/components/admin/users/data/user-directory-queries";
import {
  formatBookingDate,
  formatBookingDateTime,
  formatBookingMoney,
  getBookingAssetTitle,
  getBookingOwnerId,
  getBookingOwnerName,
  getBookingRenterId,
  getBookingRenterName,
  type AdminBooking,
  type BookingPerson,
} from "@/lib/admin-bookings";
import type { AdminListing } from "@/lib/admin-listings";
import type { AdminUser } from "@/lib/admin-users";

import { BookingChatSheet } from "./booking-chat-sheet";

const UserViewSheet = dynamic(
  () => import("@/components/admin/users/components/user-view-sheet").then((mod) => mod.UserViewSheet),
  { ssr: false },
);

type BookingViewSheetProps = {
  booking: AdminBooking;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function BookingViewSheet({ booking, onOpenChange, open }: BookingViewSheetProps) {
  const [chatOpen, setChatOpen] = React.useState(false);
  const [assetOpen, setAssetOpen] = React.useState(false);
  const [ownerOpen, setOwnerOpen] = React.useState(false);
  const [renterOpen, setRenterOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const ownerUid = getBookingOwnerId(booking);
  const renterUid = getBookingRenterId(booking);
  const listingQuery = useQuery({
    enabled: assetOpen,
    initialData: () =>
      queryClient
        .getQueryData<AdminListing[]>(listingQueryKeys.root)
        ?.find((listing) => listing.id === booking.assetId),
    queryFn: () => fetchAdminListing(booking.assetId),
    queryKey: listingQueryKeys.detail(booking.assetId),
  });
  const ownerQuery = useQuery({
    enabled: ownerOpen && Boolean(ownerUid),
    initialData: () => findCachedUser(queryClient, ownerUid),
    queryFn: () => fetchAdminUser(ownerUid ?? ""),
    queryKey: userDirectoryQueryKeys.user(ownerUid),
  });
  const renterQuery = useQuery({
    enabled: renterOpen && Boolean(renterUid),
    initialData: () => findCachedUser(queryClient, renterUid),
    queryFn: () => fetchAdminUser(renterUid ?? ""),
    queryKey: userDirectoryQueryKeys.user(renterUid),
  });

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-xl">
          <SheetHeader className="pr-12">
            <div className="grid gap-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <SheetTitle>{getBookingAssetTitle(booking)}</SheetTitle>
                  <SheetDescription>{booking.id}</SheetDescription>
                </div>
                {booking.status ? <StatusBadge value={booking.status} /> : null}
              </div>
            </div>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-5 overflow-y-auto overflow-x-hidden px-4 pb-4">
            <Section title="Participants">
              <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-stretch">
                <PersonCard
                  label="Owner"
                  name={getBookingOwnerName(booking)}
                  onView={() => setOwnerOpen(true)}
                  person={booking.asset?.owner}
                  uid={ownerUid}
                />
                <div className="hidden items-center justify-center text-muted-foreground sm:flex">
                  <ArrowRight className="size-5" />
                </div>
                <PersonCard
                  label="Renter"
                  name={getBookingRenterName(booking)}
                  onView={() => setRenterOpen(true)}
                  person={booking.renter}
                  uid={renterUid}
                />
              </div>
            </Section>

            <Section title="Schedule">
              <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-stretch">
                <DateCard
                  icon={<CalendarDays className="size-4" />}
                  label="Start date"
                  value={formatBookingDate(booking.startDate)}
                />
                <div className="flex items-center justify-center rounded-md border bg-muted px-4 py-3 text-center text-sm">
                  <div>
                    <div className="font-semibold">
                      {booking.numDays ?? "Not set"}
                    </div>
                    <div className="text-xs text-muted-foreground">days</div>
                  </div>
                </div>
                <DateCard
                  icon={<CalendarDays className="size-4" />}
                  label="End date"
                  value={formatBookingDate(booking.endDate)}
                />
              </div>
            </Section>

            <Section title="Asset details">
              <DetailRow label="Asset" value={getBookingAssetTitle(booking)} />
              <DetailRow label="Asset ID" value={booking.assetId} />
              <DetailRow label="Category" value={booking.asset?.category ?? "Not set"} />
              <DetailRow
                label="Status"
                value={booking.status ? <StatusBadge value={booking.status} /> : "Not set"}
              />
              <Button
                className="w-full justify-center"
                onClick={() => setAssetOpen(true)}
                type="button"
                variant="outline"
              >
                View asset
              </Button>
            </Section>

            <Section title="Payment and totals">
              <DetailRow label="Total" value={formatBookingMoney(booking.totalPrice)} />
              <DetailRow label="Payment method" value={booking.payment?.method ?? "Not set"} />
              <DetailRow label="Transaction ID" value={booking.payment?.transactionId ?? "Not set"} />
            </Section>

            <Section title="Chat">
              <DetailRow label="Chat ID" value={booking.chatId ?? "Not set"} />
              <Button
                className="w-full justify-center"
                disabled={!booking.chatId}
                onClick={() => setChatOpen(true)}
                type="button"
                variant="outline"
              >
                <MessageSquareText className="size-4" />
                View chat
              </Button>
            </Section>

            <Section title="Booking metadata">
              <DetailRow label="Booking ID" value={booking.id} />
              <DetailRow label="Created" value={formatBookingDateTime(booking.createdAt)} />
            </Section>
          </div>
        </SheetContent>
      </Sheet>
      <BookingChatSheet
        booking={booking}
        onOpenChange={setChatOpen}
        open={chatOpen}
      />
      {listingQuery.data ? (
        <ListingViewSheet
          listing={listingQuery.data}
          onOpenChange={setAssetOpen}
          open={assetOpen}
        />
      ) : null}
      {ownerQuery.data ? (
        <UserViewSheet
          onOpenChange={setOwnerOpen}
          open={ownerOpen}
          user={ownerQuery.data}
        />
      ) : null}
      {renterQuery.data ? (
        <UserViewSheet
          onOpenChange={setRenterOpen}
          open={renterOpen}
          user={renterQuery.data}
        />
      ) : null}
    </>
  );
}

function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="grid min-w-0 gap-3 rounded-md border p-4 text-sm">
      <h3 className="font-medium">{title}</h3>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function PersonCard({
  label,
  name,
  onView,
  person,
  uid,
}: {
  label: string;
  name: string;
  onView: () => void;
  person: BookingPerson | null | undefined;
  uid: string | null;
}) {
  return (
    <div className="grid min-w-0 gap-3 rounded-md border bg-muted/30 p-4">
      <div className="flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-md bg-background">
          <UserRound className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase text-muted-foreground">{label}</div>
          <div className="truncate font-medium">{name}</div>
        </div>
      </div>
      <div className="grid gap-2 text-xs">
        <DetailRow label="UID" value={uid ?? "Not set"} />
        <DetailRow label="Email" value={person?.email ?? "Not set"} />
        <DetailRow label="Phone" value={person?.phone ?? "Not set"} />
      </div>
      <Button
        className="w-full justify-center"
        disabled={!uid}
        onClick={onView}
        size="sm"
        type="button"
        variant="outline"
      >
        View user
      </Button>
    </div>
  );
}

function DateCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="grid min-w-0 gap-2 rounded-md border p-4">
      <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 text-right [overflow-wrap:anywhere]">
        {value}
      </span>
    </div>
  );
}

function findCachedUser(
  queryClient: ReturnType<typeof useQueryClient>,
  uid: string | null,
) {
  if (!uid) {
    return undefined;
  }

  const allUsers = queryClient.getQueryData<AdminUser[]>(userDirectoryQueryKeys.users);
  const adminUsers = queryClient.getQueryData<AdminUser[]>(userDirectoryQueryKeys.adminUsers);
  return [...(allUsers ?? []), ...(adminUsers ?? [])].find((user) => user.uid === uid);
}
