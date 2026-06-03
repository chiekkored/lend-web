"use client";

import * as React from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { PricingPolicyEditor, type PricingPolicy } from "@/components/admin/settings/pricing-policy-page";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import {
  REMOTE_CONFIG_PRICING_POLICY_KEY,
  type RemoteConfigValueType,
} from "../data/remote-configs";
import type { RemoteConfigEditorState } from "../hooks/use-remote-configs";

type RemoteConfigEditorProps = {
  editor: RemoteConfigEditorState | null;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onPublish: () => void;
  onPublishPricingPolicy: (policy: PricingPolicy) => void;
  onUpdate: (patch: Partial<RemoteConfigEditorState>) => void;
  publishing: boolean;
};

const valueTypeOptions: RemoteConfigValueType[] = [
  "string",
  "boolean",
  "number",
  "json",
];

export function RemoteConfigEditor({
  editor,
  error,
  onOpenChange,
  onPublish,
  onPublishPricingPolicy,
  onUpdate,
  publishing,
}: RemoteConfigEditorProps) {
  if (!editor) return null;

  const isPricingPolicy = editor.name === REMOTE_CONFIG_PRICING_POLICY_KEY;
  const usesSheet = isPricingPolicy || editor.valueType === "json";
  const title =
    editor.mode === "add" ? "Add Remote Config" : `Update ${editor.name}`;

  if (usesSheet) {
    return (
      <Sheet open onOpenChange={onOpenChange}>
        <SheetContent className="w-[calc(100vw-1rem)] sm:max-w-4xl">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>
              Publish changes to the Remote Config default value.
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-5 overflow-y-auto px-4">
            <RemoteConfigBaseFields
              editor={editor}
              onUpdate={onUpdate}
              valueTypeLocked={isPricingPolicy}
            />
            {isPricingPolicy ? (
              <PricingPolicySheetContent
                editor={editor}
                error={error}
                onCancel={() => onOpenChange(false)}
                onPublish={onPublishPricingPolicy}
                publishing={publishing}
              />
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="remote-config-json-value">JSON value</Label>
                <Textarea
                  className="min-h-96 font-mono text-sm"
                  id="remote-config-json-value"
                  onChange={(event) => onUpdate({ value: event.target.value })}
                  value={editor.value}
                />
                {error ? <ErrorMessage message={error} /> : null}
              </div>
            )}
          </div>
          {!isPricingPolicy ? (
            <SheetFooter>
              <Button disabled={publishing} onClick={onPublish} type="button">
                {publishing ? <Loader2 className="animate-spin" /> : null}
                Publish
              </Button>
              <Button
                disabled={publishing}
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            </SheetFooter>
          ) : null}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Publish changes to the Remote Config default value.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5">
          <RemoteConfigBaseFields editor={editor} onUpdate={onUpdate} />
          <PrimitiveValueField editor={editor} onUpdate={onUpdate} />
          {error ? <ErrorMessage message={error} /> : null}
        </div>
        <DialogFooter>
          <Button disabled={publishing} onClick={onPublish} type="button">
            {publishing ? <Loader2 className="animate-spin" /> : null}
            Publish
          </Button>
          <Button
            disabled={publishing}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RemoteConfigBaseFields({
  editor,
  onUpdate,
  valueTypeLocked = false,
}: {
  editor: RemoteConfigEditorState;
  onUpdate: (patch: Partial<RemoteConfigEditorState>) => void;
  valueTypeLocked?: boolean;
}) {
  const nameLocked = editor.mode === "update";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="remote-config-name">Name</Label>
        <Input
          disabled={nameLocked}
          id="remote-config-name"
          onChange={(event) => onUpdate({ name: event.target.value })}
          placeholder="feature_flag_name"
          value={editor.name}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="remote-config-type">Value type</Label>
        <Select
          disabled={valueTypeLocked}
          onValueChange={(value) =>
            onUpdate({ valueType: value as RemoteConfigValueType })
          }
          value={valueTypeLocked ? "json" : editor.valueType}
        >
          <SelectTrigger id="remote-config-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {valueTypeOptions.map((valueType) => (
              <SelectItem key={valueType} value={valueType}>
                {valueType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 md:col-span-2">
        <Label htmlFor="remote-config-description">Description</Label>
        <Input
          id="remote-config-description"
          onChange={(event) => onUpdate({ description: event.target.value })}
          placeholder="Optional Firebase Remote Config description"
          value={editor.description}
        />
      </div>
    </div>
  );
}

function PrimitiveValueField({
  editor,
  onUpdate,
}: {
  editor: RemoteConfigEditorState;
  onUpdate: (patch: Partial<RemoteConfigEditorState>) => void;
}) {
  if (editor.valueType === "boolean") {
    return (
      <div className="grid gap-2">
        <Label htmlFor="remote-config-boolean-value">Value</Label>
        <Select
          onValueChange={(value) => onUpdate({ value })}
          value={editor.value === "true" ? "true" : "false"}
        >
          <SelectTrigger id="remote-config-boolean-value">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">true</SelectItem>
            <SelectItem value="false">false</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="remote-config-value">Value</Label>
      <Input
        id="remote-config-value"
        onChange={(event) => onUpdate({ value: event.target.value })}
        type={editor.valueType === "number" ? "number" : "text"}
        value={editor.value}
      />
    </div>
  );
}

function PricingPolicySheetContent({
  editor,
  error,
  onCancel,
  onPublish,
  publishing,
}: {
  editor: RemoteConfigEditorState;
  error: string | null;
  onCancel: () => void;
  onPublish: (policy: PricingPolicy) => void;
  publishing: boolean;
}) {
  const initialPolicy = parsePricingPolicy(editor.value);
  const [policy, setPolicy] = React.useState<PricingPolicy | null>(
    initialPolicy,
  );

  React.useEffect(() => {
    setPolicy(parsePricingPolicy(editor.value));
  }, [editor.value]);

  if (!policy) {
    return (
      <div className="grid gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
        <ErrorMessage message="Pricing policy must be valid JSON before it can use the visual editor." />
      </div>
    );
  }

  return (
    <>
      <PricingPolicyEditor error={error} onChange={setPolicy} policy={policy} />
      <SheetFooter className="px-0 pb-0">
        <Button
          disabled={publishing}
          onClick={() => onPublish(policy)}
          type="button"
        >
          {publishing ? <Loader2 className="animate-spin" /> : null}
          Publish
        </Button>
        <Button
          disabled={publishing}
          onClick={onCancel}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
      </SheetFooter>
    </>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function parsePricingPolicy(value: string) {
  try {
    return JSON.parse(value) as PricingPolicy;
  } catch {
    return null;
  }
}
