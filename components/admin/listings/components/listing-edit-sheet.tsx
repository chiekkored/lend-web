"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2, X } from "lucide-react";
import Image from "next/image";

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
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  categoryQueryKeys,
  listAdminCategories,
} from "@/components/admin/settings/categories/data/category-queries";
import type { AdminCategory } from "@/lib/admin-categories";
import {
  listingStatuses,
  type AdminListing,
  type ListingRates,
  type ListingUpdateValues,
} from "@/lib/admin-listings";

import { useListingMutation } from "../hooks/use-listing-mutations";

type ListingEditSheetProps = {
  listing: AdminListing;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

type ListingFormState = {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  status: string;
  daily: string;
  inclusions: string;
  images: string[];
  showcase: string[];
  suppressFromRecommendations: boolean;
};

export function ListingEditSheet({
  listing,
  onOpenChange,
  open,
}: ListingEditSheetProps) {
  const [form, setForm] = React.useState<ListingFormState>(() =>
    buildInitialForm(listing),
  );
  const { error, resetError, submitting, updateListing } =
    useListingMutation(listing);
  const categoriesQuery = useQuery({
    queryFn: listAdminCategories,
    queryKey: categoryQueryKeys.list(),
  });
  const categories = categoriesQuery.data ?? [];
  const parentCategories = categories.filter(
    (category) => category.isActive && !category.parentId,
  );
  const subcategories = categories.filter(
    (category) => category.isActive && category.parentId === form.categoryId,
  );

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setForm(buildInitialForm(listing));
    resetError();
  }, [listing, open, resetError]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const success = await updateListing(
      toListingUpdateValues(form, listing, categories),
    );
    if (success) {
      onOpenChange(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Edit listing</SheetTitle>
          <SheetDescription>
            Update listing details, rates, visibility, and photos.
          </SheetDescription>
        </SheetHeader>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit}>
          <div className="grid flex-1 auto-rows-min gap-5 overflow-y-auto px-4">
            <div className="grid gap-2">
              <Label htmlFor={`listing-title-${listing.id}`}>Title</Label>
              <Input
                id={`listing-title-${listing.id}`}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                required
                value={form.title}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`listing-description-${listing.id}`}>
                Description
              </Label>
              <Textarea
                id={`listing-description-${listing.id}`}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                value={form.description}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor={`listing-category-${listing.id}`}>
                  Category
                </Label>
                <Select
                  onValueChange={(categoryId) =>
                    setForm((current) => ({
                      ...current,
                      categoryId,
                      subcategoryId: "",
                    }))
                  }
                  value={form.categoryId}
                >
                  <SelectTrigger id={`listing-category-${listing.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {parentCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {subcategories.length ? (
                <div className="grid gap-2">
                  <Label htmlFor={`listing-subcategory-${listing.id}`}>
                    Subcategory
                  </Label>
                  <Select
                    onValueChange={(subcategoryId) =>
                      setForm((current) => ({ ...current, subcategoryId }))
                    }
                    value={form.subcategoryId}
                  >
                    <SelectTrigger id={`listing-subcategory-${listing.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div className="grid gap-2">
                <Label htmlFor={`listing-status-${listing.id}`}>Status</Label>
                <Select
                  onValueChange={(status) =>
                    setForm((current) => ({ ...current, status }))
                  }
                  value={form.status}
                >
                  <SelectTrigger id={`listing-status-${listing.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {listingStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4">
              <h3 className="text-sm font-medium">Rates</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <RateInput label="Daily" name="daily" setForm={setForm} value={form.daily} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`listing-inclusions-${listing.id}`}>
                Inclusions
              </Label>
              <Textarea
                id={`listing-inclusions-${listing.id}`}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    inclusions: event.target.value,
                  }))
                }
                placeholder="One inclusion per line"
                value={form.inclusions}
              />
            </div>

            <PhotoRemover
              label="Photos"
              onRemove={(index) =>
                setForm((current) => ({
                  ...current,
                  images: removeAt(current.images, index),
                }))
              }
              urls={form.images}
            />
            <PhotoRemover
              label="Showcase photos"
              onRemove={(index) =>
                setForm((current) => ({
                  ...current,
                  showcase: removeAt(current.showcase, index),
                }))
              }
              urls={form.showcase}
            />

            <label className="flex items-start gap-3 rounded-md border p-3 text-sm">
              <input
                checked={form.suppressFromRecommendations}
                className="mt-1"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    suppressFromRecommendations: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              <span>
                <span className="block font-medium">Suppress from recommendations</span>
                <span className="text-muted-foreground">
                  Hide this listing from Recommended and Popular feeds without changing its listing status.
                </span>
              </span>
            </label>

            {error ? (
              <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}
          </div>
          <SheetFooter>
            <Button disabled={submitting} type="submit">
              {submitting ? <Loader2 className="animate-spin" /> : null}
              Save changes
            </Button>
            <SheetClose asChild>
              <Button disabled={submitting} type="button" variant="outline">
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function RateInput({
  label,
  name,
  setForm,
  value,
}: {
  label: string;
  name: "daily";
  setForm: React.Dispatch<React.SetStateAction<ListingFormState>>;
  value: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={`listing-rate-${name}`}>{label}</Label>
      <Input
        id={`listing-rate-${name}`}
        min="0"
        onChange={(event) =>
          setForm((current) => ({ ...current, [name]: event.target.value }))
        }
        type="number"
        value={value}
      />
    </div>
  );
}

function PhotoRemover({
  label,
  onRemove,
  urls,
}: {
  label: string;
  onRemove: (index: number) => void;
  urls: string[];
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {urls.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {urls.map((url, index) => (
            <div className="relative overflow-hidden rounded-md border" key={`${url}-${index}`}>
              <Image
                alt=""
                className="aspect-video w-full object-cover"
                height={180}
                src={url}
                unoptimized
                width={320}
              />
              <Button
                aria-label="Remove photo"
                className="absolute right-2 top-2 bg-background/90"
                onClick={() => onRemove(index)}
                size="icon"
                type="button"
                variant="outline"
              >
                <X />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No photos</p>
      )}
    </div>
  );
}

function buildInitialForm(listing: AdminListing): ListingFormState {
  return {
    title: listing.title ?? "",
    description: listing.description ?? "",
    categoryId: listing.categoryId ?? "",
    subcategoryId: listing.subcategoryId ?? "",
    status: listing.status ?? listingStatuses[0],
    daily: formatNumberInput(listing.rates.daily),
    inclusions: listing.inclusions.join("\n"),
    images: listing.images,
    showcase: listing.showcase,
    suppressFromRecommendations: listing.suppressFromRecommendations,
  };
}

function toListingUpdateValues(
  form: ListingFormState,
  listing: AdminListing,
  categories: AdminCategory[],
): ListingUpdateValues {
  const rates: ListingRates = {
    daily: parseOptionalNumber(form.daily),
    weekly: listing.rates.weekly,
    monthly: listing.rates.monthly,
    annually: listing.rates.annually,
    notes: listing.rates.notes,
  };

  const category = categories.find((item) => item.id === form.categoryId);
  const subcategory = categories.find((item) => item.id === form.subcategoryId);

  return {
    title: form.title.trim(),
    description: form.description.trim(),
    categoryId: category?.id ?? form.categoryId,
    categoryName: category?.name ?? listing.categoryName ?? "",
    subcategoryId: subcategory?.id ?? null,
    subcategoryName: subcategory?.name ?? null,
    status: form.status,
    rates,
    inclusions: form.inclusions
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    images: form.images,
    showcase: form.showcase,
    suppressFromRecommendations: form.suppressFromRecommendations,
  };
}

function formatNumberInput(value: number | null) {
  return value == null ? "" : `${value}`;
}

function parseOptionalNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && value.trim() ? parsed : null;
}

function removeAt(values: string[], index: number) {
  return values.filter((_, itemIndex) => itemIndex !== index);
}
