"use client";

import * as React from "react";
import { MoreVerticalIcon, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  REMOTE_CONFIG_PRICING_POLICY_KEY,
  type RemoteConfigParameter,
} from "../data/remote-configs";

type RemoteConfigRowActionsProps = {
  onRemove: (parameter: RemoteConfigParameter) => void;
  onUpdate: (parameter: RemoteConfigParameter) => void;
  parameter: RemoteConfigParameter;
};

export function RemoteConfigRowActions({
  onRemove,
  onUpdate,
  parameter,
}: RemoteConfigRowActionsProps) {
  const canRemove = parameter.name !== REMOTE_CONFIG_PRICING_POLICY_KEY;

  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Open Remote Config actions" size="icon" variant="ghost">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              onUpdate(parameter);
            }}
          >
            <Pencil />
            Update
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            disabled={!canRemove}
            onSelect={(event) => {
              event.preventDefault();
              onRemove(parameter);
            }}
          >
            <Trash2 />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
