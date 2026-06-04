"use client";

import type * as React from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import type { AdminAmenity } from "@/lib/admin-amenities";
import type { AdminCategory } from "@/lib/admin-categories";

import type { AmenityEditorState } from "../hooks/use-amenity-mutations";

type AmenityEditorProps = {
  amenities: AdminAmenity[];
  categories: AdminCategory[];
  editor: AmenityEditorState | null;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  onUpdate: (patch: Partial<AmenityEditorState>) => void;
  saving: boolean;
};

export function AmenityEditor({
  amenities,
  categories,
  editor,
  error,
  onOpenChange,
  onSubmit,
  onUpdate,
  saving,
}: AmenityEditorProps) {
  if (!editor) return null;

  const groupOptions = uniqueAmenityGroups(amenities, editor.group);
  const schemaOptions = uniqueDetailSchemaKeys(
    categories,
    editor.appliesToDetailSchemaKeys,
  );

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>
            {editor.mode === "add" ? "Add amenity" : "Edit amenity"}
          </SheetTitle>
          <SheetDescription>
            Manage reusable amenity metadata for listing detail forms.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-5 overflow-y-auto px-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Label">
              <Input
                onChange={(event) => onUpdate({ label: event.target.value })}
                required
                value={editor.label}
              />
            </Field>
            <Field label="Amenity ID">
              <Input
                onChange={(event) => onUpdate({ id: event.target.value })}
                required
                value={editor.id}
              />
            </Field>
            <Field label="Icon key">
              <Input
                onChange={(event) => onUpdate({ iconKey: event.target.value })}
                required
                value={editor.iconKey}
              />
            </Field>
            <Field label="Sort order">
              <Input
                onChange={(event) =>
                  onUpdate({ sortOrder: Number(event.target.value) })
                }
                required
                type="number"
                value={editor.sortOrder}
              />
            </Field>
          </div>

          <Field
            description="Group is used for organizing amenities in admin and future listing forms."
            label="Group"
          >
            <EditableMetadataSelect
              onChange={(group) => onUpdate({ group })}
              options={groupOptions}
              placeholder="Choose or add a group"
              value={editor.group}
            />
          </Field>

          <Field
            description="Choose the detail schemas where this amenity can appear."
            label="Applicable schemas"
          >
            <div className="grid gap-2 rounded-md border p-3">
              {schemaOptions.length ? (
                schemaOptions.map((schemaKey) => {
                  const checked =
                    editor.appliesToDetailSchemaKeys.includes(schemaKey);
                  return (
                    <label
                      className="flex items-center gap-3 text-sm"
                      key={schemaKey}
                    >
                      <input
                        checked={checked}
                        onChange={(event) =>
                          onUpdate({
                            appliesToDetailSchemaKeys: event.target.checked
                              ? [
                                  ...editor.appliesToDetailSchemaKeys,
                                  schemaKey,
                                ]
                              : editor.appliesToDetailSchemaKeys.filter(
                                  (value) => value !== schemaKey,
                                ),
                          })
                        }
                        type="checkbox"
                      />
                      {schemaKey}
                    </label>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  Add category detail schema keys before assigning amenities.
                </p>
              )}
            </div>
          </Field>

          <label className="flex items-center gap-3 rounded-md border p-3 text-sm">
            <input
              checked={editor.isActive}
              onChange={(event) => onUpdate({ isActive: event.target.checked })}
              type="checkbox"
            />
            Active
          </label>

          {error ? (
            <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}
        </div>
        <SheetFooter>
          <Button disabled={saving} onClick={onSubmit} type="button">
            {saving ? <Loader2 className="animate-spin" /> : null}
            Save
          </Button>
          <Button
            disabled={saving}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  children,
  description,
  label,
}: {
  children: React.ReactNode;
  description?: string;
  label: string;
}) {
  return (
    <div className="grid gap-2">
      <div className="grid gap-1">
        <Label>{label}</Label>
        {description ? (
          <p className="text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function EditableMetadataSelect({
  onChange,
  options,
  placeholder,
  value,
}: {
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  value: string;
}) {
  const trimmedValue = value.trim();
  return (
    <Select onValueChange={onChange} value={trimmedValue || undefined}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        className="max-h-80 w-[var(--radix-select-trigger-width)]"
        position="item-aligned"
      >
        <div className="sticky top-0 z-10 bg-popover p-2">
          <Input
            autoComplete="off"
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            placeholder="Type a new value"
            value={value}
          />
        </div>
        <div className="max-h-56 overflow-y-auto px-1 pb-1">
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}

function uniqueAmenityGroups(amenities: AdminAmenity[], currentValue: string) {
  return Array.from(
    new Set(
      [...amenities.map((amenity) => amenity.group), currentValue]
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ).sort((left, right) => left.localeCompare(right));
}

function uniqueDetailSchemaKeys(
  categories: AdminCategory[],
  currentValues: string[],
) {
  return Array.from(
    new Set(
      [...categories.map((category) => category.detailSchemaKey), ...currentValues]
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ).sort((left, right) => left.localeCompare(right));
}
