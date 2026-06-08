"use client";

import { AlertTriangle } from "lucide-react";

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

import { useMaintenanceMode } from "./hooks/use-maintenance-mode";

export function MaintenancePage() {
  const { data, error, loading, pending, setEnabled, setToast, toast } =
    useMaintenanceMode();
  const disabled = loading || pending || Boolean(error);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-normal">Maintenance</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Block mobile users while keeping admin operations available.
        </p>
      </div>

      <Card className="max-w-2xl rounded-md">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <AlertTriangle className="size-5" />
            </div>
            <div className="min-w-0">
              <CardTitle>Mobile hard block</CardTitle>
              <CardDescription className="mt-1">
                When enabled, mobile users see a full-screen maintenance block
                and protected user actions are rejected by the server.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4 rounded-md border p-4">
            <div className="min-w-0">
              <Label htmlFor="maintenance-enabled">Maintenance mode</Label>
              <p className="mt-1 text-sm text-muted-foreground">
                {loading
                  ? "Loading maintenance status..."
                  : data.enabled
                    ? "Maintenance is active."
                    : "App is available."}
              </p>
            </div>
            <Switch
              aria-label="Toggle maintenance mode"
              checked={data.enabled}
              disabled={disabled}
              id="maintenance-enabled"
              onCheckedChange={setEnabled}
            />
          </div>

          {error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="text-xs text-muted-foreground">
            Last updated: {formatUpdatedAt(data.updatedAt)}
            {data.updatedBy ? ` by ${data.updatedBy}` : ""}
          </div>
        </CardContent>
      </Card>

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

function formatUpdatedAt(value: Date | null) {
  if (!value) return "Not published yet";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}
