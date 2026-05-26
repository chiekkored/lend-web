import type { Metadata } from "next";
import Link from "next/link";

import { HelpCenterContent } from "@/components/help-center/help-center-content";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Help Center | Lend",
  description:
    "Help, FAQs, safety guidance, payment information, and support contacts for using Lend.",
};

export default function HelpCenterPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <nav className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <Link className="font-semibold text-foreground" href="/">
            Lend
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <Link className="transition hover:text-foreground" href="/help-center">
              Help Center
            </Link>
            <Link className="transition hover:text-foreground" href="/privacy-policy">
              Privacy Policy
            </Link>
            <Link className="transition hover:text-foreground" href="/terms-and-conditions">
              Terms and Conditions
            </Link>
          </div>
        </nav>

        <header className="pt-16">
          <Badge className="mb-5" variant="secondary">
            Support
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            Help Center
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            Find answers about using Lend, booking rentals, publishing listings,
            payments, safety, privacy, and reporting problems.
          </p>
        </header>

        <Separator className="my-10" />

        <HelpCenterContent />
      </div>
    </main>
  );
}
