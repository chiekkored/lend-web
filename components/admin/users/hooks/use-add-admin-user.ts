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

import { userDirectoryQueryKeys } from "../data/user-directory-queries";

export const adminTypes = [
  "superadmin",
  "admin",
  "moderator",
  "finance",
] as const;

const addAdminSchema = z
  .object({
    email: z.string().email("Enter a valid admin email."),
    displayName: z.string().optional(),
    adminType: z.enum(adminTypes),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm the password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type AddAdminValues = z.infer<typeof addAdminSchema>;

const createAdminUrl = process.env.NEXT_PUBLIC_ADMIN_CREATE_ADMIN_FUNCTION_URL;

export function useAddAdminUser({
  callerAdminType,
}: {
  callerAdminType: string | null;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const form = useForm<AddAdminValues>({
    resolver: zodResolver(addAdminSchema),
    defaultValues: {
      email: "",
      displayName: "",
      adminType: "admin",
      password: "",
      confirmPassword: "",
    },
  });
  const allowedTypes =
    callerAdminType === "superadmin"
      ? adminTypes
      : adminTypes.filter((type) => type !== "superadmin");

  async function onSubmit(values: AddAdminValues) {
    setError(null);

    if (!createAdminUrl) {
      setError("Missing admin create function URL.");
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
      setError("You must be signed in to create admin users.");
      return;
    }

    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch(createAdminUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          displayName: values.displayName,
          password: values.password,
          adminType: values.adminType,
        }),
      });
      const body = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(body?.error ?? "Unable to create admin user.");
        return;
      }

      form.reset();
      setOpen(false);
      await queryClient.invalidateQueries({
        queryKey: userDirectoryQueryKeys.adminUsers,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create admin user.",
      );
    }
  }

  return {
    allowedTypes,
    error,
    form,
    onSubmit: form.handleSubmit(onSubmit),
    open,
    setOpen,
  };
}
