import { collection, doc, getDoc, getDocs, query, where, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";

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

export const userDirectoryQueryKeys = {
  root: ["admin"] as const,
  users: ["admin", "users"] as const,
  adminUsers: ["admin", "adminUsers"] as const,
  user: (uid: string | null | undefined) =>
    [...userDirectoryQueryKeys.users, uid ?? "missing"] as const,
  section: (section: UserDirectorySection) => {
    if (section === "admin-users") {
      return userDirectoryQueryKeys.adminUsers;
    }

    return userDirectoryQueryKeys.users;
  },
};

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
  const users = snapshot.docs.map(mapAdminUser);
  const submissions = await fetchPendingVerificationSubmissions();
  const submissionsByUserId = new Map(
    submissions.map((submission) => [submission.userId, submission]),
  );

  return users.map((user) => ({
    ...user,
    fullVerificationSubmission: submissionsByUserId.get(user.uid) ?? null,
  }));
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

  const user = mapAdminUser(snapshot as QueryDocumentSnapshot<DocumentData>);
  const activeSubmissionId =
    typeof user.fullVerification?.activeSubmissionId === "string"
      ? user.fullVerification.activeSubmissionId
      : null;

  if (!activeSubmissionId) {
    return user;
  }

  const submissionSnapshot = await getDoc(
    doc(getFirebaseFirestore(), "verificationSubmissions", activeSubmissionId),
  );

  return {
    ...user,
    fullVerificationSubmission: submissionSnapshot.exists()
      ? mapFullVerificationSubmission(submissionSnapshot)
      : null,
  };
}

async function fetchPendingVerificationSubmissions() {
  const snapshot = await getDocs(
    query(
      collection(getFirebaseFirestore(), "verificationSubmissions"),
      where("status", "==", "Pending"),
    ),
  );

  return snapshot.docs.map(mapFullVerificationSubmission);
}
