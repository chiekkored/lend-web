import { Badge, type BadgeProps } from "@/components/ui/badge";

const successStatuses = new Set([
  "Active",
  "Approved",
  "Available",
  "Completed",
  "completed",
  "Confirmed",
  "Done",
  "HandedOver",
  "Healthy",
  "Resolved",
  "resolved",
  "Returned",
  "Improving",
  "Basic",
  "Full",
  "paid",
  "succeeded",
  "closed",
]);
const warningStatuses = new Set([
  "Open",
  "Pending",
  "pending",
  "Cancellation Requested",
  "Reported",
  "Under Maintenance",
  "Under Review",
  "admin_review_required",
  "support_pending",
  "damage_deduction_requested",
  "in_progress",
  "requested",
  "awaiting_renter_response",
  "processing",
]);
const dangerStatuses = new Set([
  "Cancelled",
  "Critical",
  "Declined",
  "Disputed",
  "disputed",
  "Rejected",
  "rejected",
  "Suspended",
  "None",
  "failed",
  "error",
]);

export function isStatusValue(value: string) {
  return (
    successStatuses.has(value) ||
    warningStatuses.has(value) ||
    dangerStatuses.has(value) ||
    value === "Banned" ||
    value === "Archived" ||
    value === "Hidden" ||
    value === "Verified"
  );
}

export function StatusBadge({ value }: { value: string }) {
  let variant: BadgeProps["variant"] = "neutral";

  if (successStatuses.has(value)) {
    variant = "success";
  } else if (warningStatuses.has(value)) {
    variant = "warning";
  } else if (dangerStatuses.has(value)) {
    variant = "destructive";
  }

  return <Badge variant={variant}>{formatStatusLabel(value)}</Badge>;
}

function formatStatusLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
