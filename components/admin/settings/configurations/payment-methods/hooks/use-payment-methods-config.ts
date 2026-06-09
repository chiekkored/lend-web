"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { hasFirebaseConfig, missingFirebaseConfig } from "@/lib/firebase";

import {
  defaultPaymentMethodsConfig,
  getPaymentMethodsConfig,
  paymentMethodQueryKeys,
  savePaymentMethodsConfig,
  type PaymentMethodConfig,
  type SubscriptionPaymentMethodId,
  type UpfrontPaymentMethodId,
} from "../data/payment-method-queries";

export type PaymentMethodsToast = {
  message: string;
  title: string;
  variant: "success" | "error";
};

type MethodScope = "upfrontMethods" | "subscriptionMethods";

export function usePaymentMethodsConfig() {
  const queryClient = useQueryClient();
  const [toast, setToast] = React.useState<PaymentMethodsToast | null>(null);

  const query = useQuery({
    enabled: hasFirebaseConfig,
    queryKey: paymentMethodQueryKeys.detail(),
    queryFn: getPaymentMethodsConfig,
  });

  const mutation = useMutation({
    mutationFn: savePaymentMethodsConfig,
    onSuccess: async (_, next) => {
      queryClient.setQueryData(paymentMethodQueryKeys.detail(), next);
      await queryClient.invalidateQueries({ queryKey: paymentMethodQueryKeys.detail() });
      setToast({
        title: "Payment methods updated",
        message: "The payment method configuration has been saved.",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("[payment-methods] update failed", error);
      setToast({
        title: "Unable to update payment methods",
        message: "Try again after checking your admin access and connection.",
        variant: "error",
      });
    },
  });

  const data = query.data ?? defaultPaymentMethodsConfig();

  function updateMethod(
    scope: MethodScope,
    id: UpfrontPaymentMethodId | SubscriptionPaymentMethodId,
    field: "visible" | "enabled",
    value: boolean,
  ) {
    const next = updateConfig(data, scope, id, field, value);
    mutation.mutate(next);
  }

  const error = !hasFirebaseConfig
    ? `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`
    : query.error
      ? "Unable to load payment methods."
      : null;

  return {
    data,
    error,
    loading: hasFirebaseConfig ? query.isLoading : false,
    pending: mutation.isPending,
    setToast,
    toast,
    updateMethod,
  };
}

function updateConfig(
  config: PaymentMethodConfig,
  scope: MethodScope,
  id: UpfrontPaymentMethodId | SubscriptionPaymentMethodId,
  field: "visible" | "enabled",
  value: boolean,
): PaymentMethodConfig {
  const currentScope = config[scope] as Record<string, { enabled: boolean; visible: boolean }>;
  return {
    ...config,
    [scope]: {
      ...currentScope,
      [id]: {
        ...currentScope[id],
        [field]: value,
      },
    },
  };
}
