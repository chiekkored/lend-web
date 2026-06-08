"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { hasFirebaseConfig, missingFirebaseConfig } from "@/lib/firebase";

import {
  getMaintenanceMode,
  maintenanceQueryKeys,
  setMaintenanceMode,
} from "../data/maintenance-queries";

export type MaintenanceToast = {
  message: string;
  title: string;
  variant: "success" | "error";
};

export function useMaintenanceMode() {
  const queryClient = useQueryClient();
  const [toast, setToast] = React.useState<MaintenanceToast | null>(null);

  const query = useQuery({
    enabled: hasFirebaseConfig,
    queryKey: maintenanceQueryKeys.detail(),
    queryFn: getMaintenanceMode,
  });

  const mutation = useMutation({
    mutationFn: setMaintenanceMode,
    onSuccess: async (next) => {
      queryClient.setQueryData(maintenanceQueryKeys.detail(), next);
      await queryClient.invalidateQueries({
        queryKey: maintenanceQueryKeys.detail(),
      });
      setToast({
        title: next.enabled
          ? "Maintenance mode enabled"
          : "Maintenance mode disabled",
        message: next.enabled
          ? "Mobile users are now blocked from Lend."
          : "Mobile users can access Lend again.",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("[maintenance] update failed", error);
      setToast({
        title: "Unable to update maintenance mode",
        message: "Try again after checking your admin access and connection.",
        variant: "error",
      });
    },
  });

  const error = !hasFirebaseConfig
    ? `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`
    : query.error
      ? "Unable to load maintenance mode."
      : null;

  return {
    data: query.data ?? {
      enabled: false,
      updatedAt: null,
      updatedBy: null,
    },
    error,
    loading: hasFirebaseConfig ? query.isLoading : false,
    pending: mutation.isPending,
    setEnabled: (enabled: boolean) => mutation.mutate(enabled),
    setToast,
    toast,
  };
}
