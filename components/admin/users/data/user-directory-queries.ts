import { collection, doc, getDoc, getDocs, query, where, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";

import {
  mapAdminUser,
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
  return snapshot.docs.map(mapAdminUser);
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
