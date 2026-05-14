"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import {
  filterUsersBySection,
  type UserDirectorySection,
  userDirectoryContent,
} from "@/lib/admin-users";
import {
  getFirebaseAuth,
  hasFirebaseConfig,
} from "@/lib/firebase";

import {
  fetchUserDirectorySection,
  userDirectoryQueryKeys,
} from "../data/user-directory-queries";

export function useUserDirectory(section: UserDirectorySection) {
  const content = userDirectoryContent[section];
  const [callerAdminType, setCallerAdminType] = React.useState<string | null>(
    null,
  );
  const [callerUid, setCallerUid] = React.useState<string | null>(null);
  const usersQuery = useQuery({
    queryFn: () => fetchUserDirectorySection(section),
    queryKey: userDirectoryQueryKeys.section(section),
  });

  React.useEffect(() => {
    let active = true;

    async function loadClaims() {
      if (!hasFirebaseConfig) {
        return;
      }

      const user = getFirebaseAuth().currentUser;
      if (!user) {
        return;
      }

      const token = await user.getIdTokenResult();
      if (!active) {
        return;
      }

      setCallerUid(user.uid);
      setCallerAdminType(
        typeof token.claims.adminType === "string"
          ? token.claims.adminType
          : null,
      );
    }

    loadClaims();

    return () => {
      active = false;
    };
  }, []);

  const canAddAdmin =
    section === "admin-users" &&
    (callerAdminType === "superadmin" || callerAdminType === "admin");

  return {
    callerAdminType,
    callerUid,
    canAddAdmin,
    content,
    data: filterUsersBySection(usersQuery.data ?? [], section),
    error:
      usersQuery.error instanceof Error
        ? usersQuery.error.message
        : usersQuery.error
          ? "Unable to load users."
          : null,
    loading: usersQuery.isLoading,
  };
}
