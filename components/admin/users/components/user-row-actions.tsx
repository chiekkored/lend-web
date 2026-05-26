"use client";

import * as React from "react";
import { Copy, ExternalLink, Mail, MessageCircle, MoreVerticalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminUser } from "@/lib/admin-users";

import { UserViewSheet } from "./user-view-sheet";
import { UserSupportChatSheet } from "./user-support-chat-sheet";

type UserRowActionsProps = {
  user: AdminUser;
};

export function UserRowActions({ user }: UserRowActionsProps) {
  const [viewOpen, setViewOpen] = React.useState(false);
  const [supportChatOpen, setSupportChatOpen] = React.useState(false);

  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Open user actions" size="icon" variant="ghost">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setViewOpen(true);
            }}
          >
            <ExternalLink />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setSupportChatOpen(true);
            }}
          >
            <MessageCircle />
            View support chat
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
      <UserViewSheet
        onOpenChange={setViewOpen}
        open={viewOpen}
        user={user}
      />
      <UserSupportChatSheet
        onOpenChange={setSupportChatOpen}
        open={supportChatOpen}
        user={user}
      />
    </div>
  );
}

function copyToClipboard(value: string) {
  if (!navigator.clipboard) {
    return;
  }

  navigator.clipboard.writeText(value);
}
