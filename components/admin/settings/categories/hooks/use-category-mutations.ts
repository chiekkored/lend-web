"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  normalizeCategorySlug,
  type AdminCategory,
  type CategoryWriteValues,
} from "@/lib/admin-categories";
import { getFirebaseAuth, hasFirebaseConfig } from "@/lib/firebase";

import {
  activateAdminCategory,
  categoryQueryKeys,
  countListingsForCategory,
  deactivateAdminCategory,
  deleteAdminCategory,
  saveAdminCategory,
  seedInitialCategories,
} from "../data/category-queries";

export type CategoryEditorState = CategoryWriteValues & {
  currentId?: string;
  mode: "add" | "edit";
};

export type CategoryToast = {
  message: string;
  title: string;
  variant: "success" | "error";
};

export function useCategoryMutations(categories: AdminCategory[]) {
  const queryClient = useQueryClient();
  const [editor, setEditor] = React.useState<CategoryEditorState | null>(null);
  const [deactivateTarget, setDeactivateTarget] =
    React.useState<AdminCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<AdminCategory | null>(
    null,
  );
  const [callerAdminType, setCallerAdminType] = React.useState<string | null>(
    null,
  );
  const [listingCount, setListingCount] = React.useState<number | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<CategoryToast | null>(null);
  const canDeleteCategories =
    callerAdminType === "admin" || callerAdminType === "superadmin";

  React.useEffect(() => {
    let active = true;

    async function loadAdminType() {
      if (!hasFirebaseConfig) return;
      const user = getFirebaseAuth().currentUser;
      if (!user) return;
      const token = await user.getIdTokenResult();
      if (!active) return;
      setCallerAdminType(
        typeof token.claims.adminType === "string"
          ? token.claims.adminType
          : null,
      );
    }

    loadAdminType().catch((error) => {
      console.error("[categories] load admin claims failed", error);
    });

    return () => {
      active = false;
    };
  }, []);

  const saveMutation = useMutation({
    mutationFn: saveAdminCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      setEditor(null);
      setFormError(null);
      setToast({
        title: "Category saved",
        message: "The category was updated.",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("[categories] save failed", error);
      setFormError("Unable to save category.");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateAdminCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      setDeactivateTarget(null);
      setListingCount(null);
      setToast({
        title: "Category deactivated",
        message: "The category is unavailable for new listings.",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("[categories] deactivate failed", error);
      setToast({
        title: "Unable to deactivate category",
        message: "Try again after checking the category still exists.",
        variant: "error",
      });
    },
  });

  const activateMutation = useMutation({
    mutationFn: activateAdminCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      setToast({
        title: "Category activated",
        message: "The category is available for listings.",
        variant: "success",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      setDeleteTarget(null);
      setToast({
        title: "Category deleted",
        message: "The category document was removed.",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("[categories] delete failed", error);
      setToast({
        title: "Unable to delete category",
        message: "Try again after checking the category still exists.",
        variant: "error",
      });
    },
  });

  const seedMutation = useMutation({
    mutationFn: seedInitialCategories,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
      setToast({
        title: "Seeded categories",
        message: "Initial parent categories were created.",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("[categories] seed failed", error);
      setToast({
        title: "Unable to seed categories",
        message: "Try again after checking Firebase access.",
        variant: "error",
      });
    },
  });

  function openAdd() {
    setFormError(null);
    setEditor({
      iconKey: "default",
      imageUrl: null,
      isActive: true,
      isFeatured: false,
      mode: "add",
      name: "",
      parentId: null,
      slug: "",
      sortOrder: nextSortOrder(categories),
    });
  }

  function openEdit(category: AdminCategory) {
    setFormError(null);
    setEditor({
      currentId: category.id,
      iconKey: category.iconKey,
      imageUrl: category.imageUrl,
      isActive: category.isActive,
      isFeatured: category.isFeatured,
      mode: "edit",
      name: category.name,
      parentId: category.parentId,
      slug: category.slug,
      sortOrder: category.sortOrder,
    });
  }

  function updateEditor(patch: Partial<CategoryEditorState>) {
    setEditor((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      if (patch.name !== undefined && current.mode === "add") {
        next.slug = normalizeCategorySlug(patch.name);
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
    const validationError = validateCategoryEditor(editor, categories);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    saveMutation.mutate({
      currentId: editor.currentId,
      values: {
        iconKey: editor.iconKey.trim(),
        imageUrl: editor.imageUrl?.trim() || null,
        isActive: editor.isActive,
        isFeatured: editor.isFeatured,
        name: editor.name.trim(),
        parentId: editor.parentId || null,
        slug: normalizeCategorySlug(editor.slug),
        sortOrder: Number(editor.sortOrder),
      },
    });
  }

  async function openDeactivate(category: AdminCategory) {
    setDeactivateTarget(category);
    setListingCount(null);
    try {
      setListingCount(await countListingsForCategory(category.id));
    } catch (error) {
      console.error("[categories] count listings failed", error);
    }
  }

  return {
    activate: activateMutation.mutate,
    activating: activateMutation.isPending,
    canDeleteCategories,
    closeEditor,
    deactivatePending: deactivateMutation.isPending,
    deactivateTarget,
    deletePending: deleteMutation.isPending,
    deleteTarget,
    editor,
    formError,
    listingCount,
    openAdd,
    openDeactivate,
    openEdit,
    saving: saveMutation.isPending,
    seed: seedMutation.mutate,
    seedPending: seedMutation.isPending,
    setDeactivateTarget,
    setDeleteTarget,
    setToast,
    submitDeactivate: () =>
      deactivateTarget ? deactivateMutation.mutate(deactivateTarget) : null,
    submitDelete: () => {
      if (!deleteTarget || !canDeleteCategories) return null;
      return deleteMutation.mutate(deleteTarget);
    },
    submitEditor,
    toast,
    updateEditor,
  };
}

function validateCategoryEditor(
  editor: CategoryEditorState,
  categories: AdminCategory[],
) {
  const name = editor.name.trim();
  const slug = normalizeCategorySlug(editor.slug);
  if (!name) return "Category name is required.";
  if (!slug) return "Slug is required.";
  if (!editor.iconKey.trim()) return "Icon key is required.";
  if (!Number.isFinite(Number(editor.sortOrder))) {
    return "Sort order must be a finite number.";
  }
  if (editor.parentId && editor.parentId === editor.currentId) {
    return "A category cannot be its own parent.";
  }
  if (
    editor.parentId &&
    !categories.some((category) => category.id === editor.parentId)
  ) {
    return "Selected parent category no longer exists.";
  }
  if (
    categories.some(
      (category) => category.id === slug && category.id !== editor.currentId,
    )
  ) {
    return "Slug must be unique.";
  }
  return null;
}

function nextSortOrder(categories: AdminCategory[]) {
  const max = categories.reduce(
    (value, category) => Math.max(value, category.sortOrder),
    0,
  );
  return max + 10;
}
