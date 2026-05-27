import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export type BookingStatus =
  | "Pending"
  | "Confirmed"
  | "HandedOver"
  | "Returned"
  | "Completed"
  | "Declined"
  | "Cancelled"
  | "Cancellation Requested"
  | string;

export const adminCancellationRequestStatuses = [
  "Pending",
  "Approved",
  "Rejected",
] as const;

export type AdminCancellationRequestStatus =
  (typeof adminCancellationRequestStatuses)[number];
export type AdminCancellationRequestStatusFilter =
  | "all"
  | AdminCancellationRequestStatus;

export type BookingPerson = {
  uid: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  email: string | null;
  phone: string | null;
};

export type AdminBooking = {
  id: string;
  assetId: string;
  chatId: string | null;
  asset: {
    id: string | null;
    title: string | null;
    category: string | null;
    owner: BookingPerson | null;
  } | null;
  createdAt: Date | null;
  startDate: Date | null;
  endDate: Date | null;
  numDays: number | null;
  payment: {
    amount: number | null;
    currency: string | null;
    method: string | null;
    details: Record<string, unknown>;
    rentalSubtotal: number | null;
    pricingBreakdown: Record<string, unknown>;
    transactionId: string | null;
    ownerPayoutAmount: number | null;
    refundStatus: string | null;
    refundError: string | null;
    refundAmount: number | null;
    refundType: string | null;
    paymongoRefundId: string | null;
  } | null;
  securityDeposit: {
    enabled: boolean;
    amount: number;
  };
  settlement: {
    status: string | null;
    depositStatus: string | null;
    renterResponse: string | null;
    approvedDamageDeductionAmount: number | null;
    depositCoveredDamageAmount: number | null;
    outstandingDamageAmount: number | null;
    depositReturnAmount: number | null;
    ownerPayoutAmount: number | null;
    supportStatus: string | null;
    renterSupportChatId: string | null;
    ownerSupportChatId: string | null;
    damageBalancePaymentStatus: string | null;
    damageBalancePaymentRequestId: string | null;
    damageBalanceRequestedAmount: number | null;
    ownerDamageBalancePayoutStatus: string | null;
  } | null;
  damageDeductionRequest: {
    requestedAmount: number | null;
    approvedAmount: number | null;
    reason: string | null;
    notes: string | null;
    evidenceUrls: string[];
    requiresSupportReview: boolean;
    overDepositRequested: boolean;
    renterResponse: string | null;
    status: string | null;
    adminNotes: string | null;
    renterSupportChatId: string | null;
    ownerSupportChatId: string | null;
  } | null;
  cancellationRequest: {
    status: string | null;
    reason: string | null;
    previousStatus: string | null;
    requestedBy: string | null;
    requestedByRole: string | null;
    requestedAt: Date | null;
    reviewedBy: string | null;
    reviewedAt: Date | null;
    adminNotes: string | null;
    refundStatus: string | null;
    refundError: string | null;
    ownerPenaltyPreview: {
      penaltyRate: number | null;
      penaltyBaseAmount: number | null;
      penaltyAmount: number | null;
      remainingAmount: number | null;
      currency: string | null;
      listingStatusAfterApproval: string | null;
    } | null;
    ownerPenalty: {
      penaltyRate: number | null;
      penaltyBaseAmount: number | null;
      penaltyAmount: number | null;
      remainingAmount: number | null;
      currency: string | null;
      listingStatusAfterApproval: string | null;
    } | null;
    renterPenaltyPreview: {
      tier: string | null;
      refundBaseAmount: number | null;
      rentalRefundAmount: number | null;
      securityDepositRefundAmount: number | null;
      totalRefundableAmount: number | null;
      refundAmount: number | null;
      retainedOwnerAmount: number | null;
      manualSecurityDepositRefundAmount: number | null;
      shortLeadNoRefund: boolean | null;
      suggestedRefundType: string | null;
      currency: string | null;
      fullRefundWindowLabel: string | null;
      noRefundWindowLabel: string | null;
    } | null;
    renterPenalty: {
      tier: string | null;
      refundBaseAmount: number | null;
      rentalRefundAmount: number | null;
      securityDepositRefundAmount: number | null;
      totalRefundableAmount: number | null;
      refundAmount: number | null;
      retainedOwnerAmount: number | null;
      manualSecurityDepositRefundAmount: number | null;
      shortLeadNoRefund: boolean | null;
      suggestedRefundType: string | null;
      currency: string | null;
      fullRefundWindowLabel: string | null;
      noRefundWindowLabel: string | null;
    } | null;
  } | null;
  renter: BookingPerson | null;
  status: BookingStatus | null;
  totalPrice: number | null;
};

