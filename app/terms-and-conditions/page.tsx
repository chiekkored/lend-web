import type { Metadata } from "next";

import { LegalDocument, type LegalSection } from "@/components/legal/legal-document";

export const metadata: Metadata = {
  title: "Terms and Conditions | Lend",
  description:
    "Terms governing use of the Lend rental marketplace, including accounts, listings, bookings, payments, deposits, disputes, and moderation.",
};

const sections: LegalSection[] = [
  {
    title: "Agreement to these terms",
    body: (
      <>
        <p>
          These Terms and Conditions govern your access to and use of Lend, a rental marketplace operated by{" "}
          <strong>[LEGAL_ENTITY_NAME]</strong>, with business address at <strong>[BUSINESS_ADDRESS]</strong>. By
          creating an account, browsing listings, posting assets, booking a rental, paying through checkout, chatting,
          submitting verification, or otherwise using Lend, you agree to these terms.
        </p>
        <p>
          If you do not agree, do not use Lend. If you are using Lend for a business, organization, or another person,
          you represent that you have authority to bind them to these terms.
        </p>
      </>
    ),
  },
  {
    title: "What Lend provides",
    body: (
      <p>
        Lend provides technology that helps owners list assets for rent and helps renters discover, book, pay for,
        receive, return, review, and resolve rentals. Lend is a peer-to-peer marketplace platform. Unless expressly
        stated otherwise, Lend is not the owner, manufacturer, insurer, repairer, employer, agent, broker, or guarantor
        of any listed asset or user. Verification, platform records, support review, and admin moderation are
        risk-reduction tools only. They do not guarantee user behavior, asset condition, payment success, payout
        success, or dispute outcome. Owners and renters are responsible for their own conduct, listings, handovers,
        returns, and compliance with law.
      </p>
    ),
  },
  {
    title: "Eligibility and accounts",
    items: [
      "You must be legally capable of entering into binding agreements and must meet the age, identity, and location requirements Lend applies for the service.",
      "You must provide accurate, current, and complete account information and keep it updated.",
      "You are responsible for activity under your account and for keeping your login credentials, devices, and payment or payout details secure.",
      "Lend may require identity, face, contact, ownership, or payout verification before you can list assets, book certain assets, receive payouts, or continue using the service.",
      "Lend may reject, suspend, restrict, or close an account if information is inaccurate, unverifiable, fraudulent, unsafe, unlawful, or inconsistent with these terms.",
    ],
  },
  {
    title: "Owners and listings",
    items: [
      "Owners must have the right to rent out the listed asset and must provide accurate titles, descriptions, photos, inclusions, availability, pricing, location, pickup instructions, condition details, and security deposit requirements.",
      "Owners authorize Lend to use and show listing information, including the pinned listing location, as needed to operate discovery, booking, handover, return, support, safety, report, and dispute workflows.",
      "Listings must not be misleading, unsafe, unlawful, counterfeit, stolen, restricted, or otherwise prohibited by Lend policy or applicable law.",
      "Owners are responsible for asset condition, cleanliness, safety, lawful use, required permits or licenses, and accurate disclosure of material limitations or risks.",
      "Owners are responsible for ensuring that they legally own or are authorized to rent the item/property, and for complying with all applicable taxes, permits, licenses, insurance, building rules, subdivision/condo rules, transport rules, LGU requirements, and other legal obligations. Lend may request additional documents depending on the listing category, transaction volume, earnings, risk level, or applicable requirements.",
      "Owners must honor confirmed bookings unless cancellation is allowed by Lend policy or required for safety, legal, or exceptional reasons.",
      "New listings and listing content edits may be reviewed by automated tools, AI-assisted moderation, and Lend admins before they become publicly visible.",
      "Lend may review, edit, reject, hide, archive, delete, rank, suppress from recommendations, or moderate listings to protect users, comply with law, or improve marketplace quality.",
    ],
  },
  {
    title: "Renters and bookings",
    items: [
      "Renters must review the listing, dates, price, security deposit, location, owner information, and applicable rules before booking.",
      "A booking is not confirmed until the required checkout flow succeeds and Lend records the booking as confirmed or booked.",
      "Once a booking is confirmed, Lend may show the renter and owner information reasonably needed to coordinate the rental, including names, phone numbers, listing or pickup location details, booking dates, chat access, and handover or return status.",
      "Renters must use the asset carefully, lawfully, and only for the agreed rental period and ordinary intended purpose unless the owner expressly agrees otherwise.",
      "Renters must complete required QR handover and return checkpoints, return the asset on time and in substantially the same condition, and cooperate with settlement or dispute review.",
      "Renters are responsible for loss, damage, late return, misuse, unlawful use, missing inclusions, or other violations to the extent allowed by applicable law and Lend policy.",
    ],
  },
  {
    title: "Payments, fees, payouts, and refunds",
    items: [
      "Payments are processed through supported providers such as PayMongo. Supported methods may include cards, GCash, Maya, GrabPay, ShopeePay, QR Ph, direct online banking, and other channels made available in the app.",
      "Lend may create temporary date locks during checkout. A lock does not guarantee a booking unless payment succeeds and the booking is confirmed.",
      "Prices, platform fees, payment method fees, wallet transfer fees, taxes, security deposits, refunds, and payout amounts may be calculated according to Lend policy, provider rules, and remote pricing configuration shown or applied at checkout.",
      "Owner funds are not released at payment time. Owner payout occurs only after the relevant completion, admin review, auto-completion, or settlement step is satisfied.",
      "Owners must maintain a valid payout destination before renters can pay for their listings. Renters may be required to maintain a valid deposit return destination before booking listings with security deposits.",
      "Renter cancellations for bookings made less than 24 hours before the rental starts may be non-refundable for the rental payment under Lend policy. Security deposits remain subject to deposit, settlement, damage, and dispute rules.",
      "Refunds, cancellations, reversals, failed payments, payout failures, and provider errors are subject to Lend policy, payment provider rules, and applicable law.",
    ],
  },
  {
    title: "Security deposits and damage deductions",
    body: (
      <p>
        Some listings may require a security deposit. Security deposits are intended to help cover approved loss,
        damage, missing items, late return, or other covered claims. Deposit collection, holding, deduction, and return
        may depend on PayMongo wallet payout capabilities, Lend settlement rules, and the information supplied by the
        owner and renter.
      </p>
    ),
    items: [
      "A renter must provide a valid deposit return destination where required before booking an asset with a security deposit.",
      "QR return only records that the asset was returned and moves the booking to post-return settlement. It does not automatically release owner payout or return the deposit.",
      "After return, the owner may complete the rental or request a damage deduction with requested amount, reason, notes, and evidence where supported.",
      "The renter may accept or dispute a requested deduction, but all damage deduction requests still require Lend admin review before money movement is finalized.",
      "Lend admins may approve the requested amount, approve an adjusted amount, reject the deduction, require more information, or take other reasonable action under Lend policy.",
      "Security deposits, damage requests, evidence review, verification, and admin decisions are not insurance and do not guarantee recovery for every lost, damaged, late-returned, misused, or missing item.",
    ],
  },
  {
    title: "Handover, return, chat, and records",
    items: [
      "QR handover and QR return checkpoints are compliance and status tools. Users must not share, forge, tamper with, or misuse QR tokens or booking checkpoints.",
      "Booking chats should be used for rental coordination, issue reporting, and booking-related communication. Users must not harass, threaten, spam, scam, or send unlawful or harmful content.",
      "Blocking another user limits future discovery, bookings, and contact, but it does not cancel or remove existing booking, payment, handover, return, settlement, cancellation, report, or dispute obligations. Required booking chats may remain available until the booking reaches a final status.",
      "Lend may store chat messages, system messages, lifecycle events, timestamps, reports, evidence, and admin actions to operate the booking flow, resolve disputes, enforce terms, and comply with law.",
    ],
  },
  {
    title: "Reviews, reports, and moderation",
    items: [
      "Reviews and ratings must reflect genuine experiences and must not be fraudulent, abusive, discriminatory, defamatory, retaliatory, or irrelevant.",
      "Users may report listings, chats, bookings, or other users. Reports should be truthful and supported by relevant details where possible.",
      "Blocking and reporting are separate actions. Blocking does not automatically submit a report, and users should separately report conduct that Lend should review.",
      "Lend may moderate, remove, hide, archive, restrict, suspend, ban, or take account or listing action when content or conduct violates these terms, creates risk, or may violate law.",
      "Lend Support review decisions are based on available platform records, user submissions, provider status, and Lend policy. Users must cooperate and provide accurate information during review.",
    ],
  },
  {
    title: "Prohibited conduct",
    items: [
      "Do not use Lend for illegal, unsafe, fraudulent, deceptive, abusive, discriminatory, harassing, infringing, or exploitative activity.",
      "Do not list stolen, counterfeit, hazardous, restricted, unlawful, recalled, or misrepresented items.",
      "Do not bypass Lend checkout, manipulate pricing, evade fees, interfere with payment or payout flows, or move confirmed marketplace transactions off-platform to avoid Lend rules.",
      "Do not scrape, reverse engineer, overload, attack, bypass security, misuse APIs, introduce malware, or interfere with Lend systems or other users.",
      "Do not submit false verification data, impersonate another person, create duplicate abusive accounts, or misrepresent ownership, identity, location, asset condition, or transaction facts.",
    ],
  },
  {
    title: "Third-party services",
    body: (
      <p>
        Lend depends on third-party services including Firebase and Google Cloud, Google Maps, PayMongo, verification
        providers such as Didit, app stores, and sign-in providers such as Apple, Google, or Facebook where enabled.
        These services may have their own terms, fees, limits, downtime, verification requirements, and privacy
        practices. Lend is not responsible for third-party service failures beyond what applicable law requires.
      </p>
    ),
  },
  {
    title: "User content and license",
    body: (
      <p>
        You retain ownership of content you submit, such as listing photos, descriptions, messages, reports, evidence,
        reviews, and profile content. You grant Lend a non-exclusive, worldwide, royalty-free license to host, store,
        reproduce, display, transmit, moderate, adapt for formatting, and use that content as needed to operate, secure,
        improve, market, and enforce the service. You represent that you have the rights needed to provide the content
        and that it does not violate law or another person&apos;s rights.
      </p>
    ),
  },
  {
    title: "Privacy",
    body: (
      <p>
        Lend handles personal data according to the Privacy Policy. The Privacy Policy explains what data we collect,
        why we use it, the third-party services involved, retention practices, security measures, and user rights. By
        using Lend, you acknowledge that marketplace operation requires processing account, listing, booking, payment,
        location, verification, chat, report, review, and technical data.
      </p>
    ),
  },
  {
    title: "Disclaimers and limits of liability",
    body: (
      <p>
        Lend is provided on an as-is and as-available basis to the fullest extent permitted by law. We do not guarantee
        that listings are accurate, assets are available, safe, lawful, undamaged, or suitable, users will perform as
        promised, payments or payouts will never fail, security deposits will cover every loss, or the service will be
        uninterrupted or error-free. To the fullest extent permitted by law, Lend will not be liable for indirect,
        incidental, special, consequential, exemplary, or punitive damages, lost profits, lost data, personal
        arrangements, off-platform transactions, user conduct, asset loss, asset damage, late return, missing
        inclusions, misuse, or ordinary marketplace risk. Nothing in these terms excludes liability that cannot be
        excluded under applicable law.
      </p>
    ),
  },
  {
    title: "Indemnity",
    body: (
      <p>
        To the extent permitted by law, you agree to defend, indemnify, and hold harmless Lend, its officers, directors,
        employees, contractors, service providers, and affiliates from claims, damages, losses, liabilities, costs, and
        expenses arising from your listings, bookings, assets, content, conduct, breach of these terms, violation of
        law, or violation of another person&apos;s rights.
      </p>
    ),
  },
  {
    title: "Changes, suspension, and termination",
    items: [
      "We may update these terms when the product, providers, law, pricing, risk controls, or business practices change.",
      "We may modify, suspend, discontinue, or limit parts of Lend at any time, subject to applicable law and existing confirmed booking obligations where relevant.",
      "You may stop using Lend or request account closure. Some records may be retained where needed for bookings, payments, disputes, legal obligations, security, fraud prevention, or legitimate records.",
      "Lend may suspend, restrict, or terminate access if you violate these terms, create risk, provide false information, fail verification, misuse the service, or if required by law or provider rules.",
    ],
  },
  {
    title: "Governing law and dispute handling",
    body: (
      <p>
        These terms are governed by the laws of <strong>[GOVERNING_LAW]</strong>, unless mandatory consumer protection
        or other applicable law provides otherwise. Before filing a formal claim, you agree to contact{" "}
        <strong>[SUPPORT_EMAIL]</strong> with enough information for us to investigate and attempt to resolve the issue.
        For unresolved disputes, venue, process, and escalation will follow applicable law and any final dispute policy
        published by Lend.
      </p>
    ),
  },
  {
    title: "Contact",
    body: (
      <p>
        Questions about these terms may be sent to <strong>[LEGAL_ENTITY_NAME]</strong> at{" "}
        <strong>[SUPPORT_EMAIL]</strong>, <strong>[PRIVACY_EMAIL]</strong>, or <strong>[DPO_CONTACT]</strong>.
      </p>
    ),
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalDocument
      description="These Terms and Conditions explain the rules for accounts, listings, bookings, payments, security deposits, handover and return, dispute review, moderation, and use of Lend."
      effectiveDate="[EFFECTIVE_DATE]"
      lastUpdated="June 9, 2026"
      sections={sections}
      title="Terms and Conditions"
    />
  );
}
