"use client";

import { Edit, MoreHorizontal, Power, PowerOff, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminCategory } from "@/lib/admin-categories";

type CategoryRowActionsProps = {
  canDeleteCategories: boolean;
  category: AdminCategory;
  onActivate: (category: AdminCategory) => void;
  onDeactivate: (category: AdminCategory) => void;
  onDelete: (category: AdminCategory) => void;
  onEdit: (category: AdminCategory) => void;
};

export function CategoryRowActions({
  canDeleteCategories,
  category,
  onActivate,
  onDeactivate,
  onDelete,
  onEdit,
}: CategoryRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Open category actions" size="icon" variant="ghost">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(category)}>
          <Edit />
          Edit
        </DropdownMenuItem>
        {category.isActive ? (
          <DropdownMenuItem onClick={() => onDeactivate(category)}>
            <PowerOff />
            Deactivate
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onActivate(category)}>
            <Power />
            Activate
          </DropdownMenuItem>
        )}
        {canDeleteCategories ? (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(category)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
