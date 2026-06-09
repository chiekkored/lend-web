"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, ListChecks, ShieldAlert, Tags } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const configurationNavItems = [
  {
    title: "Maintenance",
    href: "/admin/settings/configurations/maintenance",
    icon: ShieldAlert,
  },
  {
    title: "Categories",
    href: "/admin/settings/configurations/categories",
    icon: Tags,
  },
  {
    title: "Amenities",
    href: "/admin/settings/configurations/amenities",
    icon: ListChecks,
  },
  {
    title: "Payment Methods",
    href: "/admin/settings/configurations/payment-methods",
    icon: CreditCard,
  },
] as const;

export function ConfigurationsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">
          Configurations
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Manage platform metadata used by listing creation, search, and
          marketplace browsing.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b pb-3 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {configurationNavItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Button
                  asChild
                  className={cn(
                    "h-10 justify-start rounded-md px-3",
                    !active && "text-muted-foreground",
                  )}
                  key={item.href}
                  variant={active ? "secondary" : "ghost"}
                >
                  <Link href={item.href}>
                    <item.icon />
                    {item.title}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}
