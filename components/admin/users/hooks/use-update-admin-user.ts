"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  getFirebaseAuth,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";

import {
  adminTypes,
  type AddAdminValues,
} from "./use-add-admin-user";
import { userDirectoryQueryKeys } from "../data/user-directory-queries";

const updateAdminSchema = z
  .object({
    displayName: z.string().optional(),
    adminType: z.enum(adminTypes),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((values) => !values.password || values.password.length >= 8, {
    message: "Password must be at least 8 characters.",
    path: ["password"],
  })
  .refine((values) => !values.password || values.confirmPassword, {
    message: "Confirm the password.",
    path: ["confirmPassword"],
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type UpdateAdminValues = z.infer<typeof updateAdminSchema>;

const updateAdminUrl = process.env.NEXT_PUBLIC_ADMIN_UPDATE_ADMIN_FUNCTION_URL;

export function useUpdateAdminUser({
  callerAdminType,
  defaultAdminType,
  defaultDisplayName,
  uid,
}: {
  callerAdminType: string | null;
  defaultAdminType: string | null;
  defaultDisplayName: string;
  uid: string;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const form = useForm<UpdateAdminValues>({
    resolver: zodResolver(updateAdminSchema),
    defaultValues: {
      displayName: defaultDisplayName === "No name" ? "" : defaultDisplayName,
      adminType: isAdminType(defaultAdminType) ? defaultAdminType : "admin",
      password: undefined,
      confirmPassword: undefined,
    },
  });
  const allowedTypes =
    callerAdminType === "superadmin"
      ? adminTypes
      : adminTypes.filter((type) => type !== "superadmin");

  React.useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      displayName: defaultDisplayName === "No name" ? "" : defaultDisplayName,
      adminType: isAdminType(defaultAdminType) ? defaultAdminType : "admin",
      password: undefined,
      confirmPassword: undefined,
    });
    setError(null);
  }, [defaultAdminType, defaultDisplayName, form, open]);

  async function onSubmit(values: UpdateAdminValues) {
    setError(null);

    if (!updateAdminUrl) {
      setError("Missing admin update function URL.");
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
      setError("You must be signed in to update admin users.");
      return;
    }

    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch(updateAdminUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          displayName: values.displayName,
          adminType: values.adminType,
          password: values.password?.trim() ? values.password : undefined,
        }),
      });
      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(body?.error ?? "Unable to update admin user.");
        return;
      }

      setOpen(false);
      await queryClient.invalidateQueries({
        queryKey: userDirectoryQueryKeys.adminUsers,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update admin user.",
      );
    }
  }

  return {
    allowedTypes: allowedTypes as AddAdminValues["adminType"][],
    error,
    form,
    onSubmit: form.handleSubmit(onSubmit),
    open,
    setOpen,
  };
}

function isAdminType(value: string | null): value is AddAdminValues["adminType"] {
  return adminTypes.some((adminType) => adminType === value);
}
