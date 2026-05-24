import Link from "next/link";
import { ArrowRight, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
  {
    title: "Verified owners",
    text: "Temporary landing content for the Lend rental marketplace.",
    icon: ShieldCheck,
  },
  {
    title: "Local rentals",
    text: "Browse useful items nearby without committing to ownership.",
    icon: ShoppingBag,
  },
  {
    title: "Admin ready",
    text: "Operations and moderation live under the admin subdomain.",
    icon: Sparkles,
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase text-primary">Lend</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
            Temporary marketplace landing page
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            This placeholder gives the web project a public first screen while
            the customer-facing marketplace experience is being designed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/admin">
                Open admin
                <ArrowRight />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/sign-in">Admin sign in</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <item.icon className="size-5 text-primary" />
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {item.text}
              </CardContent>
            </Card>
          ))}
        </div>

        <footer className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          <Link className="transition hover:text-foreground" href="/privacy-policy">
            Privacy Policy
          </Link>
          <Link className="transition hover:text-foreground" href="/terms-and-conditions">
            Terms and Conditions
          </Link>
        </footer>
      </section>
    </main>
  );
}
