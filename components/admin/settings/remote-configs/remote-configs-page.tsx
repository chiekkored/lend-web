"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";

import { RemoveRemoteConfigDialog } from "./components/remove-remote-config-dialog";
import { RemoteConfigEditor } from "./components/remote-config-editor";
import { RemoteConfigTable } from "./components/remote-config-table";
import { useRemoteConfigs } from "./hooks/use-remote-configs";

export function RemoteConfigsPage() {
  const {
    closeEditor,
    confirmRemove,
    data,
    editor,
    error,
    formError,
    loading,
    openAdd,
    openUpdate,
    publishEditor,
    publishPricingPolicy,
    publishPending,
    removePending,
    removeTarget,
    setRemoveTarget,
    setToast,
    toast,
    updateEditor,
  } = useRemoteConfigs();

  const actions = (
    <Button onClick={openAdd} type="button">
      <Plus />
      Add Remote Config
    </Button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">
          Remote Configs
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Manage Firebase Remote Config default parameters used by Lend services.
        </p>
      </div>

      <RemoteConfigTable
        actions={actions}
        data={data}
        error={error}
        loading={loading}
        onRemove={setRemoveTarget}
        onUpdate={openUpdate}
      />
      <RemoteConfigEditor
        editor={editor}
        error={formError}
        onOpenChange={closeEditor}
        onPublish={publishEditor}
        onPublishPricingPolicy={publishPricingPolicy}
        onUpdate={updateEditor}
        publishing={publishPending}
      />
      <RemoveRemoteConfigDialog
        onConfirm={confirmRemove}
        onOpenChange={(open) => {
          if (!open && !removePending) {
            setRemoveTarget(null);
          }
        }}
        open={Boolean(removeTarget)}
        parameter={removeTarget}
        removing={removePending}
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
