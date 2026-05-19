import type { DocumentData, DocumentSnapshot, QueryDocumentSnapshot } from "firebase/firestore";

export type VerificationLevel = "None" | "Basic" | "Full" | string;

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
  verified: VerificationLevel;
  fullVerification: Record<string, unknown> | null;
  fullVerificationSubmission: FullVerificationSubmission | null;
  userMetadataVersion: number;
};

export type FullVerificationSubmission = {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: Date | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  location: Record<string, unknown> | null;
  photoUrl: string | null;
  faceKycStatus: string | null;
  verificationProvider: string | null;
  diditSessionId: string | null;
  diditWorkflowId: string | null;
  diditStatus: string | null;
  diditDecision: Record<string, unknown> | null;
  diditStartedAt: Date | null;
  diditCompletedAt: Date | null;
  requestType: string | null;
  updatedFields: string[];
  status: string | null;
  submittedAt: Date | null;
  reviewedAt: Date | null;
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
    description: "Users waiting for full verification review.",
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
    verified: asString(data.verified) ?? "None",
    fullVerification: asRecord(data.fullVerification),
    fullVerificationSubmission: null,
    userMetadataVersion: asNumber(data.userMetadataVersion) ?? 1,
  };
}

export function mapFullVerificationSubmission(
  snapshot: DocumentSnapshot<DocumentData>,
): FullVerificationSubmission {
  const data = snapshot.data() ?? {};

  return {
    id: asString(data.id) ?? snapshot.id,
    userId: asString(data.userId) ?? "",
    firstName: asString(data.firstName),
    lastName: asString(data.lastName),
    dateOfBirth: toDate(data.dateOfBirth),
    email: asString(data.email),
    phone: asString(data.phone),
    address: asString(data.address),
    location: asRecord(data.location),
    photoUrl: asString(data.photoUrl),
    faceKycStatus: asString(data.faceKycStatus),
    verificationProvider: asString(data.verificationProvider),
    diditSessionId: asString(data.diditSessionId),
    diditWorkflowId: asString(data.diditWorkflowId),
    diditStatus: asString(data.diditStatus),
    diditDecision: asRecord(data.diditDecision),
    diditStartedAt: toDate(data.diditStartedAt),
    diditCompletedAt: toDate(data.diditCompletedAt),
    requestType: asString(data.requestType),
    updatedFields: asStringArray(data.updatedFields),
    status: asString(data.status),
    submittedAt: toDate(data.submittedAt),
    reviewedAt: toDate(data.reviewedAt),
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
      (user) => user.fullVerification?.status === "Pending",
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

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
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
