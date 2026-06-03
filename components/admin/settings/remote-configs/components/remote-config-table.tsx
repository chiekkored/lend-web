"use client";

import * as React from "react";

import { AdminDataTable } from "@/components/admin/admin-data-table";

import type { RemoteConfigParameter } from "../data/remote-configs";
import { createRemoteConfigColumns } from "./remote-config-columns";

type RemoteConfigTableProps = {
  actions?: React.ReactNode;
  data: RemoteConfigParameter[];
  error?: string | null;
  loading?: boolean;
  onRemove: (parameter: RemoteConfigParameter) => void;
  onUpdate: (parameter: RemoteConfigParameter) => void;
};

export function RemoteConfigTable({
  actions,
  data,
  error,
  loading,
  onRemove,
  onUpdate,
}: RemoteConfigTableProps) {
  const columns = React.useMemo(
    () => createRemoteConfigColumns({ onRemove, onUpdate }),
    [onRemove, onUpdate],
  );

  return (
    <AdminDataTable
      actions={actions}
      columns={columns}
      data={data}
      emptyMessage="No Remote Config parameters found."
      error={error}
      loading={loading}
      primaryColumnId="name"
      searchPlaceholder="Search remote configs"
      storageKey="lend:admin:remote-configs:columns"
    />
  );
}
