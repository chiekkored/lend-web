"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

function SidebarProvider({
  className,
  children,
  defaultOpen = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const value = React.useMemo(() => ({ open, setOpen, mobileOpen, setMobileOpen }), [mobileOpen, open]);

  return (
    <SidebarContext.Provider value={value}>
      <div
        className={cn(
          "group/sidebar-wrapper flex min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground",
          className,
        )}
        data-sidebar-open={open}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

function Sidebar({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <>
      {mobileOpen ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-background/80 lg:hidden"
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      ) : null}
      <aside
        className={cn(
          "group/sidebar fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:translate-x-0",
          open ? "lg:w-72" : "lg:w-20",
          mobileOpen && "translate-x-0",
          className,
        )}
        data-collapsed={!open}
        {...props}
      >
        {children}
      </aside>
    </>
  );
}

function SidebarInset({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open } = useSidebar();

  return (
    <div
      className={cn(
        "flex min-h-screen min-w-0 w-full max-w-full flex-1 flex-col overflow-x-hidden transition-[padding] duration-200",
        open ? "lg:pl-72" : "lg:pl-20",
        className,
      )}
      {...props}
    />
  );
}

function SidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { open, setOpen, setMobileOpen } = useSidebar();

  return (
    <Button
      aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
      className={className}
      onClick={() => {
        if (window.matchMedia("(min-width: 1024px)").matches) {
          setOpen((value) => !value);
        } else {
          setMobileOpen(true);
        }
      }}
      size="icon"
      type="button"
      variant="ghost"
      {...props}
    >
      <PanelLeft />
    </Button>
  );
}

function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex h-14 items-center px-4", className)} {...props} />;
}

function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-y-auto p-4", className)} {...props} />;
}

function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-t p-4", className)} {...props} />;
}

function SidebarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-3 text-xs font-medium uppercase tracking-wide text-sidebar-foreground/60 group-data-[collapsed=true]/sidebar:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("space-y-1", className)} {...props} />;
}

function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("group/menu-item relative list-none", className)} {...props} />;
}

function SidebarMenuButton({
  className,
  isActive,
  asChild = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "group-data-[collapsed=true]/sidebar:lg:justify-center group-data-[collapsed=true]/sidebar:lg:px-0",
        isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/75",
        className,
      )}
      data-active={isActive}
      {...props}
    />
  );
}

function SidebarMenuSub({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn(
        "ml-5 mt-1 space-y-1 border-l border-sidebar-border pl-3 group-data-[collapsed=true]/sidebar:lg:ml-0 group-data-[collapsed=true]/sidebar:lg:border-l-0 group-data-[collapsed=true]/sidebar:lg:pl-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("list-none", className)} {...props} />;
}

function SidebarMenuSubButton({
  className,
  isActive,
  asChild = false,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  asChild?: boolean;
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      className={cn(
        "flex min-h-8 items-center rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "group-data-[collapsed=true]/sidebar:lg:justify-center group-data-[collapsed=true]/sidebar:lg:px-0",
        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70",
        className,
      )}
      data-active={isActive}
      {...props}
    />
  );
}

function SidebarMenuAction({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "absolute right-1 top-1.5 flex size-7 items-center justify-center rounded-md text-sidebar-foreground/70 outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        "group-data-[collapsed=true]/sidebar:lg:hidden",
        className,
      )}
      type="button"
      {...props}
    />
  );
}

function SidebarRail({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("hidden", className)} {...props} />;
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
};
