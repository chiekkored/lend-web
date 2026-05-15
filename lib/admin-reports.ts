import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export type ReportStatus = "Pending" | "Done";

export type AdminReportSection = "users" | "listings" | "messages" | "other";

export type AdminReport = {
  id: string;
  reporterId: string | null;
  reportedUserId: string | null;
  reportType: string | null;
  reason: string | null;
  details: string | null;
  chatId: string | null;
  bookingId: string | null;
  assetId: string | null;
  archiveRequested: boolean;
  bookingCancelRequested: boolean;
  createdAt: Date | null;
  rawStatus: string | null;
  status: ReportStatus;
};

export const reportStatuses = ["Pending", "Done"] as const;

export const reportSectionContent: Record<
  AdminReportSection,
  { title: string; description: string }
> = {
  users: {
    title: "User Reports",
    description: "Review account, profile, and participant reports.",
  },
  listings: {
    title: "Listing Reports",
    description: "Review asset and listing reports from renters and owners.",
  },
  messages: {
    title: "Message Reports",
    description: "Review reports connected to chats and messages.",
  },
  other: {
    title: "Other Reports",
    description: "Review reports that are not linked to users, listings, or messages.",
  },
};

export function isAdminReportSection(value: string): value is AdminReportSection {
  return value in reportSectionContent;
}

export function mapAdminReport(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): AdminReport {
  const data = snapshot.data();
  const rawStatus = asString(data.status);

  return {
    id: asString(data.id) ?? snapshot.id,
    reporterId: asString(data.reporterId),
    reportedUserId: asString(data.reportedUserId),
    reportType: asString(data.reportType),
    reason: asString(data.reason),
    details: asString(data.details),
    chatId: asString(data.chatId),
    bookingId: asString(data.bookingId),
    assetId: asString(data.assetId),
    archiveRequested: data.archiveRequested === true,
    bookingCancelRequested: data.bookingCancelRequested === true,
    createdAt: toDate(data.createdAt),
    rawStatus,
    status: normalizeReportStatus(rawStatus),
  };
}

export function filterReportsBySection(
  reports: AdminReport[],
  section: AdminReportSection,
) {
  return reports.filter((report) => getReportSection(report) === section);
}

export function getReportSection(report: AdminReport): AdminReportSection {
  const reportType = report.reportType?.toLowerCase() ?? "";

  if (reportType === "user") {
    return "users";
  }

  if (report.chatId || reportType.includes("message") || reportType.includes("chat")) {
    return "messages";
  }

  if (report.assetId || reportType.includes("listing") || reportType.includes("asset")) {
    return "listings";
  }

  return "other";
}

export function buildReportSearchText(report: AdminReport) {
  return [
    report.id,
    report.reportType,
    report.reason,
    report.details,
    report.reporterId,
    report.reportedUserId,
    report.chatId,
    report.bookingId,
    report.assetId,
    report.status,
  ]
    .filter(Boolean)
    .join(" ");
}

export function formatReportDate(value: Date | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function normalizeReportStatus(value: string | null): ReportStatus {
  return value?.toLowerCase() === "done" ? "Done" : "Pending";
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function toDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "_seconds" in value &&
    typeof value._seconds === "number"
  ) {
    return new Date(value._seconds * 1000);
  }

  return null;
}
