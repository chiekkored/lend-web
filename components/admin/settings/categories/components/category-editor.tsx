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
import type { AdminCategory } from "@/lib/admin-categories";

import type { CategoryEditorState } from "../hooks/use-category-mutations";

type CategoryEditorProps = {
  categories: AdminCategory[];
  editor: CategoryEditorState | null;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  onUpdate: (patch: Partial<CategoryEditorState>) => void;
  saving: boolean;
};

const noParentValue = "__none__";

export function CategoryEditor({
  categories,
  editor,
  error,
  onOpenChange,
  onSubmit,
  onUpdate,
  saving,
}: CategoryEditorProps) {
  if (!editor) return null;

  const parentOptions = categories.filter(
    (category) => category.id !== editor.currentId && !category.parentId,
  );
  const listingKindOptions = uniqueMetadataValues(
    categories,
    "listingKind",
    editor.listingKind,
  );
  const detailSchemaKeyOptions = uniqueMetadataValues(
    categories,
    "detailSchemaKey",
    editor.detailSchemaKey,
  );

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>
            {editor.mode === "add" ? "Add category" : "Edit category"}
          </SheetTitle>
          <SheetDescription>
            Manage category metadata used by mobile browsing and search.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-5 overflow-y-auto px-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <Input
                onChange={(event) => onUpdate({ name: event.target.value })}
                required
                value={editor.name}
              />
            </Field>
            <Field label="Slug">
              <Input
                onChange={(event) => onUpdate({ slug: event.target.value })}
                required
                value={editor.slug}
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

          <div className="grid gap-4">
            <Field
              description="Broad listing/business type used for grouping, behavior, analytics, and future rules."
              label="Listing kind"
            >
              <EditableMetadataSelect
                onChange={(listingKind) => onUpdate({ listingKind })}
                options={listingKindOptions}
                placeholder="Choose or add a listing kind"
                value={editor.listingKind}
              />
            </Field>
            <Field
              description="Exact mobile details form/schema used to render fields and interpret the listing details payload."
              label="Detail schema key"
            >
              <EditableMetadataSelect
                onChange={(detailSchemaKey) => onUpdate({ detailSchemaKey })}
                options={detailSchemaKeyOptions}
                placeholder="Choose or add a schema key"
                value={editor.detailSchemaKey}
              />
            </Field>
          </div>

          <Field label="Parent">
            <Select
              onValueChange={(value) =>
                onUpdate({
                  parentId: value === noParentValue ? null : value,
                })
              }
              value={editor.parentId ?? noParentValue}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={noParentValue}>No parent</SelectItem>
                {parentOptions.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Image URL">
            <Input
              onChange={(event) => onUpdate({ imageUrl: event.target.value })}
              placeholder="Optional category image"
              value={editor.imageUrl ?? ""}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-md border p-3 text-sm">
              <input
                checked={editor.isActive}
                onChange={(event) =>
                  onUpdate({ isActive: event.target.checked })
                }
                type="checkbox"
              />
              Active
            </label>
            <label className="flex items-center gap-3 rounded-md border p-3 text-sm">
              <input
                checked={editor.isFeatured}
                onChange={(event) =>
                  onUpdate({ isFeatured: event.target.checked })
                }
                type="checkbox"
              />
              Featured
            </label>
          </div>

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

function uniqueMetadataValues(
  categories: AdminCategory[],
  key: "listingKind" | "detailSchemaKey",
  currentValue: string,
) {
  return Array.from(
    new Set(
      [...categories.map((category) => category[key]), currentValue]
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ).sort((left, right) => left.localeCompare(right));
}