export type AdminBookingMessage = {
  id: string;
  createdAt: Date | null;
  mediaUrl: string | null;
  senderId: string | null;
  text: string | null;
  type: string | null;
};

export const damageSupportStatuses = [
  "pending",
  "in_progress",
  "resolved",
  "closed",
] as const;

export type DamageSupportStatus = (typeof damageSupportStatuses)[number];

export const damageSupportChatTargets = ["renter", "owner"] as const;

export type DamageSupportChatTarget = (typeof damageSupportChatTargets)[number];

export const damageReviewDecisions = [
  "approve_full",
  "approve_adjusted",
  "reject",
] as const;

export type DamageReviewDecision = (typeof damageReviewDecisions)[number];

export const bookingStatuses = [
  "Pending",
  "Confirmed",
  "HandedOver",
  "Returned",
  "Completed",
  "Declined",
  "Cancelled",
  "Cancellation Requested",
] as const;

export function mapAdminBooking({
  assetId,
  snapshot,
}: {
  assetId: string;
  snapshot: QueryDocumentSnapshot<DocumentData>;
}): AdminBooking {
  const data = snapshot.data();
  const asset = asRecord(data.asset);
  const payment = asRecord(data.payment);
  const cancellationRequest = asRecord(data.cancellationRequest);
  const securityDeposit = asRecord(data.securityDeposit);
  const settlement = asRecord(data.settlement);
  const damageDeductionRequest = asRecord(data.damageDeductionRequest);

  return {
    id: asString(data.id) ?? snapshot.id,
    assetId: asString(asset?.id) ?? assetId,
    chatId: asString(data.chatId),
    asset: asset
      ? {
          id: asString(asset.id) ?? assetId,
          title: asString(asset.title),
          category: asString(asset.category),
          owner: mapBookingPerson(asset.owner),
        }
      : null,
    createdAt: toDate(data.createdAt),
    startDate: toDate(data.startDate),
    endDate: toDate(data.endDate),
    numDays: asNumber(data.numDays),
    payment: payment
      ? {
          amount: asNumber(payment.amount),
          currency: asString(payment.currency),
          method: asString(payment.method),
          details: asRecord(payment.details) ?? {},
          rentalSubtotal: asNumber(payment.rentalSubtotal),
          pricingBreakdown: asRecord(payment.pricingBreakdown) ?? {},
          transactionId: asString(payment.transactionId),
          ownerPayoutAmount: asNumber(payment.ownerPayoutAmount),
          refundStatus: asString(payment.refundStatus),
          refundError: asString(payment.refundError),
          refundAmount: asNumber(payment.refundAmount),
          refundType: asString(payment.refundType),
          paymongoRefundId: asString(payment.paymongoRefundId),
        }
      : null,
    cancellationRequest: cancellationRequest
      ? {
          status: asString(cancellationRequest.status),
          reason: asString(cancellationRequest.reason),
          previousStatus: asString(cancellationRequest.previousStatus),
          requestedBy: asString(cancellationRequest.requestedBy),
          requestedByRole: asString(cancellationRequest.requestedByRole),
          requestedAt: toDate(cancellationRequest.requestedAt),
          reviewedBy: asString(cancellationRequest.reviewedBy),
          reviewedAt: toDate(cancellationRequest.reviewedAt),
          adminNotes: asString(cancellationRequest.adminNotes),
          refundStatus: asString(cancellationRequest.refundStatus),
          refundError: asString(cancellationRequest.refundError),
          ownerPenaltyPreview: mapOwnerPenaltyPreview(cancellationRequest.ownerPenaltyPreview),
          ownerPenalty: mapOwnerPenaltyPreview(cancellationRequest.ownerPenalty),
          renterPenaltyPreview: mapRenterPenaltyPreview(cancellationRequest.renterPenaltyPreview),
          renterPenalty: mapRenterPenaltyPreview(cancellationRequest.renterPenalty),
        }
      : null,
    securityDeposit: {
      enabled: securityDeposit?.enabled === true,
      amount: asNumber(securityDeposit?.amount) ?? 0,
    },
    settlement: settlement
      ? {
          status: asString(settlement.status),
          depositStatus: asString(settlement.depositStatus),
          renterResponse: asString(settlement.renterResponse),
          approvedDamageDeductionAmount: asNumber(
            settlement.approvedDamageDeductionAmount,
          ),
          depositCoveredDamageAmount: asNumber(
            settlement.depositCoveredDamageAmount,
          ),
          outstandingDamageAmount: asNumber(settlement.outstandingDamageAmount),
          depositReturnAmount: asNumber(settlement.depositReturnAmount),
          ownerPayoutAmount: asNumber(settlement.ownerPayoutAmount),
          supportStatus: asString(settlement.supportStatus),
          renterSupportChatId: asString(settlement.renterSupportChatId),
          ownerSupportChatId: asString(settlement.ownerSupportChatId),
          damageBalancePaymentStatus: asString(
            settlement.damageBalancePaymentStatus,
          ),
          damageBalancePaymentRequestId: asString(
            settlement.damageBalancePaymentRequestId,
          ),
          damageBalanceRequestedAmount: asNumber(
            settlement.damageBalanceRequestedAmount,
          ),
          ownerDamageBalancePayoutStatus: asString(
            settlement.ownerDamageBalancePayoutStatus,
          ),
        }
      : null,
    damageDeductionRequest: damageDeductionRequest
      ? {
          requestedAmount: asNumber(damageDeductionRequest.requestedAmount),
          approvedAmount: asNumber(damageDeductionRequest.approvedAmount),
          reason: asString(damageDeductionRequest.reason),
          notes: asString(damageDeductionRequest.notes),
          evidenceUrls: asStringArray(damageDeductionRequest.evidenceUrls),
          requiresSupportReview:
            damageDeductionRequest.requiresSupportReview === true,
          overDepositRequested:
            damageDeductionRequest.overDepositRequested === true,
          renterResponse: asString(damageDeductionRequest.renterResponse),
          status: asString(damageDeductionRequest.status),
          adminNotes: asString(damageDeductionRequest.adminNotes),
          renterSupportChatId: asString(
            damageDeductionRequest.renterSupportChatId,
          ),
          ownerSupportChatId: asString(
            damageDeductionRequest.ownerSupportChatId,
          ),
        }
      : null,
    renter: mapBookingPerson(data.renter),
    status: asString(data.status),
    totalPrice: asNumber(data.totalPrice),
  };
}

