"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { ChevronRight, LogOut, ShieldAlert } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { adminNavItems, adminUsersNavGroup } from "@/lib/admin-data";
import {
  getFirebaseAuth,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";
import { cn } from "@/lib/utils";

type AdminState =
  | { status: "loading"; user: null; error: null }
  | { status: "authorized"; user: User; error: null }
  | { status: "denied"; user: User | null; error: string };

export function AdminAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublicAdminRoute =
    pathname === "/admin/sign-in" || pathname === "/admin/register";
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
          <CardContent className="p-6 text-sm text-muted-foreground">
            Checking admin access...
          </CardContent>
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
          <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-3">
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
                variant="outline"
              >
                <LogOut />
              </Button>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function AdminSidebar() {
  const pathname = usePathname();
  const { open, setMobileOpen } = useSidebar();
  const usersActive = pathname.startsWith("/admin/users");

  const onNavigate = () => setMobileOpen(false);

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          className={cn(
            "flex min-w-0 items-center gap-3",
            !open && "lg:w-full lg:justify-center",
          )}
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link href={item.href} onClick={onNavigate}>
                        <item.icon className="size-4" />
                        <span className={cn(!open && "lg:hidden")}>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{adminUsersNavGroup.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible
                asChild
                className="group/collapsible"
                defaultOpen={usersActive}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={usersActive}>
                      <adminUsersNavGroup.icon className="size-4" />
                      <span className={cn(!open && "lg:hidden")}>
                        {adminUsersNavGroup.title}
                      </span>
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
                    {adminUsersNavGroup.items.map((item) => (
                      <SidebarMenuSubItem key={item.href}>
                        <SidebarMenuSubButton
                          asChild
                          className={cn(!open && "lg:[&>span]:hidden")}
                          isActive={pathname === item.href}
                        >
                          <Link href={item.href} onClick={onNavigate}>
                            <item.icon className="mr-2 size-4 lg:hidden" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
