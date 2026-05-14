"use client";

import * as React from "react";
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
  listingCategories,
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
  category: string;
  status: string;
  daily: string;
  inclusions: string;
  images: string[];
  showcase: string[];
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

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setForm(buildInitialForm(listing));
    resetError();
  }, [listing, open, resetError]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const success = await updateListing(toListingUpdateValues(form, listing));
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
                  onValueChange={(category) =>
                    setForm((current) => ({ ...current, category }))
                  }
                  value={form.category}
                >
                  <SelectTrigger id={`listing-category-${listing.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {listingCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
    category: listing.category ?? listingCategories[0],
    status: listing.status ?? listingStatuses[0],
    daily: formatNumberInput(listing.rates.daily),
    inclusions: listing.inclusions.join("\n"),
    images: listing.images,
    showcase: listing.showcase,
  };
}

function toListingUpdateValues(
  form: ListingFormState,
  listing: AdminListing,
): ListingUpdateValues {
  const rates: ListingRates = {
    daily: parseOptionalNumber(form.daily),
    weekly: listing.rates.weekly,
    monthly: listing.rates.monthly,
    annually: listing.rates.annually,
    notes: listing.rates.notes,
  };

  return {
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    status: form.status,
    rates,
    inclusions: form.inclusions
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    images: form.images,
    showcase: form.showcase,
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