function mapRenterPenaltyPreview(
  value: unknown,
): NonNullable<AdminBooking["cancellationRequest"]>["renterPenaltyPreview"] {
  const data = asRecord(value);
  if (!data) return null;
  return {
    tier: asString(data.tier),
    refundBaseAmount: asNumber(data.refundBaseAmount),
    rentalRefundAmount: asNumber(data.rentalRefundAmount),
    securityDepositRefundAmount: asNumber(data.securityDepositRefundAmount),
    totalRefundableAmount: asNumber(data.totalRefundableAmount),
    refundAmount: asNumber(data.refundAmount),
    retainedOwnerAmount: asNumber(data.retainedOwnerAmount),
    manualSecurityDepositRefundAmount: asNumber(data.manualSecurityDepositRefundAmount),
    shortLeadNoRefund: asBoolean(data.shortLeadNoRefund),
    suggestedRefundType: asString(data.suggestedRefundType),
    currency: asString(data.currency),
    fullRefundWindowLabel: asString(data.fullRefundWindowLabel),
    noRefundWindowLabel: asString(data.noRefundWindowLabel),
  };
}

function mapOwnerPenaltyPreview(
  value: unknown,
): NonNullable<AdminBooking["cancellationRequest"]>["ownerPenaltyPreview"] {
  const data = asRecord(value);
  if (!data) return null;
  return {
    penaltyRate: asNumber(data.penaltyRate),
    penaltyBaseAmount: asNumber(data.penaltyBaseAmount),
    penaltyAmount: asNumber(data.penaltyAmount),
    remainingAmount: asNumber(data.remainingAmount),
    currency: asString(data.currency),
    listingStatusAfterApproval: asString(data.listingStatusAfterApproval),
  };
}

export function mapAdminBookingMessage(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): AdminBookingMessage {
  const data = snapshot.data();

  return {
    id: asString(data.id) ?? snapshot.id,
    createdAt: toDate(data.createdAt),
    mediaUrl: asString(data.mediaUrl),
    senderId: asString(data.senderId),
    text: asString(data.text),
    type: asString(data.type),
  };
}

