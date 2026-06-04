"use client";

import { Edit, MoreHorizontal, Power, PowerOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminAmenity } from "@/lib/admin-amenities";

type AmenityRowActionsProps = {
  amenity: AdminAmenity;
  onActivate: (amenity: AdminAmenity) => void;
  onDeactivate: (amenity: AdminAmenity) => void;
  onEdit: (amenity: AdminAmenity) => void;
};

export function AmenityRowActions({
  amenity,
  onActivate,
  onDeactivate,
  onEdit,
}: AmenityRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Open amenity actions" size="icon" variant="ghost">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(amenity)}>
          <Edit />
          Edit
        </DropdownMenuItem>
        {amenity.isActive ? (
          <DropdownMenuItem onClick={() => onDeactivate(amenity)}>
            <PowerOff />
            Deactivate
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onActivate(amenity)}>
            <Power />
            Activate
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
