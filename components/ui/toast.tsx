"use client";

import * as React from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error";

type ToastProps = {
  message: string;
  onDismiss: () => void;
  title: string;
  variant: ToastVariant;
};

export function Toast({ message, onDismiss, title, variant }: ToastProps) {
  React.useEffect(() => {
    const timeoutId = window.setTimeout(onDismiss, 4500);
    return () => window.clearTimeout(timeoutId);
  }, [onDismiss, title, message, variant]);

  const Icon = variant === "success" ? CheckCircle2 : XCircle;

  return (
    <div
      className={cn(
        "fixed right-4 top-4 z-50 grid w-[calc(100vw-2rem)] max-w-sm gap-2 rounded-md border bg-popover p-4 text-popover-foreground shadow-lg",
        variant === "success" && "border-primary/40",
        variant === "error" && "border-destructive/50",
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn(
            "mt-0.5 size-5 shrink-0",
            variant === "success" ? "text-primary" : "text-destructive",
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground [overflow-wrap:anywhere]">
            {message}
          </p>
        </div>
        <Button
          aria-label="Dismiss notification"
          className="-mr-2 -mt-2"
          onClick={onDismiss}
          size="icon"
          type="button"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
