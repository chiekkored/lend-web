"use client";

import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";

import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase";

export type PaymentMethodState = {
  enabled: boolean;
  visible: boolean;
};

export type PaymentMethodConfig = {
  subscriptionMethods: Record<SubscriptionPaymentMethodId, PaymentMethodState>;
  updatedAt: Date | null;
  updatedBy: string | null;
  upfrontMethods: Record<UpfrontPaymentMethodId, PaymentMethodState>;
};

export type PaymentMethodCatalogEntry = {
  group: "card" | "wallet" | "bank";
  id: UpfrontPaymentMethodId | SubscriptionPaymentMethodId;
  label: string;
  paymongoMethod: string;
  bankCode?: string;
};

export const upfrontPaymentMethodIds = [
  "card",
  "gcash",
  "paymaya",
  "grab_pay",
  "shopeepay",
  "qrph",
  "bpi",
  "ubp",
  "bdo",
  "landbank",
  "metrobank",
] as const;

export const subscriptionPaymentMethodIds = ["card", "paymaya"] as const;

export type UpfrontPaymentMethodId = (typeof upfrontPaymentMethodIds)[number];
export type SubscriptionPaymentMethodId = (typeof subscriptionPaymentMethodIds)[number];

export const upfrontPaymentMethods: PaymentMethodCatalogEntry[] = [
  { id: "card", label: "Card", paymongoMethod: "card", group: "card" },
  { id: "gcash", label: "GCash", paymongoMethod: "gcash", group: "wallet" },
  { id: "paymaya", label: "Maya", paymongoMethod: "paymaya", group: "wallet" },
  { id: "grab_pay", label: "GrabPay", paymongoMethod: "grab_pay", group: "wallet" },
  { id: "shopeepay", label: "ShopeePay", paymongoMethod: "shopeepay", group: "wallet" },
  { id: "qrph", label: "QR Ph", paymongoMethod: "qrph", group: "wallet" },
  { id: "bpi", label: "BPI", paymongoMethod: "dob", bankCode: "bpi", group: "bank" },
  { id: "ubp", label: "UnionBank", paymongoMethod: "dob", bankCode: "ubp", group: "bank" },
  { id: "bdo", label: "BDO", paymongoMethod: "brankas", bankCode: "bdo", group: "bank" },
  { id: "landbank", label: "Landbank", paymongoMethod: "brankas", bankCode: "landbank", group: "bank" },
  { id: "metrobank", label: "Metrobank", paymongoMethod: "brankas", bankCode: "metrobank", group: "bank" },
];

export const subscriptionPaymentMethods: PaymentMethodCatalogEntry[] = [
  { id: "card", label: "Card", paymongoMethod: "card", group: "card" },
  { id: "paymaya", label: "Maya", paymongoMethod: "paymaya", group: "wallet" },
];

export const paymentMethodQueryKeys = {
  all: ["admin", "payment-methods"] as const,
  detail: () => [...paymentMethodQueryKeys.all, "detail"] as const,
};

export async function getPaymentMethodsConfig(): Promise<PaymentMethodConfig> {
  const snapshot = await getDoc(doc(getFirebaseFirestore(), "appConfig", "paymentMethods"));
  return mapPaymentMethodsConfig(snapshot.exists() ? snapshot.data() : null);
}

export async function savePaymentMethodsConfig(config: PaymentMethodConfig) {
  await setDoc(
    doc(getFirebaseFirestore(), "appConfig", "paymentMethods"),
    {
      upfrontMethods: config.upfrontMethods,
      subscriptionMethods: config.subscriptionMethods,
      updatedAt: serverTimestamp(),
      updatedBy: getFirebaseAuth().currentUser?.uid ?? "admin",
    },
    { merge: true },
  );
}

export function defaultPaymentMethodsConfig(): PaymentMethodConfig {
  return {
    upfrontMethods: defaultStateMap(upfrontPaymentMethodIds),
    subscriptionMethods: defaultStateMap(subscriptionPaymentMethodIds),
    updatedAt: null,
    updatedBy: null,
  };
}

function mapPaymentMethodsConfig(data: Record<string, unknown> | null): PaymentMethodConfig {
  const defaults = defaultPaymentMethodsConfig();
  return {
    upfrontMethods: mapStateMap(data?.upfrontMethods, defaults.upfrontMethods),
    subscriptionMethods: mapStateMap(data?.subscriptionMethods, defaults.subscriptionMethods),
    updatedAt: timestampToDate(data?.updatedAt),
    updatedBy: typeof data?.updatedBy === "string" && data.updatedBy.trim() ? data.updatedBy : null,
  };
}

function defaultStateMap<T extends string>(ids: readonly T[]): Record<T, PaymentMethodState> {
  return Object.fromEntries(ids.map((id) => [id, { visible: true, enabled: true }])) as Record<T, PaymentMethodState>;
}

function mapStateMap<T extends string>(
  value: unknown,
  defaults: Record<T, PaymentMethodState>,
): Record<T, PaymentMethodState> {
  const source = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  return Object.fromEntries(
    (Object.keys(defaults) as T[]).map((id) => {
      const fallback = defaults[id];
      const state = source[id];
      const map = state && typeof state === "object" && !Array.isArray(state) ? (state as Record<string, unknown>) : {};
      return [
        id,
        {
          visible: typeof map.visible === "boolean" ? map.visible : fallback.visible,
          enabled: typeof map.enabled === "boolean" ? map.enabled : fallback.enabled,
        },
      ];
    }),
  ) as Record<T, PaymentMethodState>;
}

function timestampToDate(value: unknown) {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return null;
}
