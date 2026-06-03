"use client";

import * as React from "react";
import { httpsCallable } from "firebase/functions";
import { RefreshCw, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getFirebaseFunctions, hasFirebaseConfig, missingFirebaseConfig } from "@/lib/firebase";

type FeeRule = {
  label?: string;
  rate_bps: number;
  fixed_amount: number;
  calculation: "rate_only" | "fixed_only" | "rate_plus_fixed" | "max_rate_or_fixed";
};

type MethodFeeNode = FeeRule & {
  domestic?: FeeRule;
  international?: FeeRule;
  default?: FeeRule;
  banks?: Record<string, FeeRule>;
  [key: string]: unknown;
};

type PricingPolicy = {
  checkout_lock_expiry_minutes_by_method: Record<string, number>;
  owner_return_action_timeout_hours: number;
  payment_method_fee_vat_rate_bps: number;
  payment_method_fees: Record<string, MethodFeeNode>;
  platform_fee: FeeRule;
  renter_cancellation_policy: {
    full_refund_window: { lead_time_rate_bps: number; max_hours: number };
    middle_retention: { type: "percentage" | "fixed"; rate_bps?: number; fixed_amount?: number };
    no_refund_window: { lead_time_rate_bps: number; max_hours: number };
    no_refund_retention: { type: "percentage" | "fixed"; rate_bps?: number; fixed_amount?: number };
  };
  wallet_transfer_fee: FeeRule;
};

export type { PricingPolicy };

type PricingPolicyEditorProps = {
  error?: string | null;
  onChange: (policy: PricingPolicy) => void;
  policy: PricingPolicy;
};

const methodRows = [
  { key: "card.domestic", label: "Cards - domestic", path: ["card", "domestic"] },
  { key: "card.international", label: "Cards - international", path: ["card", "international"] },
  { key: "gcash", label: "GCash", path: ["gcash"] },
  { key: "paymaya", label: "Maya", path: ["paymaya"] },
  { key: "grab_pay", label: "GrabPay", path: ["grab_pay"] },
  { key: "shopeepay", label: "ShopeePay", path: ["shopeepay"] },
  { key: "qrph", label: "QR Ph", path: ["qrph"] },
  { key: "dob.default", label: "DOB default", path: ["dob", "default"] },
  { key: "brankas.default", label: "Brankas default", path: ["brankas", "default"] },
  { key: "dob.bpi", label: "BPI", path: ["dob", "banks", "bpi"] },
  { key: "dob.ubp", label: "UnionBank", path: ["dob", "banks", "ubp"] },
  { key: "brankas.bdo", label: "BDO", path: ["brankas", "banks", "bdo"] },
  { key: "brankas.landbank", label: "Landbank", path: ["brankas", "banks", "landbank"] },
  { key: "brankas.metrobank", label: "Metrobank", path: ["brankas", "banks", "metrobank"] },
] as const;

const calculationModes = ["rate_only", "fixed_only", "rate_plus_fixed", "max_rate_or_fixed"] as const;

