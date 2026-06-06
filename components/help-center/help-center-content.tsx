"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bug, ChevronDown, ChevronRight, FileText, Lock, Mail, MessageSquareWarning } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type HelpTopic = {
  id: string;
  label: string;
};

type HelpQuestion = {
  topic: string;
  question: string;
  answer: string;
};

const supportEmail = "[SUPPORT_EMAIL]";
const privacyEmail = "[PRIVACY_EMAIL]";

const topics: HelpTopic[] = [
  { id: "getting-started", label: "Getting started" },
  { id: "renting", label: "Renting" },
  { id: "listing", label: "Listing items" },
  { id: "booking-changes", label: "Changes and cancellations" },
  { id: "handover", label: "Pickup and return" },
  { id: "deposits", label: "Deposits and damage" },
  { id: "evidence", label: "Photos and evidence" },
  { id: "payments", label: "Payments and payouts" },
  { id: "reviews", label: "Reviews and reports" },
  { id: "account", label: "Account and verification" },
  { id: "privacy", label: "Privacy and safety" },
  { id: "troubleshooting", label: "Troubleshooting" },
];

const questions: HelpQuestion[] = [
  {
    topic: "getting-started",
    question: "What is Lend?",
    answer:
      "Lend is a peer-to-peer rental marketplace. Owners can list items for rent, and renters can discover, book, pay, chat, and coordinate handover and return through the app.",
  },
  {
    topic: "getting-started",
    question: "Can guests use the app?",
    answer:
      "Guests may browse public listings, but protected actions such as booking, chat, saved listings, and listing management require sign-in and the required eligibility level.",
  },
  {
    topic: "getting-started",
    question: "What should I do before my first rental?",
    answer:
      "Complete your account details, review the listing carefully, check the rental dates and location, understand the security deposit if one applies, and keep communication inside the app.",
  },
  {
    topic: "renting",
    question: "When is a booking confirmed?",
    answer:
      "A booking is confirmed only after the required checkout succeeds and Lend records the booking as confirmed or booked. Temporary date locks during checkout do not guarantee a booking.",
  },
  {
    topic: "renting",
    question: "What should I check before booking?",
    answer:
      "Review the listing details, photos, inclusions, dates, price, security deposit, owner information, location, and any rules or limitations before paying.",
  },
  {
    topic: "renting",
    question: "Why can't I proceed with my selected dates?",
    answer:
      "Some stays require a minimum number of nights. When a listing has a minimum-stay requirement, select a date range that meets it before proceeding to payment.",
  },
  {
    topic: "renting",
    question: "Can I ask the owner questions before booking?",
    answer:
      "Use app-supported messaging where available and keep rental coordination inside Lend so important records are available for support, reports, or dispute review.",
  },
  {
    topic: "listing",
    question: "What do I need before publishing a listing?",
    answer:
      "You need accurate item details, photos, pricing, availability, a pinned listing location, required payout details, and any security deposit settings that apply. New listings and listing edits may be reviewed by AI-assisted moderation and Lend admins before they become public.",
  },
  {
    topic: "listing",
    question: "Can I use a custom listing location?",
    answer:
      "Yes. A listing location may come from your profile location or from a custom pinned location selected for that listing.",
  },
  {
    topic: "listing",
    question: "What should owners disclose?",
    answer:
      "Owners should disclose the item condition, included accessories, usage limits, pickup or return expectations, safety issues, and anything that may affect the renter’s decision.",
  },
  {
    topic: "listing",
    question: "Can I delete a listing with upcoming bookings?",
    answer:
      "No. If a listing has upcoming booking requests or paid bookings, you cannot delete it. You can hide it or set it under maintenance so no new bookings are created, but paid upcoming bookings should still be honored unless you cancel them through the normal cancellation flow.",
  },
  {
    topic: "listing",
    question: "What if my listed item is permanently damaged?",
    answer:
      "If the item is genuinely unusable because of verified damage or force majeure, request a listing deactivation review from the delete prompt. Add details and required photos. If Lend Support approves the request, the listing is archived, upcoming bookings are cancelled, and refund handling starts for affected renters without owner cancellation penalties.",
  },
  {
    topic: "booking-changes",
    question: "Can I change booking dates?",
    answer:
      "Date changes depend on listing availability, booking status, payment state, and owner or renter agreement. If the app does not support a change directly, coordinate through chat and contact support when needed.",
  },
  {
    topic: "booking-changes",
    question: "What happens if a booking is canceled?",
    answer:
      "Refunds, date release, and any applicable fees depend on the booking status, payment provider status, Lend policy, and the reason for cancellation. If a renter books less than 24 hours before the rental starts, the rental payment is non-refundable if cancellation is approved, but the security deposit remains refundable unless a separate settlement issue applies.",
  },
  {
    topic: "booking-changes",
    question: "What if the owner or renter does not show up?",
    answer:
      "Record what happened in chat, keep any evidence such as timestamps or photos, and report the issue from the relevant booking or contact support with the booking details.",
  },
  {
    topic: "handover",
    question: "What are QR handover and QR return for?",
    answer:
      "QR checkpoints help record handover and return status. They are compliance tools and do not automatically resolve damage claims, release payouts, or return deposits.",
  },
  {
    topic: "handover",
    question: "What should I do during pickup?",
    answer:
      "Confirm the item, inclusions, visible condition, location, and rental details before completing handover. Take clear photos if the app flow or situation calls for evidence.",
  },
  {
    topic: "handover",
    question: "What should I do during return?",
    answer:
      "Return the item on time, include all accessories, complete the QR return flow, and document the returned condition if there is any concern.",
  },
  {
    topic: "deposits",
    question: "How do security deposits work?",
    answer:
      "Security deposits help cover approved loss, damage, missing items, late return, or other covered claims. They are not insurance and may not cover every issue.",
  },
  {
    topic: "deposits",
    question: "What if an item is damaged or lost?",
    answer:
      "Use the app’s return, damage request, report, chat, and evidence flows where available. Lend may review available records and user submissions, but recovery is not guaranteed.",
  },
  {
    topic: "deposits",
    question: "Is Lend insurance?",
    answer:
      "No. Lend is a platform for peer-to-peer rentals. Lend is not the owner, insurer, guarantor, repairer, broker, or agent of listed assets or users.",
  },
  {
    topic: "evidence",
    question: "Why are photos important?",
    answer:
      "Photos before handover and after return can help show item condition, inclusions, missing parts, damage, or misuse. Clear evidence helps support review but does not guarantee a specific outcome.",
  },
  {
    topic: "evidence",
    question: "What evidence should I keep?",
    answer:
      "Keep listing photos, pickup and return photos, chat messages, timestamps, receipts, repair estimates, and any relevant notes about condition or missing inclusions.",
  },
  {
    topic: "evidence",
    question: "Can evidence be rejected?",
    answer:
      "Evidence may be incomplete, unclear, unrelated, late, or inconsistent with platform records. Lend Support review decisions depend on available records, submissions, and Lend policy.",
  },
  {
    topic: "payments",
    question: "Who processes payments?",
    answer:
      "Payments are processed through supported providers such as PayMongo. Available payment channels, fees, refunds, and provider status may depend on provider rules and app configuration.",
  },
  {
    topic: "payments",
    question: "When do owners receive payouts?",
    answer:
      "Owner funds are not released at payment time. Payout occurs after the relevant completion, admin review, auto-completion, or settlement step is satisfied.",
  },
  {
    topic: "payments",
    question: "My payment failed. What should I do?",
    answer:
      "Check your payment method, provider status, internet connection, and booking dates. If money was deducted but the booking did not update, contact support with the booking and payment details.",
  },
  {
    topic: "reviews",
    question: "How should reviews be used?",
    answer:
      "Reviews should reflect genuine rental experiences. They should not be abusive, misleading, retaliatory, discriminatory, or unrelated to the booking.",
  },
  {
    topic: "reviews",
    question: "How do I report a problem?",
    answer:
      "Use the report actions in listings, chats, bookings, or user profiles where available. For urgent safety or account concerns, contact support by email.",
  },
  {
    topic: "reviews",
    question: "What happens when I block another user?",
    answer:
      "Blocking is separate from reporting. The user’s listings are hidden from your signed-in feeds, search, saved listings, and recently viewed items, and neither account can create new bookings or continue contact after current bookings end. Chats needed for pending or active bookings remain available until the booking is completed or canceled.",
  },
  {
    topic: "reviews",
    question: "How do I unblock someone?",
    answer:
      "Open Settings, choose Blocked users, and select Unblock. The user may appear in future discovery again, but listings removed from saved or recently viewed items are not restored automatically.",
  },
  {
    topic: "reviews",
    question: "What can Lend moderate?",
    answer:
      "Lend may review, hide, remove, restrict, suspend, or take account or listing action when reports, content, or conduct create risk or may violate Lend terms or applicable law.",
  },
  {
    topic: "account",
    question: "Why does Lend ask for verification?",
    answer:
      "Verification helps reduce marketplace risk and determine eligibility for actions like listing items, receiving payouts, or booking listings with deposits. It does not guarantee another user’s behavior.",
  },
  {
    topic: "account",
    question: "I cannot access my account. What should I do?",
    answer:
      "Check your sign-in method, email or phone access, internet connection, and device time settings. If you still cannot sign in, contact support with your account email or phone number.",
  },
  {
    topic: "account",
    question: "Can I disable or delete my account?",
    answer:
      "You can request account disablement or deletion in the app. Some records may be retained where needed for bookings, payments, disputes, legal obligations, security, or fraud prevention.",
  },
  {
    topic: "privacy",
    question: "Will my contact details be shown?",
    answer:
      "Your first name and relevant listing or pickup location details may be shown to the other party once a booking is confirmed so the rental can be coordinated.",
  },
  {
    topic: "privacy",
    question: "Why does Lend use my location?",
    answer:
      "Location helps show nearby rentals, set listing or pickup locations, support booking logistics, and review safety, reports, or disputes when needed.",
  },
  {
    topic: "privacy",
    question: "Who can see my data?",
    answer:
      "Relevant owners, renters, admins, providers, or authorities may see information needed for booking, payment, handover, return, support, reporting, dispute review, or legal compliance.",
  },
  {
    topic: "troubleshooting",
    question: "Photos or location are not working.",
    answer:
      "Check app permissions for camera, photos, and location. You may need to reopen the app after changing device permissions.",
  },
  {
    topic: "troubleshooting",
    question: "I am not receiving notifications.",
    answer:
      "Check device notification permissions, app notification settings, internet connection, and whether battery or focus settings are blocking alerts.",
  },
  {
    topic: "troubleshooting",
    question: "How do I report a bug?",
    answer:
      "Email support with your device model, app version, account email or phone, screenshots if safe to share, and the steps that caused the issue.",
  },
];

