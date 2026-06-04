"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  normalizeAmenityId,
  type AdminAmenity,
  type AmenityWriteValues,
} from "@/lib/admin-amenities";

import {
  activateAdminAmenity,
  amenityQueryKeys,
  deactivateAdminAmenity,
  saveAdminAmenity,
} from "../data/amenity-queries";

export type AmenityEditorState = AmenityWriteValues & {
  currentId?: string;
  mode: "add" | "edit";
};

export type AmenityToast = {
  message: string;
  title: string;
  variant: "success" | "error";
};

export function useAmenityMutations(amenities: AdminAmenity[]) {
  const queryClient = useQueryClient();
  const [editor, setEditor] = React.useState<AmenityEditorState | null>(null);
  const [deactivateTarget, setDeactivateTarget] =
    React.useState<AdminAmenity | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<AmenityToast | null>(null);

  const saveMutation = useMutation({
    mutationFn: saveAdminAmenity,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: amenityQueryKeys.all });
      setEditor(null);
      setFormError(null);
      setToast({
        title: "Amenity saved",
        message: "The amenity was updated.",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("[amenities] save failed", error);
      setFormError("Unable to save amenity.");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAdminAmenity,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: amenityQueryKeys.all });
      setDeactivateTarget(null);
      setToast({
        title: "Amenity deactivated",
        message: "The amenity is unavailable for new listings.",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("[amenities] deactivate failed", error);
      setToast({
        title: "Unable to deactivate amenity",
        message: "Try again after checking the amenity still exists.",
        variant: "error",
      });
    },
  });

  const activateMutation = useMutation({
    mutationFn: activateAdminAmenity,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: amenityQueryKeys.all });
      setToast({
        title: "Amenity activated",
        message: "The amenity is available for listings.",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("[amenities] activate failed", error);
      setToast({
        title: "Unable to activate amenity",
        message: "Try again after checking the amenity still exists.",
        variant: "error",
      });
    },
  });

  function openAdd() {
    setFormError(null);
    setEditor({
      appliesToDetailSchemaKeys: [],
      group: "General",
      iconKey: "default",
      id: "",
      isActive: true,
      label: "",
      mode: "add",
      sortOrder: nextSortOrder(amenities),
    });
  }

  function openEdit(amenity: AdminAmenity) {
    setFormError(null);
    setEditor({
      appliesToDetailSchemaKeys: amenity.appliesToDetailSchemaKeys,
      currentId: amenity.id,
      group: amenity.group,
      iconKey: amenity.iconKey,
      id: amenity.id,
      isActive: amenity.isActive,
      label: amenity.label,
      mode: "edit",
      sortOrder: amenity.sortOrder,
    });
  }

  function updateEditor(patch: Partial<AmenityEditorState>) {
    setEditor((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      if (patch.label !== undefined && current.mode === "add") {
        next.id = normalizeAmenityId(patch.label);
      }
      return next;
    });
  }

  function closeEditor(open: boolean) {
    if (!open && !saveMutation.isPending) {
      setEditor(null);
      setFormError(null);
    }
  }

  function submitEditor() {
    if (!editor) return;
    const validationError = validateAmenityEditor(editor, amenities);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    saveMutation.mutate({
      currentId: editor.currentId,
      values: {
        appliesToDetailSchemaKeys: uniqueStrings(
          editor.appliesToDetailSchemaKeys,
        ),
        group: editor.group.trim(),
        iconKey: editor.iconKey.trim(),
        id: normalizeAmenityId(editor.id),
        isActive: editor.isActive,
        label: editor.label.trim(),
        sortOrder: Number(editor.sortOrder),
      },
    });
  }

  return {
    activate: activateMutation.mutate,
    closeEditor,
    deactivatePending: deactivateMutation.isPending,
    deactivateTarget,
    editor,
    formError,
    openAdd,
    openDeactivate: setDeactivateTarget,
    openEdit,
    saving: saveMutation.isPending,
    setDeactivateTarget,
    setToast,
    submitDeactivate: () =>
      deactivateTarget ? deactivateMutation.mutate(deactivateTarget) : null,
    submitEditor,
    toast,
    updateEditor,
  };
}

function validateAmenityEditor(
  editor: AmenityEditorState,
  amenities: AdminAmenity[],
) {
  const label = editor.label.trim();
  const id = normalizeAmenityId(editor.id);
  if (!label) return "Amenity label is required.";
  if (!id) return "Amenity ID is required.";
  if (!editor.iconKey.trim()) return "Icon key is required.";
  if (!editor.group.trim()) return "Group is required.";
  if (!Number.isFinite(Number(editor.sortOrder))) {
    return "Sort order must be a finite number.";
  }
  if (!editor.appliesToDetailSchemaKeys.length) {
    return "Choose at least one applicable schema.";
  }
  if (
    amenities.some(
      (amenity) => amenity.id === id && amenity.id !== editor.currentId,
    )
  ) {
    return "Amenity ID must be unique.";
  }
  return null;
}

function nextSortOrder(amenities: AdminAmenity[]) {
  const max = amenities.reduce(
    (value, amenity) => Math.max(value, amenity.sortOrder),
    0,
  );
  return max + 10;
}

function uniqueStrings(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right));
}
