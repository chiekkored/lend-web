"use client";

import { Copy, ExternalLink, Mail, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUserDisplayName, type AdminUser } from "@/lib/admin-users";

type UserRowActionsProps = {
  user: AdminUser;
};

export function UserRowActions({ user }: UserRowActionsProps) {
  const displayName = getUserDisplayName(user);

  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Open user actions" size="icon" variant="ghost">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={() => {
              window.alert(
                [
                  displayName,
                  `UID: ${user.uid}`,
                  `Email: ${user.email ?? "Not set"}`,
                  `Phone: ${user.phone ?? "Not set"}`,
                  `Type: ${user.type ?? "Not set"}`,
                  `Listing: ${user.isListingEligible ?? "Not set"}`,
                  `Renting: ${user.isRentingEligible ?? "Not set"}`,
                ].join("\n"),
              );
            }}
          >
            <ExternalLink />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => copyToClipboard(user.uid)}>
            <Copy />
            Copy UID
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!user.email}
            onSelect={() => {
              if (user.email) {
                copyToClipboard(user.email);
              }
            }}
          >
            <Copy />
            Copy email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild disabled={!user.email}>
            <a href={user.email ? `mailto:${user.email}` : undefined}>
              <Mail />
              Email user
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function copyToClipboard(value: string) {
  if (!navigator.clipboard) {
    return;
  }

  navigator.clipboard.writeText(value);
}
