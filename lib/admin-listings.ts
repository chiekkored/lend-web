import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export type ListingRates = {
  daily: number | null;
  weekly: number | null;
  monthly: number | null;
  annually: number | null;
  notes: string | null;
};

export type ListingOwner = {
  uid: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  email: string | null;
  phone: string | null;
};

export type AdminListing = {
  id: string;
  ownerId: string | null;
  owner: ListingOwner | null;
  title: string | null;
  description: string | null;
  categoryId: string | null;
  categoryName: string | null;
  subcategoryId: string | null;
  subcategoryName: string | null;
  rates: ListingRates;
  location: Record<string, unknown> | null;
  images: string[];
  showcase: string[];
  inclusions: string[];
  createdAt: Date | null;
  status: string | null;
  isDeleted: boolean;
  averageRating: number | null;
  reviewCount: number | null;
  pendingBookingCount: number;
  popularityScore: number | null;
  qualityScore: number | null;
  recommendationScore: number | null;
  suppressFromRecommendations: boolean;
};

export type ListingUpdateValues = {
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  subcategoryId: string | null;
  subcategoryName: string | null;
  status: string;
  rates: ListingRates;
  inclusions: string[];
  images: string[];
  showcase: string[];
  suppressFromRecommendations: boolean;
};

export const listingStatuses = [
  "Available",
  "Under Maintenance",
  "Hidden",
  "Rejected",
  "Reported",
  "Archived",
  "Pending",
  "Approved",
] as const;

export const adminListingStatusUpdateValues = [
  "Available",
  "Under Maintenance",
  "Hidden",
  "Archived",
] as const;

export type AdminListingStatusUpdate =
  (typeof adminListingStatusUpdateValues)[number];

export function mapAdminListing(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): AdminListing {
  const data = snapshot.data();
  const rates = asRecord(data.rates);

  return {
    id: asString(data.id) ?? snapshot.id,
    ownerId: asString(data.ownerId),
    owner: mapListingOwner(data.owner),
    title: asString(data.title),
    description: asString(data.description),
    categoryId: asString(data.categoryId),
    categoryName: asString(data.categoryName),
    subcategoryId: asString(data.subcategoryId),
    subcategoryName: asString(data.subcategoryName),
    rates: {
      daily: asNumber(rates?.daily),
      weekly: asNumber(rates?.weekly),
      monthly: asNumber(rates?.monthly),
      annually: asNumber(rates?.annually),
      notes: asString(rates?.notes),
    },
    location: asRecord(data.location),
    images: asStringList(data.images),
    showcase: asStringList(data.showcase),
    inclusions: asStringList(data.inclusions),
    createdAt: toDate(data.createdAt),
    status: asString(data.status),
    isDeleted: data.isDeleted === true,
    averageRating: asNumber(data.averageRating),
    reviewCount: asNumber(data.reviewCount),
    pendingBookingCount: asNumber(data.pendingBookingCount) ?? 0,
    popularityScore: asNumber(data.popularityScore),
    qualityScore: asNumber(data.qualityScore),
    recommendationScore: asNumber(data.recommendationScore),
    suppressFromRecommendations: data.suppressFromRecommendations === true,
  };
}

export function getListingOwnerName(listing: AdminListing) {
  if (!listing.owner) {
    return listing.ownerId ?? "No owner";
  }

  if (listing.owner.displayName) {
    return listing.owner.displayName;
  }

  const name = [listing.owner.firstName, listing.owner.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || listing.owner.uid || listing.ownerId || "No owner";
}

export function getListingThumbnail(listing: AdminListing) {
  return listing.images[0] ?? listing.showcase[0] ?? null;
}

export function formatListingDate(value: Date | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(value);
}

export function formatListingPrice(value: number | null) {
  if (value == null) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export function formatLocation(location: Record<string, unknown> | null) {
  if (!location) {
    return "Not set";
  }

  const parts = [
    asString(location.formattedAddress) ?? asString(location.description),
    asString(location.locality) ?? asString(location.cityState),
    asString(location.country),
  ].filter(Boolean);

  return parts.join(", ") || "Location set";
}

export function formatLocationScope(location: Record<string, unknown> | null) {
  if (!location) {
    return "Not set";
  }

  const country = asString(location.country);
  const cityState = asString(location.locality) ?? asString(location.cityState);

  return [country, cityState].filter(Boolean).join(" / ") || "Not set";
}

export function buildListingSearchText(listing: AdminListing) {
  return [
    listing.id,
    listing.title,
    listing.categoryName,
    listing.subcategoryName,
    getListingOwnerName(listing),
    listing.ownerId,
    listing.status,
    formatListingPrice(listing.rates.daily),
  ]
    .filter(Boolean)
    .join(" ");
}

function mapListingOwner(value: unknown): ListingOwner | null {
  const owner = asRecord(value);
  if (!owner) {
    return null;
  }

  return {
    uid: asString(owner.uid),
    firstName: asString(owner.firstName),
    lastName: asString(owner.lastName),
    displayName: asString(owner.displayName),
    email: asString(owner.email),
    phone: asString(owner.phone),
  };
}

function asStringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "_seconds" in value &&
    typeof value._seconds === "number"
  ) {
    return new Date(value._seconds * 1000);
  }

  return null;
}
