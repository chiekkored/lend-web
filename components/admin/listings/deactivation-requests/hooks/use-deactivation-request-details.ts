"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchListingDeactivationRequestBookings,
  fetchListingDeactivationRequestOwner,
  listingDeactivationRequestQueryKeys,
  resolveListingDeactivationEvidenceUrls,
  type ListingDeactivationRequest,
} from "../data/deactivation-request-queries";

export function useDeactivationRequestDetails({
  open,
  request,
}: {
  open: boolean;
  request: ListingDeactivationRequest | null;
}) {
  const bookingsQuery = useQuery({
    enabled: open && Boolean(request?.assetId),
    queryFn: () => fetchListingDeactivationRequestBookings(request?.assetId ?? ""),
    queryKey: listingDeactivationRequestQueryKeys.bookings(request?.assetId),
  });
  const ownerQuery = useQuery({
    enabled: open && Boolean(request?.ownerId),
    queryFn: () => fetchListingDeactivationRequestOwner(request?.ownerId ?? ""),
    queryKey: listingDeactivationRequestQueryKeys.owner(request?.ownerId),
  });
  const evidenceQuery = useQuery({
    enabled: open && Boolean(request),
    queryFn: () => resolveListingDeactivationEvidenceUrls(request?.evidenceUrls ?? []),
    queryKey: listingDeactivationRequestQueryKeys.evidence(request?.id),
  });

  return {
    bookings: bookingsQuery.data ?? request?.bookingSummaries ?? [],
    bookingsLoading: bookingsQuery.isLoading,
    evidenceUrls: evidenceQuery.data ?? [],
    evidenceLoading: evidenceQuery.isLoading,
    owner: ownerQuery.data ?? null,
    ownerLoading: ownerQuery.isLoading,
  };
}
