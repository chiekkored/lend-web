import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export type EligibilityLabel = "No" | "Pending" | "Yes" | string;

export type AdminUser = {
  uid: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  dateOfBirth: Date | null;
  location: unknown;
  photoUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
  email: string | null;
  phone: string | null;
  type: string | null;
  adminType: string | null;
  status: string | null;
  isListingEligible: EligibilityLabel | null;
  isRentingEligible: EligibilityLabel | null;
  userMetadataVersion: number;
};

export type UserDirectorySection =
  | "verifications"
  | "admin-users"
  | "all-users";

export const userDirectoryContent: Record<
  UserDirectorySection,
  {
    title: string;
    description: string;
  }
> = {
  verifications: {
    title: "Verifications List",
    description:
      "Users waiting on listing or renting eligibility review.",
  },
  "admin-users": {
    title: "Admin Users",
    description: "Admin profiles from the dedicated admin users collection.",
  },
  "all-users": {
    title: "All Users",
    description: "All user profiles from the canonical users collection.",
  },
};

export function isUserDirectorySection(
  value: string,
): value is UserDirectorySection {
  return value in userDirectoryContent;
}

export function mapAdminUser(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): AdminUser {
  const data = snapshot.data();

  return {
    uid: asString(data.uid) ?? snapshot.id,
    firstName: asString(data.firstName),
    lastName: asString(data.lastName),
    displayName: asString(data.displayName),
    dateOfBirth: toDate(data.dateOfBirth),
    location: data.location ?? null,
    photoUrl: asString(data.photoUrl),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    deletedAt: toDate(data.deletedAt),
    email: asString(data.email),
    phone: asString(data.phone),
    type: asString(data.type),
    adminType: asString(data.adminType),
    status: asString(data.status),
    isListingEligible: asString(data.isListingEligible),
    isRentingEligible: asString(data.isRentingEligible),
    userMetadataVersion: asNumber(data.userMetadataVersion) ?? 1,
  };
}

export function filterUsersBySection(
  users: AdminUser[],
  section: UserDirectorySection,
) {
  if (section === "admin-users") {
    return users.filter((user) => user.status !== "Deleted");
  }

  if (section === "verifications") {
    return users.filter(
      (user) =>
        user.isListingEligible === "Pending" ||
        user.isRentingEligible === "Pending",
    );
  }

  return users;
}

export function getUserDisplayName(user: AdminUser) {
  if (user.displayName) {
    return user.displayName;
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || "No name";
}

export function canManageAdminUser({
  callerAdminType,
  targetAdminType,
}: {
  callerAdminType: string | null;
  targetAdminType: string | null;
}) {
  if (callerAdminType === "superadmin") {
    return true;
  }

  return callerAdminType === "admin" && targetAdminType !== "superadmin";
}

export function formatUserDate(value: Date | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(value);
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
