"use client";

import { httpsCallable } from "firebase/functions";

import { getFirebaseFunctions } from "@/lib/firebase";

export const REMOTE_CONFIG_PRICING_POLICY_KEY = "lend_pricing_policy";

export const remoteConfigQueryKeys = {
  all: ["remote-configs"] as const,
  list: () => [...remoteConfigQueryKeys.all, "list"] as const,
};

export type RemoteConfigValueType = "boolean" | "number" | "string" | "json";

export type RemoteConfigParameter = {
  description: string;
  hasConditionalValues: boolean;
  lastPublishedAt: string | null;
  name: string;
  value: string;
  valueType: RemoteConfigValueType;
};

type ListRemoteConfigParametersResponse = {
  etag?: string | null;
  lastPublishedAt?: string | null;
  parameters?: RemoteConfigParameter[];
  success?: boolean;
};

type PublishRemoteConfigParameterInput = {
  description?: string;
  name: string;
  value: string | boolean | number;
  valueType: RemoteConfigValueType;
};

type PublishRemoteConfigParameterResponse = {
  parameter?: RemoteConfigParameter;
  success?: boolean;
};

export async function listRemoteConfigParameters() {
  const callable = httpsCallable(
    getFirebaseFunctions(),
    "listRemoteConfigParameters",
  );
  const result = await callable();
  const data = result.data as ListRemoteConfigParametersResponse;
  return data.parameters ?? [];
}

export async function publishRemoteConfigParameter(
  input: PublishRemoteConfigParameterInput,
) {
  const callable = httpsCallable(
    getFirebaseFunctions(),
    "publishRemoteConfigParameter",
  );
  const result = await callable(input);
  const data = result.data as PublishRemoteConfigParameterResponse;
  return data.parameter ?? null;
}

export async function removeRemoteConfigParameter(name: string) {
  const callable = httpsCallable(
    getFirebaseFunctions(),
    "removeRemoteConfigParameter",
  );
  await callable({ name });
}
