"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { ChevronRight, LogOut, Moon, ShieldAlert, Sun } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useCancellationBookings } from "@/components/admin/bookings/hooks/use-cancellation-bookings";
import { usePendingDamageNotification } from "@/components/admin/bookings/hooks/use-pending-damage-bookings";
import { usePendingDeactivationRequestIndicator } from "@/components/admin/listings/deactivation-requests/hooks/use-pending-deactivation-request-indicator";
import { useLiveReports } from "@/components/admin/reports/hooks/use-live-reports";
import { useLiveVerifications } from "@/components/admin/users/hooks/use-live-verifications";
import { useLiveAccountFeedback } from "@/components/admin/account-feedback/hooks/use-live-account-feedback";
import { adminSidebarGroups } from "@/lib/admin-data";
import { filterReportsBySection, type AdminReportSection } from "@/lib/admin-reports";
import { getFirebaseAuth, hasFirebaseConfig, missingFirebaseConfig } from "@/lib/firebase";
import { cn } from "@/lib/utils";

type AdminSidebarFlatGroup = Extract<
  (typeof adminSidebarGroups)[number],
  { items: readonly unknown[] }
>;
type AdminSidebarNestedGroup = Extract<
  (typeof adminSidebarGroups)[number],
  { groups: readonly unknown[] }
>;

type AdminState =
  | { status: "loading"; user: null; error: null }
  | { status: "authorized"; user: User; error: null }
  | { status: "denied"; user: User | null; error: string };

type ThemeMode = "light" | "dark";

const ADMIN_THEME_STORAGE_KEY = "lend:admin:theme";

