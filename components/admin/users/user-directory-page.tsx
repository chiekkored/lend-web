"use client";

import * as React from "react";
import { collection, getDocs } from "firebase/firestore";
import {
  Copy,
  ExternalLink,
  Mail,
  MoreHorizontal,
  UserRound,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  filterUsersBySection,
  formatUserDate,
  getUserDisplayName,
  mapAdminUser,
  type AdminUser,
  type UserDirectorySection,
  userDirectoryContent,
} from "@/lib/admin-users";
import {
  getFirebaseFirestore,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";

type UserDirectoryPageProps = {
  section: UserDirectorySection;
};

export function UserDirectoryPage({ section }: UserDirectoryPageProps) {
  const content = userDirectoryContent[section];
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;

    async function loadUsers() {
      if (!hasFirebaseConfig) {
        setError(
          `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const snapshot = await getDocs(
          collection(getFirebaseFirestore(), "users"),
        );
        const nextUsers = snapshot.docs.map(mapAdminUser);

        if (active) {
          setUsers(nextUsers);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load users.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      active = false;
    };
  }, []);

  const data = React.useMemo(
    () => filterUsersBySection(users, section),
    [section, users],
  );

  const columns = React.useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        id: "name",
        accessorFn: getUserDisplayName,
        header: "Name",
        cell: ({ row }) => {
          const user = row.original;
          const displayName = getUserDisplayName(user);
          const initials = displayName
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div className="flex min-w-56 items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback>
                  {initials || <UserRound className="size-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.uid}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "email",
        accessorFn: (user) => user.email ?? "",
        header: "Email",
        cell: ({ row }) => row.original.email ?? "Not set",
      },
      {
        id: "phone",
        accessorFn: (user) => user.phone ?? "",
        header: "Phone",
        cell: ({ row }) => row.original.phone ?? "Not set",
      },
      {
        id: "type",
        accessorFn: (user) => user.type ?? "",
        header: "Type",
        cell: ({ row }) => row.original.type ?? "Not set",
      },
      {
        id: "listingEligibility",
        accessorFn: (user) => user.isListingEligible ?? "",
        header: "Listing Eligibility",
        cell: ({ row }) =>
          row.original.isListingEligible ? (
            <StatusBadge value={row.original.isListingEligible} />
          ) : (
            "Not set"
          ),
      },
      {
        id: "rentingEligibility",
        accessorFn: (user) => user.isRentingEligible ?? "",
        header: "Renting Eligibility",
        cell: ({ row }) =>
          row.original.isRentingEligible ? (
            <StatusBadge value={row.original.isRentingEligible} />
          ) : (
            "Not set"
          ),
      },
      {
        id: "createdAt",
        accessorFn: (user) => user.createdAt?.getTime() ?? 0,
        header: "Created At",
        cell: ({ row }) => formatUserDate(row.original.createdAt),
      },
      {
        id: "userMetadataVersion",
        accessorFn: (user) => user.userMetadataVersion,
        header: "Metadata Version",
        cell: ({ row }) => row.original.userMetadataVersion,
      },
      {
        id: "actions",
        enableGlobalFilter: false,
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => <UserRowActions user={row.original} />,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">
          {content.title}
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          {content.description}
        </p>
      </div>

      <AdminDataTable
        columns={columns}
        data={data}
        emptyMessage="No users match this view."
        error={error}
        loading={loading}
        searchPlaceholder={`Search ${content.title.toLowerCase()}`}
        title={content.title}
      />
    </div>
  );
}

function UserRowActions({ user }: { user: AdminUser }) {
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
