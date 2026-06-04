"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import {
  formatAmenityDate,
  type AdminAmenity,
} from "@/lib/admin-amenities";

import { AmenityRowActions } from "./amenity-row-actions";

type AmenityColumnsOptions = {
  onActivate: (amenity: AdminAmenity) => void;
  onDeactivate: (amenity: AdminAmenity) => void;
  onEdit: (amenity: AdminAmenity) => void;
};

export function createAmenityColumns({
  onActivate,
  onDeactivate,
  onEdit,
}: AmenityColumnsOptions): ColumnDef<AdminAmenity>[] {
  return [
    {
      accessorFn: (amenity) => `${amenity.label} ${amenity.id}`,
      header: "Amenity",
      id: "label",
      cell: ({ row }) => (
        <div className="min-w-52">
          <div className="font-medium">{row.original.label}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {row.original.id}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "group",
      header: "Group",
    },
    {
      accessorKey: "iconKey",
      header: "Icon",
    },
    {
      accessorKey: "sortOrder",
      header: "Sort Order",
    },
    {
      accessorFn: (amenity) => amenity.appliesToDetailSchemaKeys.join(" "),
      header: "Schemas",
      id: "schemas",
      cell: ({ row }) => (
        <div className="flex max-w-80 flex-wrap gap-1">
          {row.original.appliesToDetailSchemaKeys.map((schemaKey) => (
            <Badge key={schemaKey} variant="outline">
              {schemaKey}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: ({ row }) =>
        row.original.isActive ? (
          <Badge variant="secondary">Active</Badge>
        ) : (
          <Badge variant="outline">Inactive</Badge>
        ),
    },
    {
      accessorFn: (amenity) => amenity.updatedAt?.getTime() ?? 0,
      header: "Updated",
      id: "updated",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatAmenityDate(row.original.updatedAt)}
        </span>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <AmenityRowActions
          amenity={row.original}
          onActivate={onActivate}
          onDeactivate={onDeactivate}
          onEdit={onEdit}
        />
      ),
    },
  ];
}
