import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export type AdminAmenity = {
  id: string;
  label: string;
  iconKey: string;
  group: string;
  sortOrder: number;
  isActive: boolean;
  appliesToDetailSchemaKeys: string[];
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type AmenityWriteValues = {
  id: string;
  label: string;
  iconKey: string;
  group: string;
  sortOrder: number;
  isActive: boolean;
  appliesToDetailSchemaKeys: string[];
};

export function mapAdminAmenity(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): AdminAmenity {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    label: asString(data.label) ?? snapshot.id,
    iconKey: asString(data.iconKey) ?? "default",
    group: asString(data.group) ?? "General",
    sortOrder: asNumber(data.sortOrder) ?? 0,
    isActive: data.isActive === true,
    appliesToDetailSchemaKeys: asStringList(data.appliesToDetailSchemaKeys),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export function formatAmenityDate(value: Date | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(value);
}

export function normalizeAmenityId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asStringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean),
    ),
  );
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate();
  }
  return null;
}
