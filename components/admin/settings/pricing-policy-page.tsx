"use client";

import * as React from "react";
import { httpsCallable } from "firebase/functions";
import { RefreshCw, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getFirebaseFunctions,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";

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
  payment_method_fees: Record<string, MethodFeeNode>;
  deposit_processing_fee: FeeRule;
  wallet_transfer_fee: FeeRule;
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

  function updateRule(path: readonly string[], patch: Partial<FeeRule>) {
    setPolicy((current) => {
      if (!current) return current;
      const next = structuredClone(current);
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
      return next;
    });
  }

  function updateTopLevelRule(key: "deposit_processing_fee" | "wallet_transfer_fee", patch: Partial<FeeRule>) {
    setPolicy((current) => current ? { ...current, [key]: { ...current[key], ...patch } } : current);
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
              onChange={(patch) => updateRule(row.path, patch)}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settlement fees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <FeeRuleRow
            label="Owner deposit processing fee"
            rule={policy.deposit_processing_fee}
            onChange={(patch) => updateTopLevelRule("deposit_processing_fee", patch)}
          />
          <FeeRuleRow
            label="Wallet transfer fee"
            rule={policy.wallet_transfer_fee}
            onChange={(patch) => updateTopLevelRule("wallet_transfer_fee", patch)}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function FeeRuleRow({
  label,
  onChange,
  rule,
}: {
  label: string;
  rule: FeeRule;
  onChange: (patch: Partial<FeeRule>) => void;
}) {
  const sampleFee = calculateFee(10000, rule);
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
        <Select value={rule.calculation} onValueChange={(value) => onChange({ calculation: value as FeeRule["calculation"] })}>
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

function calculateFee(amount: number, rule: FeeRule) {
  const rateAmount = Math.ceil((amount * Number(rule.rate_bps || 0)) / 10000);
  const fixed = Math.ceil(Number(rule.fixed_amount || 0));
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
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
