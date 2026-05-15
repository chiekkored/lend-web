import { Badge, type BadgeProps } from "@/components/ui/badge";

const successStatuses = new Set([
  "Active",
  "Approved",
  "Available",
  "Completed",
  "Confirmed",
  "Done",
  "HandedOver",
  "Healthy",
  "Resolved",
  "Returned",
  "Improving",
  "Basic",
  "Full",
]);
const warningStatuses = new Set([
  "Open",
  "Pending",
  "Reported",
  "Under Maintenance",
  "Under Review",
]);
const dangerStatuses = new Set([
  "Cancelled",
  "Critical",
  "Declined",
  "Disputed",
  "Rejected",
  "Suspended",
  "None",
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

  return <Badge variant={variant}>{value}</Badge>;
}
