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
import type { AdminCategory } from "@/lib/admin-categories";

import { createCategoryColumns } from "./category-columns";

type CategoryStatusFilter = "all" | "active" | "inactive";

type CategoryTableProps = {
  actions?: React.ReactNode;
  canDeleteCategories: boolean;
  data: AdminCategory[];
  error?: string | null;
  loading?: boolean;
  onActivate: (category: AdminCategory) => void;
  onDeactivate: (category: AdminCategory) => void;
  onDelete: (category: AdminCategory) => void;
  onEdit: (category: AdminCategory) => void;
};

export function CategoryTable({
  actions,
  canDeleteCategories,
  data,
  error,
  loading,
  onActivate,
  onDeactivate,
  onDelete,
  onEdit,
}: CategoryTableProps) {
  const [statusFilter, setStatusFilter] =
    React.useState<CategoryStatusFilter>("all");
  const filteredData = React.useMemo(() => {
    return data.filter((category) => {
      if (statusFilter === "active") return category.isActive;
      if (statusFilter === "inactive") return !category.isActive;
      return true;
    });
  }, [data, statusFilter]);
  const columns = React.useMemo(
    () =>
      createCategoryColumns({
        canDeleteCategories,
        categories: data,
        onActivate,
        onDeactivate,
        onDelete,
        onEdit,
      }),
    [canDeleteCategories, data, onActivate, onDeactivate, onDelete, onEdit],
  );

  return (
    <AdminDataTable
      actions={actions}
      columns={columns}
      data={filteredData}
      emptyMessage="No categories found."
      error={error}
      loading={loading}
      primaryColumnId="name"
      searchPlaceholder="Search categories"
      storageKey="lend:admin:categories:columns"
      toolbarFilter={
        <Select
          onValueChange={(value) =>
            setStatusFilter(value as CategoryStatusFilter)
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
