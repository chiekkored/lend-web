"use client";

import { useQuery } from "@tanstack/react-query";
import type { DocumentData } from "firebase/firestore";
import { ExternalLink, MessageSquareText } from "lucide-react";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  formatBookingDate,
  formatBookingDateTime,
  formatBookingMoney,
  getBookingAssetTitle,
  getBookingOwnerName,
  getBookingRenterName,
  type AdminBooking,
  type AdminBookingMessage,
} from "@/lib/admin-bookings";
import {
  formatListingDate,
  formatListingPrice,
  formatLocation,
  getListingOwnerName,
  type AdminListing,
} from "@/lib/admin-listings";
import { getUserDisplayName, type AdminUser } from "@/lib/admin-users";

import {
  fetchAdminReportAsset,
  fetchAdminReportBooking,
  fetchAdminReportChat,
  fetchAdminReportMessages,
  fetchAdminReportUser,
  reportQueryKeys,
} from "../data/report-queries";

type SheetProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function ReportUserSheet({
  onOpenChange,
  open,
  role,
  uid,
}: SheetProps & { role: string; uid: string | null }) {
  const userQuery = useQuery({
    enabled: open && Boolean(uid),
    queryFn: () => fetchAdminReportUser(uid ?? ""),
    queryKey: reportQueryKeys.user(uid),
  });

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader className="pr-12">
          <SheetTitle>{role}</SheetTitle>
          <SheetDescription>{uid ?? "No user ID"}</SheetDescription>
        </SheetHeader>
        <EntityBody
          emptyText="No user is linked to this report."
          errorText={getQueryError(userQuery.error, "Unable to load user.")}
          loading={userQuery.isLoading}
          missingText="User record was not found."
          present={Boolean(userQuery.data)}
          requested={Boolean(uid)}
        >
          {userQuery.data ? <UserDetails user={userQuery.data} /> : null}
        </EntityBody>
      </SheetContent>
    </Sheet>
  );
}

export function ReportAssetSheet({
  assetId,
  onOpenChange,
  open,
}: SheetProps & { assetId: string | null }) {
  const assetQuery = useQuery({
    enabled: open && Boolean(assetId),
    queryFn: () => fetchAdminReportAsset(assetId ?? ""),
    queryKey: reportQueryKeys.asset(assetId),
  });

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader className="pr-12">
          <SheetTitle>Asset</SheetTitle>
          <SheetDescription>{assetId ?? "No asset ID"}</SheetDescription>
        </SheetHeader>
        <EntityBody
          emptyText="No asset is linked to this report."
          errorText={getQueryError(assetQuery.error, "Unable to load asset.")}
          loading={assetQuery.isLoading}
          missingText="Asset record was not found."
          present={Boolean(assetQuery.data)}
          requested={Boolean(assetId)}
        >
          {assetQuery.data ? <AssetDetails listing={assetQuery.data} /> : null}
        </EntityBody>
      </SheetContent>
    </Sheet>
  );
}

export function ReportBookingSheet({
  assetId,
  bookingId,
  onOpenChange,
  open,
}: SheetProps & { assetId: string | null; bookingId: string | null }) {
  const bookingQuery = useQuery({
    enabled: open && Boolean(bookingId),
    queryFn: () =>
      fetchAdminReportBooking({
        assetId,
        bookingId: bookingId ?? "",
      }),
    queryKey: reportQueryKeys.booking(bookingId, assetId),
  });

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader className="pr-12">
          <SheetTitle>Booking</SheetTitle>
          <SheetDescription>{bookingId ?? "No booking ID"}</SheetDescription>
        </SheetHeader>
        <EntityBody
          emptyText="No booking is linked to this report."
          errorText={getQueryError(bookingQuery.error, "Unable to load booking.")}
          loading={bookingQuery.isLoading}
          missingText="Booking record was not found."
          present={Boolean(bookingQuery.data)}
          requested={Boolean(bookingId)}
        >
          {bookingQuery.data ? <BookingDetails booking={bookingQuery.data} /> : null}
        </EntityBody>
      </SheetContent>
    </Sheet>
  );
}

export function ReportChatSheet({
  chatId,
  onOpenChange,
  open,
}: SheetProps & { chatId: string | null }) {
  const chatQuery = useQuery({
    enabled: open && Boolean(chatId),
    queryFn: () => fetchAdminReportChat(chatId ?? ""),
    queryKey: reportQueryKeys.chat(chatId),
  });
  const messagesQuery = useQuery({
    enabled: open && Boolean(chatId),
    queryFn: () => fetchAdminReportMessages(chatId ?? ""),
    queryKey: reportQueryKeys.messages(chatId),
  });

  const error =
    getQueryError(chatQuery.error, "Unable to load chat.") ??
    getQueryError(messagesQuery.error, "Unable to load chat messages.");

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader className="pr-12">
          <SheetTitle>Chat</SheetTitle>
          <SheetDescription>{chatId ?? "No chat ID"}</SheetDescription>
        </SheetHeader>
        <EntityBody
          emptyText="No chat is linked to this report."
          errorText={error}
          loading={chatQuery.isLoading || messagesQuery.isLoading}
          missingText="Chat record was not found."
          present={Boolean(chatQuery.data) || Boolean(messagesQuery.data?.length)}
          requested={Boolean(chatId)}
        >
          <ChatDetails
            chat={chatQuery.data ?? null}
            messages={messagesQuery.data ?? []}
          />
        </EntityBody>
      </SheetContent>
    </Sheet>
  );
}