const contactLinks = [
  {
    title: "General support",
    description: "Questions about accounts, bookings, listings, or app use.",
    href: `mailto:${supportEmail}?subject=Lend%20support%20request`,
    icon: Mail,
  },
  {
    title: "Report a bug",
    description: "Send app errors, broken flows, screenshots, and steps to reproduce.",
    href: `mailto:${supportEmail}?subject=Lend%20bug%20report`,
    icon: Bug,
  },
  {
    title: "Safety or report concern",
    description: "Use in-app report tools first when available, then email support.",
    href: `mailto:${supportEmail}?subject=Lend%20safety%20or%20report%20concern`,
    icon: MessageSquareWarning,
  },
  {
    title: "Privacy request",
    description: "Ask about personal data access, correction, deletion, or objections.",
    href: `mailto:${privacyEmail}?subject=Lend%20privacy%20request`,
    icon: Lock,
  },
];

export function HelpCenterContent() {
  const [selectedTopic, setSelectedTopic] = useState("getting-started");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const visibleQuestions = useMemo(() => {
    return questions.filter((question) => question.topic === selectedTopic);
  }, [selectedTopic]);

  function selectTopic(topic: string) {
    setSelectedTopic(topic);
    setOpenQuestion(null);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="min-w-0 space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Browse by topic</p>
          <div className="-mx-6 overflow-x-auto px-6 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
            <div className="flex w-max gap-2 whitespace-nowrap pb-1">
              {topics.map((topic) => {
                const selected = selectedTopic === topic.id;
                return (
                  <Button
                    className={cn(
                      "h-auto shrink-0 rounded-full px-3 py-2 text-sm",
                      selected
                        ? "shadow-none"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                    key={topic.id}
                    onClick={() => selectTopic(topic.id)}
                    size="sm"
                    variant={selected ? "default" : "secondary"}
                  >
                    {topic.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal text-foreground">Questions and answers</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {visibleQuestions.length} {visibleQuestions.length === 1 ? "answer" : "answers"} shown
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {visibleQuestions.map((item) => {
              const key = `${item.topic}:${item.question}`;
              const open = openQuestion === key;
              return (
                <Collapsible
                  className="rounded-md bg-accent"
                  key={key}
                  onOpenChange={(nextOpen) => setOpenQuestion(nextOpen ? key : null)}
                  open={open}
                >
                  <CollapsibleTrigger className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left">
                    <span className="font-medium leading-6 text-foreground">{item.question}</span>
                    <ChevronDown
                      className={cn(
                        "mt-1 size-4 shrink-0 text-muted-foreground transition-transform",
                        open ? "rotate-180" : "",
                      )}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4 text-sm leading-6 text-muted-foreground">
                    {item.answer}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>
      </section>

      <aside className="space-y-5 lg:sticky lg:top-8 lg:self-start">
        <section className="space-y-4 rounded-md bg-accent px-4 py-5">
          <div className="flex items-center gap-3">
            <Mail className="size-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-normal text-foreground">Contact support</h2>
          </div>
          <div className="space-y-3">
            {contactLinks.map((link) => (
              <a
                className="group flex items-start gap-3 rounded-md bg-background px-3 py-3 transition hover:bg-muted"
                href={link.href}
                key={link.title}
              >
                <link.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">{link.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">{link.description}</span>
                </span>
                <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            For legal details, review the{" "}
            <Link className="font-medium text-primary underline" href="/terms-and-conditions">
              Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link className="font-medium text-primary underline" href="/privacy-policy">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2 rounded-md bg-accent px-4 py-4">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <p className="font-medium text-foreground">Before contacting us</p>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Include your account email or phone, booking or listing details, screenshots if safe to share, and the steps
            that caused the issue.
          </p>
        </section>
      </aside>
    </div>
  );
}
