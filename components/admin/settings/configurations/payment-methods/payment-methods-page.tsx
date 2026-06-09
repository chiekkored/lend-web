"use client";

import { CreditCard, Eye, EyeOff, Landmark, WalletCards } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Toast } from "@/components/ui/toast";

import {
  subscriptionPaymentMethods,
  upfrontPaymentMethods,
  type PaymentMethodCatalogEntry,
  type PaymentMethodState,
  type SubscriptionPaymentMethodId,
  type UpfrontPaymentMethodId,
} from "./data/payment-method-queries";
import { usePaymentMethodsConfig } from "./hooks/use-payment-methods-config";

export function PaymentMethodsPage() {
  const { data, error, loading, pending, setToast, toast, updateMethod } =
    usePaymentMethodsConfig();
  const disabled = loading || pending || Boolean(error);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">
          Payment Methods
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Control which payment methods users can see and use during checkout.
        </p>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <PaymentMethodColumn
          description="Used for upfront booking payments and outstanding damage balance payments."
          disabled={disabled}
          methods={upfrontPaymentMethods}
          onUpdate={(id, field, value) =>
            updateMethod("upfrontMethods", id, field, value)
          }
          states={data.upfrontMethods}
          title="Upfront payment methods"
        />
        <PaymentMethodColumn
          description="Used for recurring weekly, monthly, and annual bookings."
          disabled={disabled}
          methods={subscriptionPaymentMethods}
          onUpdate={(id, field, value) =>
            updateMethod("subscriptionMethods", id, field, value)
          }
          states={data.subscriptionMethods}
          title="Subscription payment methods"
        />
      </div>

      <div className="text-xs text-muted-foreground">
        Last updated: {formatUpdatedAt(data.updatedAt)}
        {data.updatedBy ? ` by ${data.updatedBy}` : ""}
      </div>

      {toast ? (
        <Toast
          message={toast.message}
          onDismiss={() => setToast(null)}
          title={toast.title}
          variant={toast.variant}
        />
      ) : null}
    </div>
  );
}

function PaymentMethodColumn({
  description,
  disabled,
  methods,
  onUpdate,
  states,
  title,
}: {
  description: string;
  disabled: boolean;
  methods: PaymentMethodCatalogEntry[];
  onUpdate: (
    id: UpfrontPaymentMethodId | SubscriptionPaymentMethodId,
    field: "visible" | "enabled",
    value: boolean,
  ) => void;
  states: Record<string, PaymentMethodState>;
  title: string;
}) {
  return (
    <Card className="rounded-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {methods.map((method) => {
          const state = states[method.id] ?? { visible: true, enabled: true };
          return (
            <div
              className="flex items-center justify-between gap-4 rounded-md border p-4"
              key={method.id}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <MethodIcon method={method} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Label className="font-medium">{method.label}</Label>
                    <Badge variant={state.enabled ? "default" : "secondary"}>
                      {state.enabled ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {method.bankCode
                      ? `${method.paymongoMethod} / ${method.bankCode}`
                      : method.paymongoMethod}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  aria-label={state.visible ? "Hide payment method" : "Show payment method"}
                  disabled={disabled}
                  onClick={() => onUpdate(method.id, "visible", !state.visible)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  {state.visible ? <Eye /> : <EyeOff />}
                </Button>
                <Switch
                  aria-label={`${method.label} availability`}
                  checked={state.enabled}
                  disabled={disabled}
                  onCheckedChange={(value) =>
                    onUpdate(method.id, "enabled", value)
                  }
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function MethodIcon({ method }: { method: PaymentMethodCatalogEntry }) {
  if (method.group === "bank") return <Landmark className="size-4" />;
  if (method.group === "wallet") return <WalletCards className="size-4" />;
  return <CreditCard className="size-4" />;
}

function formatUpdatedAt(value: Date | null) {
  if (!value) return "Not published yet";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}
