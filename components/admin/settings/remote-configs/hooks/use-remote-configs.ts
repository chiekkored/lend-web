"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { hasFirebaseConfig, missingFirebaseConfig } from "@/lib/firebase";

import {
  REMOTE_CONFIG_PRICING_POLICY_KEY,
  listRemoteConfigParameters,
  publishRemoteConfigParameter,
  remoteConfigQueryKeys,
  removeRemoteConfigParameter,
  type RemoteConfigParameter,
  type RemoteConfigValueType,
} from "../data/remote-configs";

type EditorMode = "add" | "update";

export type RemoteConfigEditorState = {
  description: string;
  mode: EditorMode;
  name: string;
  parameter: RemoteConfigParameter | null;
  value: string;
  valueType: RemoteConfigValueType;
};

export type ActionToast = {
  message: string;
  title: string;
  variant: "success" | "error";
};

const defaultEditorState: RemoteConfigEditorState = {
  description: "",
  mode: "add",
  name: "",
  parameter: null,
  value: "",
  valueType: "string",
};

const parameterNamePattern = /^[A-Za-z][A-Za-z0-9_]{0,255}$/;

export function useRemoteConfigs() {
  const queryClient = useQueryClient();
  const [editor, setEditor] =
    React.useState<RemoteConfigEditorState | null>(null);
  const [removeTarget, setRemoveTarget] =
    React.useState<RemoteConfigParameter | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<ActionToast | null>(null);

  const query = useQuery({
    enabled: hasFirebaseConfig,
    queryKey: remoteConfigQueryKeys.list(),
    queryFn: listRemoteConfigParameters,
  });

  const publishMutation = useMutation({
    mutationFn: publishRemoteConfigParameter,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: remoteConfigQueryKeys.list(),
      });
      setEditor(null);
      setFormError(null);
      setToast({
        title: "Remote Config published",
        message: "The parameter was published successfully.",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("[remote-configs] publish failed", error);
      setFormError("Unable to publish Remote Config parameter.");
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeRemoteConfigParameter,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: remoteConfigQueryKeys.list(),
      });
      setRemoveTarget(null);
      setToast({
        title: "Remote Config removed",
        message: "The parameter was removed successfully.",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error("[remote-configs] remove failed", error);
      setToast({
        title: "Unable to remove parameter",
        message: "Try again after checking the parameter still exists.",
        variant: "error",
      });
    },
  });

  const loading = hasFirebaseConfig ? query.isLoading : false;
  const error = !hasFirebaseConfig
    ? `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`
    : query.error
      ? "Unable to load Remote Config parameters."
      : null;

  function openAdd() {
    setFormError(null);
    setEditor(defaultEditorState);
  }

  function openUpdate(parameter: RemoteConfigParameter) {
    setFormError(null);
    setEditor({
      description: parameter.description,
      mode: "update",
      name: parameter.name,
      parameter,
      value: parameter.value,
      valueType: parameter.valueType,
    });
  }

  function updateEditor(patch: Partial<RemoteConfigEditorState>) {
    setEditor((current) => (current ? { ...current, ...patch } : current));
  }

  function closeEditor(open: boolean) {
    if (!open && !publishMutation.isPending) {
      setEditor(null);
      setFormError(null);
    }
  }

  function publishEditor() {
    if (!editor) return;

    const validationError = validateEditor(editor);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    publishMutation.mutate({
      description: editor.description,
      name: editor.name.trim(),
      value: editor.value,
      valueType:
        editor.name.trim() === REMOTE_CONFIG_PRICING_POLICY_KEY
          ? "json"
          : editor.valueType,
    });
  }

  function publishPricingPolicy(value: unknown) {
    if (!editor) return;
    publishMutation.mutate({
      description: editor.description,
      name: REMOTE_CONFIG_PRICING_POLICY_KEY,
      value: JSON.stringify(value),
      valueType: "json",
    });
  }

  function confirmRemove() {
    if (!removeTarget) return;
    removeMutation.mutate(removeTarget.name);
  }

  return {
    closeEditor,
    confirmRemove,
    data: query.data ?? [],
    editor,
    error,
    formError,
    loading,
    openAdd,
    openUpdate,
    publishEditor,
    publishPricingPolicy,
    publishPending: publishMutation.isPending,
    removePending: removeMutation.isPending,
    removeTarget,
    setEditor,
    setRemoveTarget,
    setToast,
    toast,
    updateEditor,
  };
}

function validateEditor(editor: RemoteConfigEditorState) {
  const name = editor.name.trim();
  if (!name) return "Remote Config name is required.";
  if (!parameterNamePattern.test(name)) {
    return "Use letters, numbers, and underscores. The name must start with a letter.";
  }

  if (editor.valueType === "number" && !Number.isFinite(Number(editor.value))) {
    return "Number value must be finite.";
  }

  if (editor.valueType === "json") {
    try {
      JSON.parse(editor.value);
    } catch {
      return "JSON value must be valid JSON.";
    }
  }

  return null;
}
