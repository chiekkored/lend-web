import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  iconKey: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  parentId: string | null;
  listingKind: string;
  detailSchemaKey: string;
  level: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type CategoryWriteValues = {
  name: string;
  slug: string;
  iconKey: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  parentId: string | null;
  listingKind: string;
  detailSchemaKey: string;
};

export const seedAdminCategories: CategoryWriteValues[] = [
  categorySeed("cameras", "Cameras", "camera", 10),
  categorySeed("vehicles", "Vehicles", "car", 20),
  categorySeed("tools", "Tools", "tools", 30),
  categorySeed("spaces", "Spaces", "space", 40),
  categorySeed("outdoor-gear", "Outdoor Gear", "outdoor", 50),
  categorySeed("electronics", "Electronics", "electronics", 60),
  categorySeed("drones", "Drones", "drone", 70),
  categorySeed("party-supplies", "Party Supplies", "party", 80),
];

export function mapAdminCategory(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): AdminCategory {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: asString(data.name) ?? snapshot.id,
    slug: asString(data.slug) ?? snapshot.id,
    iconKey: asString(data.iconKey) ?? "default",
    imageUrl: asString(data.imageUrl),
    sortOrder: asNumber(data.sortOrder) ?? 0,
    isActive: data.isActive === true,
    isFeatured: data.isFeatured === true,
    parentId: asString(data.parentId),
    listingKind:
      asString(data.listingKind) ?? fallbackCategorySchema(snapshot.id),
    detailSchemaKey:
      asString(data.detailSchemaKey) ?? fallbackCategorySchema(snapshot.id),
    level: asNumber(data.level) ?? 1,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export function buildCategorySearchText(category: AdminCategory) {
  return [
    category.id,
    category.name,
    category.slug,
    category.iconKey,
    category.parentId,
    category.isActive ? "active" : "inactive",
    category.isFeatured ? "featured" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function formatCategoryDate(value: Date | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(value);
}

export function getCategoryParentName(
  category: AdminCategory,
  categories: AdminCategory[],
) {
  if (!category.parentId) return "Parent";
  return (
    categories.find((item) => item.id === category.parentId)?.name ??
    category.parentId
  );
}

export function normalizeCategorySlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function categorySeed(
  slug: string,
  name: string,
  iconKey: string,
  sortOrder: number,
): CategoryWriteValues {
  return {
    iconKey,
    imageUrl: null,
    isActive: true,
    isFeatured: false,
    listingKind: fallbackCategorySchema(slug),
    detailSchemaKey: fallbackCategorySchema(slug),
    name,
    parentId: null,
    slug,
    sortOrder,
  };
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function fallbackCategorySchema(value: string) {
  const text = value.trim().toLowerCase();
  if (/stay|house|apartment|condo|room/.test(text)) return "stay";
  if (/space|studio|parking|storage/.test(text)) return "space";
  if (/vehicle|car/.test(text)) return "vehicle";
  if (/tool/.test(text)) return "tool";
  if (/electronics|camera|drone/.test(text)) return "electronics";
  if (/party|event/.test(text)) return "party_event";
  if (/clothing|apparel/.test(text)) return "clothing";
  return "generic_asset";
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