function UserDetails({ user }: { user: AdminUser }) {
  return (
    <div className="grid gap-3 rounded-md border p-4 text-sm">
      <DetailRow label="Name" value={getUserDisplayName(user)} />
      <DetailRow label="UID" value={user.uid} />
      <DetailRow label="Email" value={user.email ?? "Not set"} />
      <DetailRow label="Phone" value={user.phone ?? "Not set"} />
      <DetailRow label="Type" value={user.type ?? "Not set"} />
      <DetailRow
        label="Status"
        value={user.status ? <StatusBadge value={user.status} /> : "Not set"}
      />
    </div>
  );
}

function AssetDetails({ listing }: { listing: AdminListing }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-md border p-4 text-sm">
        <DetailRow label="Title" value={listing.title ?? "Untitled listing"} />
        <DetailRow label="Asset ID" value={listing.id} />
        <DetailRow label="Owner" value={getListingOwnerName(listing)} />
        <DetailRow label="Owner ID" value={listing.ownerId ?? "Not set"} />
        <DetailRow label="Category" value={listing.category ?? "Not set"} />
        <DetailRow
          label="Status"
          value={listing.status ? <StatusBadge value={listing.status} /> : "Not set"}
        />
        <DetailRow label="Daily" value={formatListingPrice(listing.rates.daily)} />
        <DetailRow label="Created" value={formatListingDate(listing.createdAt)} />
        <DetailRow label="Location" value={formatLocation(listing.location)} />
      </div>
      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
        {listing.description ?? "No description"}
      </p>
    </div>
  );
}

function BookingDetails({ booking }: { booking: AdminBooking }) {
  return (
    <div className="grid gap-3 rounded-md border p-4 text-sm">
      <DetailRow label="Booking ID" value={booking.id} />
      <DetailRow label="Asset" value={getBookingAssetTitle(booking)} />
      <DetailRow label="Owner" value={getBookingOwnerName(booking)} />
      <DetailRow label="Renter" value={getBookingRenterName(booking)} />
      <DetailRow
        label="Status"
        value={booking.status ? <StatusBadge value={booking.status} /> : "Not set"}
      />
      <DetailRow label="Start" value={formatBookingDate(booking.startDate)} />
      <DetailRow label="End" value={formatBookingDate(booking.endDate)} />
      <DetailRow label="Total" value={formatBookingMoney(booking.totalPrice)} />
      <DetailRow label="Chat ID" value={booking.chatId ?? "Not set"} />
      <DetailRow label="Created" value={formatBookingDateTime(booking.createdAt)} />
    </div>
  );
}

function ChatDetails({
  chat,
  messages,
}: {
  chat: DocumentData | null;
  messages: AdminBookingMessage[];
}) {
  return (
    <div className="grid gap-4">
      {chat ? (
        <div className="grid gap-3 rounded-md border p-4 text-sm">
          <DetailRow label="Last message" value={asText(chat.lastMessage)} />
          <DetailRow label="Last sender" value={asText(chat.lastMessageSenderId)} />
          <DetailRow label="Booking ID" value={asText(chat.bookingId)} />
          <DetailRow label="Renter ID" value={asText(chat.renterId)} />
          <DetailRow label="Status" value={asText(chat.status)} />
        </div>
      ) : null}

      {messages.length ? (
        <div className="grid gap-3">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      ) : (
        <div className="grid min-h-40 place-items-center rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          <div className="grid justify-items-center gap-3">
            <MessageSquareText className="size-6" />
            <p>No messages in this chat.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: AdminBookingMessage }) {
  const text = message.text ?? message.mediaUrl ?? "No message content";
  const isMedia = ["image", "video"].includes(message.type?.toLowerCase() ?? "");
  const mediaUrl = message.mediaUrl ?? message.text;

  return (
    <div className="grid max-w-full gap-2 rounded-md border p-3 text-sm [overflow-wrap:anywhere]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{message.senderId ?? "Unknown sender"}</span>
        {message.type ? (
          <Badge className="font-normal" variant="outline">
            {message.type}
          </Badge>
        ) : null}
      </div>
      {isMedia && mediaUrl ? (
        <a
          className="inline-flex items-center gap-1 break-all text-primary underline-offset-4 hover:underline"
          href={mediaUrl}
          rel="noreferrer"
          target="_blank"
        >
          Open media <ExternalLink className="size-3.5 shrink-0" />
        </a>
      ) : (
        <p className="whitespace-pre-wrap break-words text-muted-foreground">
          {text}
        </p>
      )}
      <span className="text-xs text-muted-foreground">
        {formatBookingDateTime(message.createdAt)}
      </span>
    </div>
  );
}

function EntityBody({
  children,
  emptyText,
  errorText,
  loading,
  missingText,
  present,
  requested,
}: {
  children: ReactNode;
  emptyText: string;
  errorText: string | null;
  loading: boolean;
  missingText: string;
  present: boolean;
  requested: boolean;
}) {
  return (
    <div className="grid flex-1 auto-rows-min gap-5 overflow-y-auto overflow-x-hidden px-4 pb-4">
      {!requested ? (
        <EmptyState text={emptyText} />
      ) : loading ? (
        <EmptyState text="Loading details..." />
      ) : errorText ? (
        <EmptyState destructive text={errorText} />
      ) : present ? (
        children
      ) : (
        <EmptyState text={missingText} />
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
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

function EmptyState({
  destructive,
  text,
}: {
  destructive?: boolean;
  text: string;
}) {
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

function getQueryError(error: unknown, fallback: string) {
  if (!error) {
    return null;
  }

  return error instanceof Error ? error.message : fallback;
}

function asText(value: unknown) {
  return typeof value === "string" && value.trim() ? value : "Not set";
}
