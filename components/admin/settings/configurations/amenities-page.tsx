"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";

import { AmenityEditor } from "./amenities/components/amenity-editor";
import { AmenityTable } from "./amenities/components/amenity-table";
import { DeactivateAmenityDialog } from "./amenities/components/deactivate-amenity-dialog";
import { useAmenities } from "./amenities/hooks/use-amenities";

export function AmenitiesPage() {
  const {
    activate,
    categories,
    closeEditor,
    data,
    deactivatePending,
    deactivateTarget,
    editor,
    error,
    formError,
    loading,
    openAdd,
    openDeactivate,
    openEdit,
    saving,
    setDeactivateTarget,
    setToast,
    submitDeactivate,
    submitEditor,
    toast,
    updateEditor,
  } = useAmenities();

  const actions = (
    <Button onClick={openAdd} type="button">
      <Plus />
      Add Amenity
    </Button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">Amenities</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Configure reusable amenity options for listing detail forms.
        </p>
      </div>
      <AmenityTable
        actions={actions}
        data={data}
        error={error}
        loading={loading}
        onActivate={activate}
        onDeactivate={openDeactivate}
        onEdit={openEdit}
      />
      <AmenityEditor
        amenities={data}
        categories={categories}
        editor={editor}
        error={formError}
        onOpenChange={closeEditor}
        onSubmit={submitEditor}
        onUpdate={updateEditor}
        saving={saving}
      />
      <DeactivateAmenityDialog
        amenity={deactivateTarget}
        onConfirm={submitDeactivate}
        onOpenChange={(open) => {
          if (!open && !deactivatePending) setDeactivateTarget(null);
        }}
        pending={deactivatePending}
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
