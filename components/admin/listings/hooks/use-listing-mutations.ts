"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import type {
  AdminListing,
  ListingUpdateValues,
} from "@/lib/admin-listings";
import {
  getFirebaseAuth,
  getFirebaseFirestore,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";

import { listingQueryKeys } from "../data/listing-queries";

type MutationAction = "delete" | "reject" | "update";
type AuditType = "Approved" | "Deleted" | "Edited" | "Rejected";

type ListingAuditInput = {
  notes: string;
  type: AuditType;
};

export function useListingMutation(listing: AdminListing) {
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const resetError = React.useCallback(() => setError(null), []);

  async function run(
    action: MutationAction,
    values?: ListingUpdateValues,
    audit?: ListingAuditInput,
  ) {
    setError(null);

    if (!hasFirebaseConfig) {
      setError(
        `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
      );
      return false;
    }

    if (!listing.ownerId) {
      setError("Listing is missing an owner ID.");
      return false;
    }

    setSubmitting(true);
    try {
      const db = getFirebaseFirestore();
      const createdBy = getCurrentAdminAuditUser();
      const assetRef = doc(db, "assets", listing.id);
      const ownerMirrorRef = doc(
        db,
        "users",
        listing.ownerId,
        "assets",
        listing.id,
      );

      if (action === "delete") {
        const batch = writeBatch(db);
        batch.update(assetRef, {
          isDeleted: true,
          updatedAt: serverTimestamp(),
        });
        batch.set(
          ownerMirrorRef,
          {
            isDeleted: true,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
        addAuditToBatch(batch, {
          assetId: listing.id,
          createdBy,
          notes: audit?.notes ?? "",
          type: "Deleted",
        });
        await batch.commit();
      } else if (action === "reject") {
        const batch = writeBatch(db);
        batch.update(assetRef, {
          status: "Rejected",
          updatedAt: serverTimestamp(),
        });
        batch.set(
          ownerMirrorRef,
          {
            status: "Rejected",
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
        addAuditToBatch(batch, {
          assetId: listing.id,
          createdBy,
          notes: audit?.notes ?? "",
          type: "Rejected",
        });
        await batch.commit();
      } else if (values) {
        await updateListingDocs({
          assetRef,
          createdBy,
          listing,
          ownerMirrorRef,
          values,
        });
      }

      await queryClient.invalidateQueries({ queryKey: listingQueryKeys.root });
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update listing.",
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    deleteListing: (notes: string) =>
      run("delete", undefined, { notes, type: "Deleted" }),
    error,
    rejectListing: (notes: string) =>
      run("reject", undefined, { notes, type: "Rejected" }),
    resetError,
    submitting,
    updateListing: (values: ListingUpdateValues) => run("update", values),
  };
}

async function updateListingDocs({
  assetRef,
  createdBy,
  listing,
  ownerMirrorRef,
  values,
}: {
  assetRef: ReturnType<typeof doc>;
  createdBy: { name: string; uid: string };
  listing: AdminListing;
  ownerMirrorRef: ReturnType<typeof doc>;
  values: ListingUpdateValues;
}) {
  const db = assetRef.firestore;
  const batch = writeBatch(db);

  batch.update(assetRef, {
    category: values.category,
    description: values.description,
    images: values.images,
    inclusions: values.inclusions,
    rates: values.rates,
    showcase: values.showcase,
    status: values.status,
    suppressFromRecommendations: values.suppressFromRecommendations,
    title: values.title,
    updatedAt: serverTimestamp(),
  });
  batch.set(
    ownerMirrorRef,
    {
      category: values.category,
      images: values.images,
      isDeleted: false,
      status: values.status,
      title: values.title,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  addAuditToBatch(batch, {
    assetId: listing.id,
    createdBy,
    notes: buildEditAuditNotes(listing, values),
    type: values.status === "Approved" && listing.status !== "Approved" ? "Approved" : "Edited",
  });

  await batch.commit();
}

function addAuditToBatch(
  batch: ReturnType<typeof writeBatch>,
  {
    assetId,
    createdBy,
    notes,
    type,
  }: {
    assetId: string;
    createdBy: { name: string; uid: string };
    notes: string;
    type: AuditType;
  },
) {
  const db = getFirebaseFirestore();
  const auditRef = doc(collection(db, "assets", assetId, "audits"));

  batch.set(auditRef, {
    createdAt: serverTimestamp(),
    createdBy,
    notes,
    type,
  });
}

function getCurrentAdminAuditUser() {
  const user = getFirebaseAuth().currentUser;

  if (!user) {
    throw new Error("You must be signed in to update listings.");
  }

  return {
    uid: user.uid,
    name: user.displayName ?? user.email ?? user.uid,
  };
}

function buildEditAuditNotes(
  listing: AdminListing,
  values: ListingUpdateValues,
) {
  const changes = [
    compareField("Title", listing.title ?? "", values.title),
    compareField("Description", listing.description ?? "", values.description),
    compareField("Category", listing.category ?? "", values.category),
    compareField("Status", listing.status ?? "", values.status),
    compareField("Daily rate", listing.rates.daily, values.rates.daily),
    compareField("Weekly rate", listing.rates.weekly, values.rates.weekly),
    compareField("Monthly rate", listing.rates.monthly, values.rates.monthly),
    compareField("Annual rate", listing.rates.annually, values.rates.annually),
    compareField("Rate notes", listing.rates.notes ?? "", values.rates.notes ?? ""),
    compareField("Inclusions", listing.inclusions, values.inclusions),
    compareField("Photos", listing.images, values.images),
    compareField("Showcase photos", listing.showcase, values.showcase),
    compareField(
      "Suppress from recommendations",
      listing.suppressFromRecommendations,
      values.suppressFromRecommendations,
    ),
  ].filter(Boolean);

  return changes.length ? changes.join("\n") : "No field changes detected.";
}

function compareField(label: string, before: unknown, after: unknown) {
  const beforeValue = formatAuditValue(before);
  const afterValue = formatAuditValue(after);

  if (beforeValue === afterValue) {
    return null;
  }

  return `${label}: ${beforeValue} -> ${afterValue}`;
}

function formatAuditValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "None";
  }

  if (value === null || value === undefined || value === "") {
    return "None";
  }

  return String(value);
}
