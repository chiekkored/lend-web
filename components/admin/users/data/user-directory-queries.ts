import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  startAfter,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import {
  mapAdminUser,
  mapFullVerificationSubmission,
  type AdminUser,
  type UserDirectorySection,
} from "@/lib/admin-users";
import {
  getFirebaseFirestore,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";
import type { AdminCursor, AdminCursorPage } from "@/lib/helpers/use-admin-cursor-pagination";

export const userDirectoryQueryKeys = {
  root: ["admin"] as const,
  users: ["admin", "users"] as const,
  adminUsers: ["admin", "adminUsers"] as const,
  verifications: ["admin", "users", "verifications"] as const,
  liveVerifications: ["admin", "users", "verifications", "live"] as const,
  verificationSubmission: (submissionId: string | null | undefined) =>
    [
      "admin",
      "verificationSubmissions",
      submissionId ?? "missing",
    ] as const,
  user: (uid: string | null | undefined) =>
    [...userDirectoryQueryKeys.users, uid ?? "missing"] as const,
  section: (section: UserDirectorySection) => {
    if (section === "admin-users") {
      return userDirectoryQueryKeys.adminUsers;
    }

    if (section === "verifications") {
      return userDirectoryQueryKeys.verifications;
    }

    return userDirectoryQueryKeys.users;
  },
};

export const VERIFICATIONS_LIVE_LIMIT = 50;

export async function fetchUserDirectorySection(
  section: UserDirectorySection,
): Promise<AdminUser[]> {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }

  if (section === "admin-users") {
    return fetchAdminUsers();
  }

  if (section === "verifications") {
    return fetchPendingVerificationUsers();
  }

  return fetchAllUsers();
}

export async function fetchAdminUsers() {
  const adminUsersCollection = collection(getFirebaseFirestore(), "adminUsers");
  const snapshot = await getDocs(
    query(adminUsersCollection, where("status", "==", "Active")),
  );

  return snapshot.docs.map(mapAdminUser);
}

export async function fetchAllUsers() {
  const snapshot = await getDocs(collection(getFirebaseFirestore(), "users"));

  return snapshot.docs.map(mapAdminUser);
}

export async function fetchAllUsersPage({
  cursor,
  pageSize,
}: {
  cursor: AdminCursor;
  pageSize: number;
}): Promise<AdminCursorPage<AdminUser>> {
  const usersQuery = cursor
    ? query(
        collection(getFirebaseFirestore(), "users"),
        startAfter(cursor),
        limit(pageSize),
      )
    : query(collection(getFirebaseFirestore(), "users"), limit(pageSize));
  const snapshot = await getDocs(usersQuery);

  return mapUserPage(snapshot.docs, pageSize);
}

export async function fetchAdminUsersPage({
  cursor,
  pageSize,
}: {
  cursor: AdminCursor;
  pageSize: number;
}): Promise<AdminCursorPage<AdminUser>> {
  const adminUsersCollection = collection(getFirebaseFirestore(), "adminUsers");
  const adminUsersQuery = cursor
    ? query(
        adminUsersCollection,
        where("status", "==", "Active"),
        startAfter(cursor),
        limit(pageSize),
      )
    : query(adminUsersCollection, where("status", "==", "Active"), limit(pageSize));
  const snapshot = await getDocs(adminUsersQuery);

  return mapUserPage(snapshot.docs, pageSize);
}

export async function fetchPendingVerificationUsersPage({
  cursor,
  pageSize,
}: {
  cursor: AdminCursor;
  pageSize: number;
}): Promise<AdminCursorPage<AdminUser>> {
  const verificationsQuery = cursor
    ? query(
        collection(getFirebaseFirestore(), "users"),
        where("fullVerification.status", "==", "Pending"),
        startAfter(cursor),
        limit(pageSize),
      )
    : query(
        collection(getFirebaseFirestore(), "users"),
        where("fullVerification.status", "==", "Pending"),
        limit(pageSize),
      );
  const snapshot = await getDocs(verificationsQuery);

  return hydrateVerificationSubmissions(mapUserPage(snapshot.docs, pageSize));
}

export async function fetchPendingVerificationUsers() {
  const snapshot = await getDocs(
    query(
      collection(getFirebaseFirestore(), "users"),
      where("fullVerification.status", "==", "Pending"),
    ),
  );

  const users = snapshot.docs.map(mapAdminUser);
  const usersWithSubmissions = await Promise.all(
    users.map(async (user) => {
      const submissionId =
        typeof user.fullVerification?.activeSubmissionId === "string"
          ? user.fullVerification.activeSubmissionId
          : null;
      if (!submissionId) {
        return user;
      }

      return {
        ...user,
        fullVerificationSubmission:
          await fetchFullVerificationSubmission(submissionId),
      };
    }),
  );

  return usersWithSubmissions;
}

export function listenPendingVerificationUsers({
  onError,
  onNext,
  pageSize = VERIFICATIONS_LIVE_LIMIT,
}: {
  onError: (error: Error) => void;
  onNext: (page: AdminCursorPage<AdminUser>) => void;
  pageSize?: number;
}) {
  if (!hasFirebaseConfig) {
    onError(
      new Error(
        `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
      ),
    );
    return () => {};
  }

  return onSnapshot(
    query(
      collection(getFirebaseFirestore(), "users"),
      where("fullVerification.status", "==", "Pending"),
      limit(pageSize),
    ),
    async (snapshot) => {
      try {
        onNext(await hydrateVerificationSubmissions(mapUserPage(snapshot.docs, pageSize)));
      } catch (error) {
        onError(error instanceof Error ? error : new Error("Unable to load verification users."));
      }
    },
    onError,
  );
}

async function hydrateVerificationSubmissions(
  page: AdminCursorPage<AdminUser>,
): Promise<AdminCursorPage<AdminUser>> {
  const usersWithSubmissions = await Promise.all(
    page.items.map(async (user) => {
      const submissionId =
        typeof user.fullVerification?.activeSubmissionId === "string"
          ? user.fullVerification.activeSubmissionId
          : null;
      if (!submissionId) {
        return user;
      }

      return {
        ...user,
        fullVerificationSubmission:
          await fetchFullVerificationSubmission(submissionId),
      };
    }),
  );

  return {
    ...page,
    items: usersWithSubmissions,
  };
}

function mapUserPage(
  docs: QueryDocumentSnapshot<DocumentData>[],
  pageSize: number,
): AdminCursorPage<AdminUser> {
  return {
    hasMore: docs.length === pageSize,
    items: docs.map(mapAdminUser),
    lastCursor: docs.at(-1) ?? null,
  };
}

export async function fetchAdminUser(uid: string): Promise<AdminUser | null> {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }

  const snapshot = await getDoc(doc(getFirebaseFirestore(), "users", uid));
  if (!snapshot.exists()) {
    return null;
  }

  return mapAdminUser(snapshot as QueryDocumentSnapshot<DocumentData>);
}

export async function fetchFullVerificationSubmission(
  submissionId: string,
) {
  if (!hasFirebaseConfig) {
    throw new Error(
      `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
    );
  }

  const snapshot = await getDoc(
    doc(getFirebaseFirestore(), "verificationSubmissions", submissionId),
  );

  return snapshot.exists() ? mapFullVerificationSubmission(snapshot) : null;
}
