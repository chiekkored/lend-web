"use client";

import { Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";

import { CategoryEditor } from "./components/category-editor";
import { CategoryTable } from "./components/category-table";
import { DeactivateCategoryDialog } from "./components/deactivate-category-dialog";
import { DeleteCategoryDialog } from "./components/delete-category-dialog";
import { useCategories } from "./hooks/use-categories";

export function CategoriesPage() {
  const {
    activate,
    canDeleteCategories,
    closeEditor,
    data,
    deactivatePending,
    deactivateTarget,
    deletePending,
    deleteTarget,
    editor,
    error,
    formError,
    listingCount,
    loading,
    openAdd,
    openDeactivate,
    openEdit,
    saving,
    seed,
    seedPending,
    setDeactivateTarget,
    setDeleteTarget,
    setToast,
    submitDeactivate,
    submitDelete,
    submitEditor,
    toast,
    updateEditor,
  } = useCategories();

  const actions = (
    <>
      <Button
        disabled={seedPending}
        onClick={() => seed()}
        type="button"
        variant="outline"
      >
        <RefreshCw />
        Seed
      </Button>
      <Button onClick={openAdd} type="button">
        <Plus />
        Add Category
      </Button>
    </>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Categories</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Manage category metadata used by Lend mobile browsing, listing
          creation, search, and Algolia facets.
        </p>
      </div>
      <CategoryTable
        actions={actions}
        canDeleteCategories={canDeleteCategories}
        data={data}
        error={error}
        loading={loading}
        onActivate={activate}
        onDeactivate={openDeactivate}
        onDelete={setDeleteTarget}
        onEdit={openEdit}
      />
      <CategoryEditor
        categories={data}
        editor={editor}
        error={formError}
        onOpenChange={closeEditor}
        onSubmit={submitEditor}
        onUpdate={updateEditor}
        saving={saving}
      />
      <DeactivateCategoryDialog
        category={deactivateTarget}
        listingCount={listingCount}
        onConfirm={submitDeactivate}
        onOpenChange={(open) => {
          if (!open && !deactivatePending) setDeactivateTarget(null);
        }}
        pending={deactivatePending}
      />
      <DeleteCategoryDialog
        category={deleteTarget}
        onConfirm={submitDelete}
        onOpenChange={(open) => {
          if (!open && !deletePending) setDeleteTarget(null);
        }}
        pending={deletePending}
      />
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
