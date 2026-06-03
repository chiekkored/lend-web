"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import {
  formatCategoryDate,
  getCategoryParentName,
  type AdminCategory,
} from "@/lib/admin-categories";

import { CategoryRowActions } from "./category-row-actions";

type CategoryColumnsOptions = {
  canDeleteCategories: boolean;
  categories: AdminCategory[];
  onActivate: (category: AdminCategory) => void;
  onDeactivate: (category: AdminCategory) => void;
  onDelete: (category: AdminCategory) => void;
  onEdit: (category: AdminCategory) => void;
};

export function createCategoryColumns({
  canDeleteCategories,
  categories,
  onActivate,
  onDeactivate,
  onDelete,
  onEdit,
}: CategoryColumnsOptions): ColumnDef<AdminCategory>[] {
  return [
    {
      accessorFn: (category) => `${category.name} ${category.slug}`,
      header: "Name",
      id: "name",
      cell: ({ row }) => (
        <div className="min-w-52">
          <div className="font-medium">{row.original.name}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {row.original.id}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
    },
    {
      accessorFn: (category) => getCategoryParentName(category, categories),
      header: "Parent",
      id: "parent",
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
      accessorKey: "isFeatured",
      header: "Featured",
      cell: ({ row }) =>
        row.original.isFeatured ? <Badge>Featured</Badge> : "No",
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
      accessorFn: (category) => category.updatedAt?.getTime() ?? 0,
      header: "Updated",
      id: "updated",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatCategoryDate(row.original.updatedAt)}
        </span>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <CategoryRowActions
          canDeleteCategories={canDeleteCategories}
          category={row.original}
          onActivate={onActivate}
          onDeactivate={onDeactivate}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ),
    },
  ];
}
