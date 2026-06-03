"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Image from "next/image";

import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  fetchAdminUser,
  userDirectoryQueryKeys,
} from "@/components/admin/users/data/user-directory-queries";
import {
  formatListingDate,
  formatListingPrice,
  formatLocation,
  formatLocationScope,
  getListingOwnerName,
  type AdminListing,
} from "@/lib/admin-listings";
import type { AdminUser } from "@/lib/admin-users";

import { ListingAuditHistorySheet } from "./listing-audit-history-sheet";

const UserViewSheet = dynamic(
  () => import("@/components/admin/users/components/user-view-sheet").then((mod) => mod.UserViewSheet),
  { ssr: false },
);

type ListingViewSheetProps = {
  listing: AdminListing;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function ListingViewSheet({ listing, onOpenChange, open }: ListingViewSheetProps) {
  const [auditOpen, setAuditOpen] = React.useState(false);
  const [ownerOpen, setOwnerOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const ownerUid = listing.ownerId ?? listing.owner?.uid ?? null;
  const ownerQuery = useQuery({
    enabled: ownerOpen && Boolean(ownerUid),
    initialData: () => findCachedUser(queryClient, ownerUid),
    queryFn: () => fetchAdminUser(ownerUid ?? ""),
    queryKey: userDirectoryQueryKeys.user(ownerUid),
  });
  const photos = uniquePhotos(listing.images);
  const showcasePhotos = uniquePhotos(listing.showcase);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader className="pr-12">
          <div className="min-w-0">
            <Button
              className="h-auto shrink-0 px-0 py-0 text-sm"
              onClick={() => setAuditOpen(true)}
              type="button"
              variant="link"
            >
              View Audit History
            </Button>
            <SheetTitle>{listing.title ?? "Untitled listing"}</SheetTitle>
            <SheetDescription>{listing.id}</SheetDescription>
          </div>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-5 overflow-y-auto px-4 pb-4">
          {photos.length ? (
            <PhotoCarousel altPrefix={listing.title ?? "Listing photo"} photos={photos} size="large" />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
              No photo
            </div>
          )}

          {showcasePhotos.length ? (
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Showcase photos</h3>
              <PhotoCarousel
                altPrefix={`${listing.title ?? "Listing"} showcase photo`}
                photos={showcasePhotos}
                size="small"
              />
            </div>
          ) : null}

          <div className="grid gap-3 rounded-md border p-4 text-sm">
            <DetailRow label="Owner" value={getListingOwnerName(listing)} />
            <DetailRow label="Owner ID" value={listing.ownerId ?? "Not set"} />
            <Button
              className="w-full justify-center"
              disabled={!ownerUid}
              onClick={() => setOwnerOpen(true)}
              type="button"
              variant="outline"
            >
              View owner
            </Button>
            <DetailRow label="Category" value={listing.categoryName ?? "Not set"} />
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Status</span>
              {listing.status ? <StatusBadge value={listing.status} /> : <span>Not set</span>}
            </div>
            <DetailRow label="Created" value={formatListingDate(listing.createdAt)} />
            <DetailRow label="Location" value={formatLocation(listing.location)} />
          </div>

          <div className="grid gap-3 rounded-md border p-4 text-sm">
            <DetailRow label="Daily" value={formatListingPrice(listing.rates.daily)} />
            <DetailRow label="Weekly" value={formatListingPrice(listing.rates.weekly)} />
            <DetailRow label="Monthly" value={formatListingPrice(listing.rates.monthly)} />
            <DetailRow label="Annual" value={formatListingPrice(listing.rates.annually)} />
            <DetailRow label="Rate notes" value={listing.rates.notes ?? "Not set"} />
          </div>

          <div className="grid gap-2 text-sm">
            <h3 className="font-medium">Description</h3>
            <p className="whitespace-pre-wrap text-muted-foreground">{listing.description ?? "No description"}</p>
          </div>

          <div className="grid gap-2 text-sm">
            <h3 className="font-medium">Inclusions</h3>
            {listing.inclusions.length ? (
              <ul className="grid gap-1 text-muted-foreground">
                {listing.inclusions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No inclusions</p>
            )}
          </div>

          <div className="grid gap-2 text-sm">
            <h3 className="font-medium">Activity</h3>
            <div className="grid gap-1 text-muted-foreground">
              <span>Pending bookings: {listing.pendingBookingCount}</span>
              <span>
                Rating:{" "}
                {listing.averageRating == null
                  ? "Not rated"
                  : `${listing.averageRating.toFixed(1)} (${listing.reviewCount ?? 0})`}
              </span>
            </div>
          </div>

          <div className="grid gap-2 text-sm">
            <h3 className="font-medium">Recommendations</h3>
            <div className="grid gap-1 text-muted-foreground">
              <span>Location scope: {formatLocationScope(listing.location)}</span>
              <span>Suppressed: {listing.suppressFromRecommendations ? "Yes" : "No"}</span>
              <span>Popularity score: {formatScore(listing.popularityScore)}</span>
              <span>Quality score: {formatScore(listing.qualityScore)}</span>
              <span>Recommendation score: {formatScore(listing.recommendationScore)}</span>
            </div>
          </div>
        </div>
      </SheetContent>
      <ListingAuditHistorySheet listing={listing} onOpenChange={setAuditOpen} open={auditOpen} />
      {ownerQuery.data ? (
        <UserViewSheet
          onOpenChange={setOwnerOpen}
          open={ownerOpen}
          user={ownerQuery.data}
        />
      ) : null}
    </Sheet>
  );
}

function formatScore(value: number | null) {
  return value == null ? "Not set" : value.toFixed(2);
}

function PhotoCarousel({ altPrefix, photos, size }: { altPrefix: string; photos: string[]; size: "large" | "small" }) {
  const imageClassName = size === "large" ? "aspect-video" : "aspect-[4/3]";
  const imageSizes =
    size === "large" ? "(min-width: 640px) 576px, calc(100vw - 2rem)" : "(min-width: 640px) 220px, 45vw";

  return (
    <Carousel className="w-full" opts={{ align: "start", loop: photos.length > 1 }}>
      <CarouselContent>
        {photos.map((photo, index) => (
          <CarouselItem className={size === "small" ? "basis-1/2 sm:basis-1/3" : undefined} key={photo}>
            <div className={`relative overflow-hidden rounded-md border ${imageClassName}`}>
              <Image
                alt={`${altPrefix} ${index + 1}`}
                className="object-cover"
                fill
                sizes={imageSizes}
                src={photo}
                unoptimized
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {photos.length > 1 ? (
        <>
          <CarouselPrevious className="left-2 bg-background/90" />
          <CarouselNext className="right-2 bg-background/90" />
        </>
      ) : null}
    </Carousel>
  );
}

function uniquePhotos(photos: string[]) {
  return Array.from(new Set(photos));
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
