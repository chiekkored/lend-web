import { collection, getDocs, query, where } from "firebase/firestore";

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
