"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  getFirebaseAuth,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";

import { userDirectoryQueryKeys } from "../data/user-directory-queries";

const deleteAdminUrl = process.env.NEXT_PUBLIC_ADMIN_DELETE_ADMIN_FUNCTION_URL;

export function useDeleteAdminUser({ uid }: { uid: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function deleteAdminUser() {
    setError(null);

    if (!deleteAdminUrl) {
      setError("Missing admin delete function URL.");
      return;
    }

    if (!hasFirebaseConfig) {
      setError(
        `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
      );
      return;
    }

    const currentUser = getFirebaseAuth().currentUser;
    if (!currentUser) {
      setError("You must be signed in to delete admin users.");
      return;
    }

    setSubmitting(true);
    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch(deleteAdminUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });
      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(body?.error ?? "Unable to delete admin user.");
        return;
      }

      setOpen(false);
      await queryClient.invalidateQueries({
        queryKey: userDirectoryQueryKeys.adminUsers,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete admin user.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return {
    deleteAdminUser,
    error,
    open,
    setOpen,
    submitting,
  };
}