export function PricingPolicyPage() {
  const [policy, setPolicy] = React.useState<PricingPolicy | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedAt, setSavedAt] = React.useState<string | null>(null);

  const loadPolicy = React.useCallback(async () => {
    setError(null);
    if (!hasFirebaseConfig) {
      setError(`Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const callable = httpsCallable(getFirebaseFunctions(), "getPricingPolicy");
      const result = await callable();
      const data = result.data as { policy?: PricingPolicy };
      setPolicy(data.policy ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load pricing policy.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadPolicy();
  }, [loadPolicy]);

  async function savePolicy() {
    if (!policy) return;
    setError(null);
    setSaving(true);
    try {
      const callable = httpsCallable(getFirebaseFunctions(), "updatePricingPolicy");
      await callable({ policy });
      setSavedAt(new Date().toLocaleString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save pricing policy.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading pricing policy...</div>;
  }

  if (!policy) {
    return <div className="text-sm text-destructive">{error ?? "Pricing policy is unavailable."}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal">Pricing policy</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Configure PayMongo method fees shown in mobile and used by checkout Functions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void loadPolicy()}>
            <RefreshCw />
            Reload
          </Button>
          <Button disabled={saving} onClick={() => void savePolicy()}>
            <Save />
            {saving ? "Saving..." : "Publish"}
          </Button>
        </div>
      </div>

      {error ? <div className="text-sm text-destructive">{error}</div> : null}
      {savedAt ? <div className="text-sm text-muted-foreground">Last published locally at {savedAt}</div> : null}

      <PricingPolicyEditor error={null} onChange={setPolicy} policy={policy} />
    </div>
  );
}

export function PricingPolicyEditor({
  error,
  onChange,
  policy,
}: PricingPolicyEditorProps) {
  function updateRule(path: readonly string[], patch: Partial<FeeRule>) {
    const next = structuredClone(policy);
    let cursor: Record<string, unknown> = next.payment_method_fees;
    path.forEach((part, index) => {
      if (index === path.length - 1) {
        cursor[part] = {
          ...defaultRuleFor(path),
          ...(isRecord(cursor[part]) ? cursor[part] : {}),
          ...patch,
        };
        return;
      }
      if (!isRecord(cursor[part])) {
        cursor[part] = {};
      }
      cursor = cursor[part] as Record<string, unknown>;
    });
    onChange(next);
  }

  function updateTopLevelRule(key: "platform_fee" | "wallet_transfer_fee", patch: Partial<FeeRule>) {
    onChange({ ...policy, [key]: { ...policy[key], ...patch } });
  }

  function updatePaymentMethodVat(rateBps: number) {
    onChange({ ...policy, payment_method_fee_vat_rate_bps: rateBps });
  }

  function updateCancellationPolicy(path: readonly string[], value: number | string) {
    const next = structuredClone(policy);
    let cursor: Record<string, unknown> = next.renter_cancellation_policy as unknown as Record<string, unknown>;
    path.forEach((part, index) => {
      if (index === path.length - 1) {
        cursor[part] = value;
        return;
      }
      cursor = cursor[part] as Record<string, unknown>;
    });
    onChange(next);
  }

  return (
    <div className="space-y-6">
      {error ? <div className="text-sm text-destructive">{error}</div> : null}

      <Card>
        <CardHeader>
          <CardTitle>Payment method fees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {methodRows.map((row) => (
            <FeeRuleRow
              key={row.key}
              label={row.label}
              rule={readRule(policy, row.path)}
              vatRateBps={policy.payment_method_fee_vat_rate_bps ?? 1200}
              onChange={(patch) => updateRule(row.path, patch)}
            />
          ))}
          <div className="grid gap-3 rounded-md border p-3 md:grid-cols-[1.4fr_1fr_3.3fr] md:items-end">
            <div>
              <Label>Payment method VAT</Label>
              <div className="mt-1 text-xs text-muted-foreground">
                Applied to PayMongo method fee estimates shown in mobile and used by checkout.
              </div>
            </div>
            <div>
              <Label>VAT bps</Label>
              <Input
                type="number"
                value={policy.payment_method_fee_vat_rate_bps ?? 1200}
                onChange={(event) => updatePaymentMethodVat(Number(event.target.value))}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {((policy.payment_method_fee_vat_rate_bps ?? 1200) / 100).toFixed(2)}%
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settlement fees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FeeRuleRow
            label="Platform fee"
            rule={policy.platform_fee}
            onChange={(patch) => updateTopLevelRule("platform_fee", patch)}
          />
          <FeeRuleRow
            label="Wallet transfer fee"
            rule={policy.wallet_transfer_fee}
            onChange={(patch) => updateTopLevelRule("wallet_transfer_fee", patch)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Renter cancellation policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 rounded-md border p-3 md:grid-cols-4">
            <PolicyNumberField
              label="Full refund bps"
              value={policy.renter_cancellation_policy.full_refund_window.lead_time_rate_bps}
              onChange={(value) => updateCancellationPolicy(["full_refund_window", "lead_time_rate_bps"], value)}
            />
            <PolicyNumberField
              label="Full max hours"
              value={policy.renter_cancellation_policy.full_refund_window.max_hours}
              onChange={(value) => updateCancellationPolicy(["full_refund_window", "max_hours"], value)}
            />
            <PolicyNumberField
              label="No refund bps"
              value={policy.renter_cancellation_policy.no_refund_window.lead_time_rate_bps}
              onChange={(value) => updateCancellationPolicy(["no_refund_window", "lead_time_rate_bps"], value)}
            />
            <PolicyNumberField
              label="No refund max hours"
              value={policy.renter_cancellation_policy.no_refund_window.max_hours}
              onChange={(value) => updateCancellationPolicy(["no_refund_window", "max_hours"], value)}
            />
          </div>
          <div className="grid gap-3 rounded-md border p-3 md:grid-cols-3">
            <RetentionRuleFields
              label="Middle retention"
              rule={policy.renter_cancellation_policy.middle_retention}
              onChange={(key, value) => updateCancellationPolicy(["middle_retention", key], value)}
            />
            <RetentionRuleFields
              label="No refund retention"
              rule={policy.renter_cancellation_policy.no_refund_retention}
              onChange={(key, value) => updateCancellationPolicy(["no_refund_retention", key], value)}
            />
            <div className="text-sm text-muted-foreground">
              Mobile displays these windows as days or hours for normal-lead bookings. Bookings made less than 24 hours
              before the rental starts are always non-refundable for the rental payment. Cancellation penalties apply only
              to rental subtotal; security deposits remain refundable and platform/payment fees remain in the platform
              wallet.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeeRuleRow({
  label,
  onChange,
  rule,
  vatRateBps,
}: {
  label: string;
  rule: FeeRule;
  vatRateBps?: number;
  onChange: (patch: Partial<FeeRule>) => void;
}) {
  const sampleFee = calculateFee(10000, rule, vatRateBps);
  return (
    <div className="grid gap-3 rounded-md border p-3 md:grid-cols-[1.4fr_1fr_1fr_1.3fr_1fr] md:items-end">
      <div>
        <Label>{label}</Label>
        <div className="mt-1 text-xs text-muted-foreground">Sample fee on PHP 10,000: PHP {sampleFee.toFixed(2)}</div>
      </div>
      <div>
        <Label>Rate bps</Label>
        <Input
          type="number"
          value={rule.rate_bps}
          onChange={(event) => onChange({ rate_bps: Number(event.target.value) })}
        />
      </div>
      <div>
        <Label>Fixed PHP</Label>
        <Input
          type="number"
          value={rule.fixed_amount}
          onChange={(event) => onChange({ fixed_amount: Number(event.target.value) })}
        />
      </div>
      <div>
        <Label>Calculation</Label>
        <Select
          value={rule.calculation}
          onValueChange={(value) => onChange({ calculation: value as FeeRule["calculation"] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {calculationModes.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {mode}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="text-sm text-muted-foreground">{(rule.rate_bps / 100).toFixed(3)}%</div>
    </div>
  );
}

function PolicyNumberField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </div>
  );
}

function RetentionRuleFields({
  label,
  onChange,
  rule,
}: {
  label: string;
  onChange: (key: "type" | "rate_bps" | "fixed_amount", value: number | string) => void;
  rule: PricingPolicy["renter_cancellation_policy"]["middle_retention"];
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Select value={rule.type} onValueChange={(value) => onChange("type", value)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="percentage">Percentage</SelectItem>
          <SelectItem value="fixed">Fixed</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="number"
        value={rule.rate_bps ?? 0}
        onChange={(event) => onChange("rate_bps", Number(event.target.value))}
        placeholder="Rate bps"
      />
      <Input
        type="number"
        value={rule.fixed_amount ?? 0}
        onChange={(event) => onChange("fixed_amount", Number(event.target.value))}
        placeholder="Fixed amount"
      />
    </div>
  );
}

function readRule(policy: PricingPolicy, path: readonly string[]): FeeRule {
  let cursor: unknown = policy.payment_method_fees;
  for (const part of path) {
    cursor = isRecord(cursor) ? cursor[part] : undefined;
  }
  return { ...defaultRuleFor(path), ...(isRecord(cursor) ? cursor : {}) };
}

function defaultRuleFor(path: readonly string[]): FeeRule {
  const label = path[path.length - 1] ?? "fee";
  return { label, rate_bps: 0, fixed_amount: 0, calculation: "rate_plus_fixed" };
}

function calculateFee(amount: number, rule: FeeRule, vatRateBps = 0) {
  const rateAmount = Math.ceil((amount * Number(rule.rate_bps || 0)) / 10000);
  const fixed = Math.ceil(Number(rule.fixed_amount || 0));
  const baseFee = (() => {
    switch (rule.calculation) {
    case "rate_only":
      return rateAmount;
    case "fixed_only":
      return fixed;
    case "max_rate_or_fixed":
      return Math.max(rateAmount, fixed);
    case "rate_plus_fixed":
    default:
      return rateAmount + fixed;
  }
  })();
  return baseFee * (1 + Number(vatRateBps || 0) / 10000);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
