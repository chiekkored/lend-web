import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export type LegalSection = {
  title: string;
  body?: ReactNode;
  items?: ReactNode[];
};

type LegalDocumentProps = {
  title: string;
  description: string;
  effectiveDate: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export function LegalDocument({
  title,
  description,
  effectiveDate,
  lastUpdated,
  sections,
}: LegalDocumentProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <nav className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <Link className="font-semibold text-foreground" href="/">
            Lend
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
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
            Legal
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            {description}
          </p>
          <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <p>
              <span className="font-medium text-foreground">Effective date:</span>{" "}
              {effectiveDate}
            </p>
            <p>
              <span className="font-medium text-foreground">Last updated:</span>{" "}
              {lastUpdated}
            </p>
          </div>
          <div className="mt-8 rounded-md bg-accent px-4 py-3 text-sm leading-6 text-accent-foreground">
            This operational draft includes placeholders for company and contact
            details that must be completed before publication and reviewed by
            qualified legal or privacy counsel.
          </div>
        </header>

        <Separator className="my-10" />

        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-3 text-sm">
              <p className="font-medium text-foreground">Sections</p>
              <ol className="space-y-2 text-muted-foreground">
                {sections.map((section, index) => (
                  <li key={section.title}>
                    <a
                      className="transition hover:text-foreground"
                      href={`#section-${index + 1}`}
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <article className="space-y-10">
            {sections.map((section, index) => (
              <section
                className="scroll-mt-8 space-y-4"
                id={`section-${index + 1}`}
                key={section.title}
              >
                <h2 className="text-2xl font-semibold tracking-normal text-foreground">
                  {index + 1}. {section.title}
                </h2>
                {section.body ? (
                  <div className="space-y-3 text-base leading-7 text-muted-foreground">
                    {section.body}
                  </div>
                ) : null}
                {section.items?.length ? (
                  <ul className="space-y-3 text-base leading-7 text-muted-foreground">
                    {section.items.map((item, itemIndex) => (
                      <li className="pl-1" key={itemIndex}>
                        <span className="mr-2 text-primary">-</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </article>
        </div>
      </div>
    </main>
  );
}