export function getBookingAssetTitle(booking: AdminBooking) {
  return booking.asset?.title ?? booking.asset?.id ?? booking.assetId;
}

export function getBookingOwnerName(booking: AdminBooking) {
  return getPersonName(booking.asset?.owner, "No owner");
}

export function getBookingRenterName(booking: AdminBooking) {
  return getPersonName(booking.renter, "No renter");
}

export function getBookingOwnerId(booking: AdminBooking) {
  return booking.asset?.owner?.uid ?? null;
}

export function getBookingRenterId(booking: AdminBooking) {
  return booking.renter?.uid ?? null;
}

export function buildBookingSearchText(booking: AdminBooking) {
  return [
    booking.id,
    booking.assetId,
    getBookingAssetTitle(booking),
    getBookingOwnerName(booking),
    getBookingRenterName(booking),
    booking.status,
    formatBookingMoney(booking.totalPrice),
    booking.chatId,
  ]
    .filter(Boolean)
    .join(" ");
}

export function isPendingDamageBooking(booking: AdminBooking) {
  return (
    booking.settlement?.status === "support_pending" ||
    booking.settlement?.status === "admin_review_required" ||
    ["pending", "in_progress"].includes(booking.settlement?.supportStatus ?? "")
  );
}

export function isCompletedDamageBooking(booking: AdminBooking) {
  return (
    booking.settlement?.status === "completed" ||
    booking.damageDeductionRequest?.status === "resolved" ||
    ["resolved", "closed"].includes(booking.settlement?.supportStatus ?? "")
  );
}

export function isDamageFeeBooking(booking: AdminBooking) {
  return isPendingDamageBooking(booking) || isCompletedDamageBooking(booking);
}

export function formatBookingDate(value: Date | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
    year: "numeric",
  }).format(value);
}

export function formatBookingDateTime(value: Date | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function formatBookingMoney(value: number | null, currency = "PHP") {
  if (value == null) {
    return "Not set";
  }

  return `${currency || "PHP"} ${formatExactNumber(value)}`;
}

export function formatExactNumber(value: number | null) {
  if (value == null) {
    return "Not set";
  }

  if (!Number.isFinite(value)) {
    return "Not set";
  }

  return addGrouping(toPlainNumberString(value));
}

function getPersonName(person: BookingPerson | null | undefined, fallback: string) {
  if (!person) {
    return fallback;
  }

  if (person.displayName) {
    return person.displayName;
  }

  const name = [person.firstName, person.lastName].filter(Boolean).join(" ").trim();
  return name || person.email || person.uid || fallback;
}

function mapBookingPerson(value: unknown): BookingPerson | null {
  const person = asRecord(value);
  if (!person) {
    return null;
  }

  return {
    uid: asString(person.uid),
    firstName: asString(person.firstName),
    lastName: asString(person.lastName),
    displayName: asString(person.displayName),
    email: asString(person.email),
    phone: asString(person.phone),
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function toPlainNumberString(value: number) {
  const stringValue = String(value);
  if (!/[eE]/.test(stringValue)) {
    return stringValue;
  }

  const [coefficient, exponentValue] = stringValue.toLowerCase().split("e");
  const exponent = Number(exponentValue);
  if (!Number.isInteger(exponent)) return stringValue;

  const negative = coefficient.startsWith("-");
  const unsigned = negative ? coefficient.slice(1) : coefficient;
  const [integerPart, fractionPart = ""] = unsigned.split(".");
  const digits = `${integerPart}${fractionPart}`;
  const decimalIndex = integerPart.length + exponent;

  if (decimalIndex <= 0) {
    return `${negative ? "-" : ""}0.${"0".repeat(Math.abs(decimalIndex))}${digits}`;
  }

  if (decimalIndex >= digits.length) {
    return `${negative ? "-" : ""}${digits}${"0".repeat(decimalIndex - digits.length)}`;
  }

  return `${negative ? "-" : ""}${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;
}

function addGrouping(value: string) {
  const negative = value.startsWith("-");
  const unsigned = negative ? value.slice(1) : value;
  const [integerPart, fractionPart] = unsigned.split(".");
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}${groupedInteger}${fractionPart != null ? `.${fractionPart}` : ""}`;
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