export function AdminAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicAdminRoute = pathname === "/admin/sign-in" || pathname === "/admin/register";
  const [state, setState] = useState<AdminState>({
    status: "loading",
    user: null,
    error: null,
  });

  useEffect(() => {
    if (isPublicAdminRoute) {
      return;
    }

    if (!hasFirebaseConfig) {
      setState({
        status: "denied",
        user: null,
        error: `Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`,
      });
      return;
    }

    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/admin/sign-in");
        return;
      }

      const token = await user.getIdTokenResult(true);
      if (token.claims.admin !== true) {
        setState({
          status: "denied",
          user,
          error: "This account is not authorized for the admin console.",
        });
        return;
      }

      setState({ status: "authorized", user, error: null });
    });
  }, [isPublicAdminRoute, router]);

  const initials = useMemo(() => {
    const email = state.user?.email ?? "admin@lend";
    return email.slice(0, 2).toUpperCase();
  }, [state.user?.email]);

  if (isPublicAdminRoute) {
    return <>{children}</>;
  }

  if (state.status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6 text-sm text-muted-foreground">Checking admin access...</CardContent>
        </Card>
      </main>
    );
  }

  if (state.status === "denied") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <ShieldAlert className="size-5 text-destructive" />
              <h1 className="text-lg font-semibold">Admin access blocked</h1>
            </div>
            <p className="text-sm text-muted-foreground">{state.error}</p>
            <Button
              variant="outline"
              onClick={async () => {
                if (hasFirebaseConfig) {
                  await signOut(getFirebaseAuth());
                }
                router.replace("/admin/sign-in");
              }}
            >
              Back to sign in
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="flex h-14 items-center justify-between gap-4 px-2">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden text-right text-sm sm:block">
                <p className="font-medium">{state.user.email}</p>
                <p className="text-muted-foreground">Firebase admin</p>
              </div>
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <Button
                aria-label="Sign out"
                onClick={async () => {
                  await signOut(getFirebaseAuth());
                  router.replace("/admin/sign-in");
                }}
                size="icon"
                variant="ghost"
              >
                <LogOut />
              </Button>
            </div>
          </div>
        </header>
        <main className="min-w-0 w-full max-w-full overflow-x-hidden px-2 py-6 sm:px-4 lg:px-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme = readStoredTheme();
    setTheme(storedTheme);
    applyTheme(storedTheme);
    setMounted(true);
  }, []);

  function onToggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(ADMIN_THEME_STORAGE_KEY, nextTheme);
  }

  const isDark = theme === "dark";

  return (
    <Button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={mounted ? isDark : undefined}
      onClick={onToggleTheme}
      size="icon"
      type="button"
      variant="ghost"
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY);
  return storedTheme === "dark" ? "dark" : "light";
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function AdminSidebar() {
  const pathname = usePathname();
  const { open, setMobileOpen } = useSidebar();
  const pendingCancellations = useCancellationBookings({
    statusFilter: "Pending",
  });
  const reports = useLiveReports();
  const verifications = useLiveVerifications();
  const accountFeedback = useLiveAccountFeedback();
  const pendingDeactivationRequests =
    usePendingDeactivationRequestIndicator();
  const { hasNewPendingDamage } = usePendingDamageNotification({
    isViewingPendingDamage: pathname === "/admin/bookings/pending-damage",
  });
  const hasNewCancellations = useQueueNewItemIndicator({
    ids: pendingCancellations.data.map((booking) => booking.id),
    isViewing: pathname === "/admin/bookings/cancellations",
    storageKey: "lend:admin:cancellations:seen-ids",
  });
  const hasNewVerifications = useQueueNewItemIndicator({
    ids: verifications.data.map((user) => user.uid),
    isViewing: pathname === "/admin/users/verifications",
    storageKey: "lend:admin:verifications:seen-ids",
  });
  const hasNewAccountFeedback = useQueueNewItemIndicator({
    ids: accountFeedback.data.map((feedback) => feedback.id),
    isViewing: pathname === "/admin/account-feedback",
    storageKey: "lend:admin:account-feedback:seen-ids",
  });
  const hasNewDeactivationRequests = useQueueNewItemIndicator({
    ids: pendingDeactivationRequests.ids,
    isViewing: pathname === "/admin/listings/deactivation-requests",
    storageKey: "lend:admin:listing-deactivation-requests:seen-ids",
  });
  const reportIndicators = useReportQueueIndicators({
    pathname,
    reports: reports.data,
  });
  const indicators = getAdminSidebarIndicators({
    hasNewAccountFeedback,
    hasNewCancellations,
    hasNewDeactivationRequests,
    hasNewPendingDamage,
    hasNewVerifications,
    reportIndicators,
  });

  const onNavigate = () => setMobileOpen(false);

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          className={cn("flex min-w-0 items-center gap-3", !open && "lg:w-full lg:justify-center")}
          href="/admin"
          onClick={onNavigate}
        >
          <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            L
          </div>
          <div className={cn("min-w-0", !open && "lg:hidden")}>
            <p className="font-semibold">Lend</p>
            <p className="text-sm text-muted-foreground">Admin panel</p>
          </div>
        </Link>
      </SidebarHeader>
      <Separator />
      <SidebarContent className="space-y-5">
        {adminSidebarGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {"items" in group
                  ? group.items.map((item) => (
                      <AdminSidebarLink
                        indicators={indicators}
                        item={item}
                        key={item.href}
                        onNavigate={onNavigate}
                        open={open}
                        pathname={pathname}
                      />
                    ))
                  : null}
                {"groups" in group
                  ? group.groups.map((navGroup) => (
                      <AdminSidebarSubmenu
                        indicators={indicators}
                        key={navGroup.title}
                        navGroup={navGroup}
                        onNavigate={onNavigate}
                        open={open}
                        pathname={pathname}
                      />
                    ))
                  : null}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

function AdminSidebarLink({
  indicators,
  item,
  onNavigate,
  open,
  pathname,
}: {
  indicators: Record<string, boolean>;
  item: AdminSidebarFlatGroup["items"][number];
  onNavigate: () => void;
  open: boolean;
  pathname: string;
}) {
  const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
  const showIndicator = indicators[item.href] === true && !active;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active}>
        <Link href={item.href} onClick={onNavigate}>
          <item.icon className="size-4" />
          <span className={cn(!open && "lg:hidden")}>{item.title}</span>
          {showIndicator ? <SidebarNewItemDot collapsed={!open} /> : null}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function AdminSidebarSubmenu({
  indicators,
  navGroup,
  onNavigate,
  open,
  pathname,
}: {
  indicators: Record<string, boolean>;
  navGroup: AdminSidebarNestedGroup["groups"][number];
  onNavigate: () => void;
  open: boolean;
  pathname: string;
}) {
  const active = navGroup.items.some((item) => pathname.startsWith(item.href));

  return (
    <Collapsible asChild className="group/collapsible" defaultOpen>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={active}>
            <navGroup.icon className="size-4" />
            <span className={cn(!open && "lg:hidden")}>{navGroup.title}</span>
            <ChevronRight
              className={cn(
                "ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90",
                !open && "lg:hidden",
              )}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {navGroup.items.map((item) => (
              <SidebarMenuSubItem key={item.href}>
                <SidebarMenuSubButton
                  asChild
                  className={cn(!open && "lg:[&>span]:hidden")}
                  isActive={
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)
                  }
                >
                  <Link href={item.href} onClick={onNavigate}>
                    <item.icon className="mr-2 size-4 lg:hidden" />
                    <span>{item.title}</span>
                    {indicators[item.href] === true && pathname !== item.href ? (
                      <SidebarNewItemDot collapsed={!open} />
                    ) : null}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function SidebarNewItemDot({ collapsed }: { collapsed: boolean }) {
  return (
    <span
      aria-label="New pending item"
      className={cn(
        "ml-auto size-2 rounded-full bg-destructive",
        collapsed && "lg:absolute lg:right-2 lg:top-2",
      )}
    />
  );
}

function getAdminSidebarIndicators({
  hasNewAccountFeedback,
  hasNewCancellations,
  hasNewDeactivationRequests,
  hasNewPendingDamage,
  hasNewVerifications,
  reportIndicators,
}: {
  hasNewAccountFeedback: boolean;
  hasNewCancellations: boolean;
  hasNewDeactivationRequests: boolean;
  hasNewPendingDamage: boolean;
  hasNewVerifications: boolean;
  reportIndicators: Record<string, boolean>;
}) {
  return {
    ...reportIndicators,
    "/admin/account-feedback": hasNewAccountFeedback,
    "/admin/bookings/cancellations": hasNewCancellations,
    "/admin/bookings/pending-damage": hasNewPendingDamage,
    "/admin/listings/deactivation-requests": hasNewDeactivationRequests,
    "/admin/users/verifications": hasNewVerifications,
  };
}

function useReportQueueIndicators({
  pathname,
  reports,
}: {
  pathname: string;
  reports: ReturnType<typeof useLiveReports>["data"];
}) {
  const userReportIds = useMemo(
    () =>
      filterReportsBySection(reports, "users")
        .filter((report) => report.status === "Pending")
        .map((report) => report.id),
    [reports],
  );
  const listingReportIds = useMemo(
    () =>
      filterReportsBySection(reports, "listings")
        .filter((report) => report.status === "Pending")
        .map((report) => report.id),
    [reports],
  );
  const messageReportIds = useMemo(
    () =>
      filterReportsBySection(reports, "messages")
        .filter((report) => report.status === "Pending")
        .map((report) => report.id),
    [reports],
  );
  const otherReportIds = useMemo(
    () =>
      filterReportsBySection(reports, "other")
        .filter((report) => report.status === "Pending")
        .map((report) => report.id),
    [reports],
  );

  return {
    "/admin/reports/listings": useQueueNewItemIndicator({
      ids: listingReportIds,
      isViewing: isReportPath(pathname, "listings"),
      storageKey: "lend:admin:reports:listings:seen-ids",
    }),
    "/admin/reports/messages": useQueueNewItemIndicator({
      ids: messageReportIds,
      isViewing: isReportPath(pathname, "messages"),
      storageKey: "lend:admin:reports:messages:seen-ids",
    }),
    "/admin/reports/other": useQueueNewItemIndicator({
      ids: otherReportIds,
      isViewing: isReportPath(pathname, "other"),
      storageKey: "lend:admin:reports:other:seen-ids",
    }),
    "/admin/reports/users": useQueueNewItemIndicator({
      ids: userReportIds,
      isViewing: isReportPath(pathname, "users"),
      storageKey: "lend:admin:reports:users:seen-ids",
    }),
  };
}

function useQueueNewItemIndicator({
  ids,
  isViewing,
  storageKey,
}: {
  ids: string[];
  isViewing: boolean;
  storageKey: string;
}) {
  const [hasNewItem, setHasNewItem] = useState(false);
  const idsKey = ids.join("\u0000");

  useEffect(() => {
    const currentIdsList = idsKey ? idsKey.split("\u0000") : [];
    const stableIds = currentIdsList.filter(Boolean);
    const currentIds = new Set(stableIds);
    const seenIds = readSeenQueueIds(storageKey);

    if (!seenIds) {
      writeSeenQueueIds(storageKey, currentIds);
      setHasNewItem(false);
      return;
    }

    if (isViewing) {
      writeSeenQueueIds(storageKey, currentIds);
      setHasNewItem(false);
      return;
    }

    setHasNewItem(stableIds.some((id) => !seenIds.has(id)));
  }, [idsKey, isViewing, storageKey]);

  return hasNewItem;
}

function isReportPath(pathname: string, section: AdminReportSection) {
  return pathname === `/admin/reports/${section}`;
}

function readSeenQueueIds(storageKey: string) {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  const rawValue = window.localStorage.getItem(storageKey);
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return new Set(
      Array.isArray(parsedValue)
        ? parsedValue.filter((item): item is string => typeof item === "string")
        : [],
    );
  } catch (error) {
    console.error("[admin-sidebar] failed to read seen queue IDs", error);
    return new Set<string>();
  }
}

function writeSeenQueueIds(storageKey: string, ids: Set<string>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(Array.from(ids)));
}
