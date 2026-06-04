"use client";

import * as React from "react";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminAmenity } from "@/lib/admin-amenities";

import { createAmenityColumns } from "./amenity-columns";

type AmenityStatusFilter = "all" | "active" | "inactive";

type AmenityTableProps = {
  actions?: React.ReactNode;
  data: AdminAmenity[];
  error?: string | null;
  loading?: boolean;
  onActivate: (amenity: AdminAmenity) => void;
  onDeactivate: (amenity: AdminAmenity) => void;
  onEdit: (amenity: AdminAmenity) => void;
};

export function AmenityTable({
  actions,
  data,
  error,
  loading,
  onActivate,
  onDeactivate,
  onEdit,
}: AmenityTableProps) {
  const [statusFilter, setStatusFilter] =
    React.useState<AmenityStatusFilter>("all");
  const filteredData = React.useMemo(() => {
    return data.filter((amenity) => {
      if (statusFilter === "active") return amenity.isActive;
      if (statusFilter === "inactive") return !amenity.isActive;
      return true;
    });
  }, [data, statusFilter]);
  const columns = React.useMemo(
    () => createAmenityColumns({ onActivate, onDeactivate, onEdit }),
    [onActivate, onDeactivate, onEdit],
  );

  return (
    <AdminDataTable
      actions={actions}
      columns={columns}
      data={filteredData}
      emptyMessage="No amenities found."
      error={error}
      loading={loading}
      primaryColumnId="label"
      searchPlaceholder="Search amenities"
      storageKey="lend:admin:amenities:columns"
      toolbarFilter={
        <Select
          onValueChange={(value) =>
            setStatusFilter(value as AmenityStatusFilter)
          }
          value={statusFilter}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      }
    />
  );
}
