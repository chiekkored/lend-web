import type { Metadata } from "next";

import { LegalDocument, type LegalSection } from "@/components/legal/legal-document";

export const metadata: Metadata = {
  title: "Privacy Policy | Lend",
  description:
    "How Lend collects, uses, shares, stores, and protects personal data for its rental marketplace.",
};

const sections: LegalSection[] = [
  {
    title: "Who we are",
    body: (
      <>
        <p>
          Lend is a rental marketplace that lets owners list assets for rent and
          lets renters browse listings, book date ranges, pay through supported
          payment channels, use QR handover and return checkpoints, chat about
          bookings, and complete post-return settlement flows.
        </p>
        <p>
          The operator and personal information controller for this service is{" "}
          <strong>[LEGAL_ENTITY_NAME]</strong>, with business address at{" "}
          <strong>[BUSINESS_ADDRESS]</strong>. You may contact us at{" "}
          <strong>[PRIVACY_EMAIL]</strong>, <strong>[SUPPORT_EMAIL]</strong>, or
          through our Data Protection Officer/contact point at{" "}
          <strong>[DPO_CONTACT]</strong>.
        </p>
      </>
    ),
  },
  {
    title: "Personal data we collect",
    items: [
      <>
        <strong>Account and profile data:</strong> name, email address, phone
        number, date of birth, profile photo, account type, verification level,
        account status, sign-in provider identifiers, and account timestamps.
      </>,
      <>
        <strong>Verification and safety data:</strong> identity and KYC
        submission details, face or selfie verification status, verification
        provider session identifiers, review status, submitted documents or
        photos where applicable, and admin review notes or decisions.
      </>,
      <>
        <strong>Location data:</strong> approximate or selected locations used
        to show nearby rentals, set listing or pickup locations, and support
        booking logistics, reports, support, safety review, and dispute
        handling.
      </>,
      <>
        <strong>Listing data:</strong> asset title, category, description,
        inclusions, photos, pricing, availability, location, security deposit
        settings, owner information, ratings, reviews, and listing status.
        Listing submissions and edits may be processed by automated and
        AI-assisted moderation tools before publication.
      </>,
      <>
        <strong>Booking and transaction data:</strong> selected dates, booking
        status, lifecycle events, QR handover and return checkpoints, payment
        method category, payment provider identifiers, checkout records, payout
        destination records, settlement status, refund or payout status, and
        security deposit or damage deduction details.
      </>,
      <>
        <strong>Communications and user content:</strong> chat messages, media
        messages, support or account feedback, reports, dispute evidence,
        reviews, ratings, saved listings, and recommendation engagement events.
      </>,
      <>
        <strong>Device and technical data:</strong> Firebase Cloud Messaging
        tokens, app or browser logs, IP-derived technical data, device and
        network information, crash or error data, and security audit metadata.
      </>,
    ],
  },
  {
    title: "Why we use personal data",
    items: [
      "To create and manage accounts, authenticate users, maintain sessions, and protect account access.",
      "To operate the marketplace, including listing creation, browsing, search, recommendations, saved listings, booking calendars, and owner or renter dashboards.",
      "To verify users, determine eligibility to list or rent, detect fraud, reduce marketplace risk, and support user safety.",
      "To process bookings, payment checkout, security deposits, owner payouts, deposit returns, refunds, QR handover or return checkpoints, and post-return settlement.",
      "To send operational notifications about bookings, chat, payment status, verification, reports, reminders, and account changes.",
      "To support users, respond to account feedback, investigate reports, moderate content, resolve disputes, and enforce our terms.",
      "To comply with legal, tax, accounting, consumer protection, anti-fraud, data protection, and lawful request obligations.",
      "To improve service reliability, pricing transparency, marketplace recommendations, abuse prevention, and product performance.",
    ],
  },
  {
    title: "Legal bases and privacy principles",
    body: (
      <p>
        We process personal data in line with applicable Philippine data
        protection principles, including transparency, legitimate purpose, and
        proportionality. Depending on the context, processing may be necessary
        to perform our agreement with you, comply with law, protect users and
        the marketplace, pursue legitimate business interests that do not
        override your rights, or rely on your consent where consent is required.
      </p>
    ),
  },
  {
    title: "Third-party services and sharing",
    body: (
      <p>
        We share personal data only when needed to operate Lend, comply with
        law, protect users, or support the purposes described in this policy.
        These providers process data under their own controls or under
        instructions from Lend, depending on the service.
      </p>
    ),
    items: [
      <>
        <strong>Firebase and Google Cloud:</strong> authentication, Firestore
        database, file storage, hosting, cloud functions, remote configuration,
        push notifications, logs, and operational infrastructure.
      </>,
      <>
        <strong>Google Maps:</strong> map display, place selection, and location
        support for nearby browsing and pickup or listing locations.
      </>,
      <>
        <strong>PayMongo:</strong> payment intents, cards, e-wallets, QR Ph,
        online banking channels, checkout status, wallet payouts, refund or
        payout references, and payment webhook processing.
      </>,
      <>
        <strong>Didit or other verification providers:</strong> identity, face
        KYC, session status, and verification decision support for account
        safety and eligibility checks.
      </>,
      <>
        <strong>Apple, Google, and Facebook:</strong> sign-in or platform
        account services where you choose those login methods.
      </>,
      <>
        <strong>App stores, device platforms, and messaging services:</strong>{" "}
        app distribution, push delivery, device permissions, and platform
        security features.
      </>,
      <>
        <strong>Other users and admins:</strong> information necessary for a
        booking, listing, chat, review, report, handover, return, payout, or
        dispute may be visible to the relevant renter, owner, or Lend admin.
        After a booking is confirmed, this may include names, phone numbers,
        listing or pickup location details, booking dates, chat records,
        handover or return status, reports, evidence, and settlement details
        needed to coordinate or review the rental.
        Listing content and photos may also be shared with service providers
        that help Lend perform automated or AI-assisted safety and policy
        review.
      </>,
      <>
        <strong>Authorities, advisers, or transaction parties:</strong> where
        required by law, legal process, compliance obligations, dispute
        resolution, investigation, or business transfer.
      </>,
    ],
  },
  {
    title: "Payments, payouts, and financial data",
    body: (
      <p>
        Lend uses payment providers such as PayMongo to process payment methods
        and money movement. Full card or bank credentials should be handled by
        the payment provider and not stored by Lend unless a supported provider
        feature explicitly returns limited, tokenized, or masked payment data.
        We may store provider identifiers, checkout IDs, payment intent IDs,
        payout destination metadata, transaction status, amounts, fees, refund
        status, and settlement records to operate bookings and resolve disputes.
      </p>
    ),
  },
  {
    title: "Location, camera, photos, notifications, and biometrics",
    items: [
      "Location permission helps show nearby rentals and set listing or pickup locations. Listing locations may be based on your profile location or a custom pinned location and may be shown where needed for discovery, confirmed bookings, handover, return, support, safety, reports, or disputes. You may continue with less precise or manually selected locations where the app allows it.",
      "Camera and photo library access support listing photos, profile photos, chat media, verification photos, and QR code scanning or saving.",
      "Notifications support booking requests, chat replies, confirmations, verification updates, settlement updates, and reminders.",
      "Device biometrics, when enabled by you, are used locally for protected sign-in or account actions. Lend does not receive your device biometric template.",
    ],
  },
  {
    title: "Retention",
    body: (
      <p>
        We keep personal data only as long as needed for the purposes described
        in this policy, including active account use, marketplace operations,
        payment and settlement records, dispute handling, fraud prevention,
        audit logs, accounting, legal compliance, and lawful claims. Some data
        may be kept after account closure where necessary for unresolved
        bookings, payment records, security incidents, legal obligations, or
        legitimate business records. When data is no longer needed, we delete,
        anonymize, aggregate, or securely restrict it.
      </p>
    ),
  },
  {
    title: "Security",
    body: (
      <p>
        We use reasonable organizational, technical, and administrative
        safeguards appropriate to the sensitivity of the data and the risks of
        the service. These may include authentication controls, role-based admin
        access, Firebase security rules, server-side validation, secure payment
        provider flows, logging, review workflows, and restricted access to
        operational data. No system is completely secure, so users must also
        protect their accounts, devices, and login credentials.
      </p>
    ),
  },
  {
    title: "International processing",
    body: (
      <p>
        Our service providers may process or store data in the Philippines or
        other countries where they operate infrastructure. Where personal data is
        transferred or accessed internationally, we take steps intended to
        preserve appropriate protection, accountability, and service security.
      </p>
    ),
  },
  {
    title: "Your privacy rights",
    body: (
      <p>
        Subject to applicable law and valid limitations, you may have rights to
        be informed about processing, access your personal data, correct
        inaccurate data, object to certain processing, withdraw consent where
        processing depends on consent, request erasure or blocking, request data
        portability where applicable, file a complaint with the proper authority,
        and seek damages for violations of your rights. To exercise these
        rights, contact <strong>[PRIVACY_EMAIL]</strong> or{" "}
        <strong>[DPO_CONTACT]</strong>. We may need to verify your identity
        before acting on a request.
      </p>
    ),
  },
  {
    title: "Children and minors",
    body: (
      <p>
        Lend is not intended for children. Users must meet the eligibility
        requirements in our Terms and Conditions. If we learn that a minor has
        provided personal data without required consent or authority, we may
        restrict the account and take reasonable steps to delete or block the
        data, subject to legal and safety requirements.
      </p>
    ),
  },
  {
    title: "Changes to this policy",
    body: (
      <p>
        We may update this Privacy Policy when our product, providers, legal
        obligations, or business practices change. Material updates will be
        posted in the app or on our website, and where required we will provide
        additional notice or request consent.
      </p>
    ),
  },
  {
    title: "Contact",
    body: (
      <p>
        For privacy requests, complaints, or questions, contact{" "}
        <strong>[LEGAL_ENTITY_NAME]</strong> at <strong>[PRIVACY_EMAIL]</strong>
        , <strong>[SUPPORT_EMAIL]</strong>, or <strong>[DPO_CONTACT]</strong>.
        Please include enough information for us to identify your account and
        understand your request.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      description="This Privacy Policy explains how Lend handles personal data for accounts, listings, bookings, payments, verification, chat, reports, reviews, recommendations, and admin dispute workflows."
      effectiveDate="[EFFECTIVE_DATE]"
      lastUpdated="May 24, 2026"
      sections={sections}
      title="Privacy Policy"
    />
  );
}
