import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export type AccountFeedbackAction = "disable" | "delete" | string;

export type AccountFeedback = {
  id: string;
  action: AccountFeedbackAction;
  reason: string | null;
  feedback: string | null;
  createdAt: Date | null;
};

export function mapAccountFeedback(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): AccountFeedback {
  const data = snapshot.data();

  return {
    id: asString(data.id) ?? snapshot.id,
    action: asString(data.action) ?? "unknown",
    reason: asString(data.reason),
    feedback: asString(data.feedback),
    createdAt: toDate(data.createdAt),
  };
}

export function buildAccountFeedbackSearchText(feedback: AccountFeedback) {
  return [
    feedback.id,
    feedback.action,
    feedback.reason,
    feedback.feedback,
    formatAccountFeedbackDate(feedback.createdAt),
  ]
    .filter(Boolean)
    .join(" ");
}

export function formatAccountFeedbackAction(action: AccountFeedbackAction) {
  if (action === "disable") {
    return "Disable";
  }

  if (action === "delete") {
    return "Delete";
  }

  return action;
}

export function formatAccountFeedbackDate(value: Date | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
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
