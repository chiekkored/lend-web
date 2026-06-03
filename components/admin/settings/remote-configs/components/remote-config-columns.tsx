"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";

import type { RemoteConfigParameter } from "../data/remote-configs";
import { RemoteConfigRowActions } from "./remote-config-row-actions";

type RemoteConfigColumnsOptions = {
  onRemove: (parameter: RemoteConfigParameter) => void;
  onUpdate: (parameter: RemoteConfigParameter) => void;
};

export function createRemoteConfigColumns({
  onRemove,
  onUpdate,
}: RemoteConfigColumnsOptions): ColumnDef<RemoteConfigParameter>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="min-w-64">
          <div className="font-medium">{row.original.name}</div>
          {row.original.description ? (
            <div className="mt-1 max-w-md text-xs text-muted-foreground">
              {row.original.description}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => (
        <div className="min-w-72 max-w-xl">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{row.original.valueType}</Badge>
            {row.original.hasConditionalValues ? (
              <Badge variant="secondary">conditions</Badge>
            ) : null}
          </div>
          <div className="mt-2 line-clamp-3 whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground">
            {formatValuePreview(row.original.value)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "lastPublishedAt",
      header: "Last published",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatPublishedAt(row.original.lastPublishedAt)}
        </span>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <RemoteConfigRowActions
          onRemove={onRemove}
          onUpdate={onUpdate}
          parameter={row.original}
        />
      ),
    },
  ];
}

function formatValuePreview(value: string) {
  if (!value) return "Empty value";
  if (value.length <= 220) return value;
  return `${value.slice(0, 220)}...`;
}

function formatPublishedAt(value: string | null) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}
