"use client";

import * as React from "react";

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
  fetchAdminUsersPage,
  fetchAllUsersPage,
} from "../data/user-directory-queries";
import { useLiveVerifications } from "./use-live-verifications";
import { useAdminCursorPagination } from "@/lib/helpers/use-admin-cursor-pagination";

export function useUserDirectory(section: UserDirectorySection) {
  const content = userDirectoryContent[section];
  const [callerAdminType, setCallerAdminType] = React.useState<string | null>(
    null,
  );
  const [callerUid, setCallerUid] = React.useState<string | null>(null);
  const isVerifications = section === "verifications";
  const liveVerifications = useLiveVerifications({ enabled: isVerifications });
  const fetchPage = React.useCallback(
    (input: Parameters<typeof fetchAllUsersPage>[0]) =>
      section === "admin-users"
        ? fetchAdminUsersPage(input)
        : fetchAllUsersPage(input),
    [section],
  );
  const paginatedUsers = useAdminCursorPagination({
    enabled: !isVerifications,
    fetchPage,
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
    data: filterUsersBySection(
      isVerifications ? liveVerifications.data : paginatedUsers.data,
      section,
    ),
    error: isVerifications ? liveVerifications.error : paginatedUsers.error,
    loading: isVerifications ? liveVerifications.loading : paginatedUsers.loading,
    pagination: isVerifications
      ? liveVerifications.pagination
      : paginatedUsers.pagination,
  };
}
