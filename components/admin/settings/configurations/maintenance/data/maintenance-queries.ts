"use client";

import { doc, getDoc, Timestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

import { getFirebaseFirestore, getFirebaseFunctions } from "@/lib/firebase";

export const maintenanceQueryKeys = {
  all: ["admin", "maintenance"] as const,
  detail: () => [...maintenanceQueryKeys.all, "detail"] as const,
};

export type MaintenanceMode = {
  enabled: boolean;
  updatedAt: Date | null;
  updatedBy: string | null;
};

type SetMaintenanceModeResponse = {
  maintenance?: {
    enabled?: boolean;
    updatedBy?: string;
  };
  success?: boolean;
};

export async function getMaintenanceMode(): Promise<MaintenanceMode> {
  const snapshot = await getDoc(
    doc(getFirebaseFirestore(), "appConfig", "maintenance"),
  );
  if (!snapshot.exists()) return disabledMaintenanceMode();

  const data = snapshot.data();
  return {
    enabled: data.enabled === true,
    updatedAt: timestampToDate(data.updatedAt),
    updatedBy:
      typeof data.updatedBy === "string" && data.updatedBy.trim()
        ? data.updatedBy
        : null,
  };
}

export async function setMaintenanceMode(enabled: boolean) {
  const callable = httpsCallable(getFirebaseFunctions(), "setMaintenanceMode");
  const result = await callable({ enabled });
  const data = result.data as SetMaintenanceModeResponse;

  return {
    enabled: data.maintenance?.enabled === true,
    updatedAt: null,
    updatedBy: data.maintenance?.updatedBy ?? null,
  } satisfies MaintenanceMode;
}

function disabledMaintenanceMode(): MaintenanceMode {
  return {
    enabled: false,
    updatedAt: null,
    updatedBy: null,
  };
}

function timestampToDate(value: unknown) {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return null;
}
