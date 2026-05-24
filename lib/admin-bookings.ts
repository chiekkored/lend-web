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
    method: string | null;
    details: Record<string, unknown>;
    transactionId: string | null;
    ownerPayoutAmount: number | null;
    refundStatus: string | null;
    refundError: string | null;
    refundAmount: number | null;
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
    requestedAt: Date | null;
    reviewedBy: string | null;
    reviewedAt: Date | null;
    adminNotes: string | null;
    refundStatus: string | null;
    refundError: string | null;
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
          method: asString(payment.method),
          details: asRecord(payment.details) ?? {},
          transactionId: asString(payment.transactionId),
          ownerPayoutAmount: asNumber(payment.ownerPayoutAmount),
          refundStatus: asString(payment.refundStatus),
          refundError: asString(payment.refundError),
          refundAmount: asNumber(payment.refundAmount),
          paymongoRefundId: asString(payment.paymongoRefundId),
        }
      : null,
    cancellationRequest: cancellationRequest
      ? {
          status: asString(cancellationRequest.status),
          reason: asString(cancellationRequest.reason),
          previousStatus: asString(cancellationRequest.previousStatus),
          requestedBy: asString(cancellationRequest.requestedBy),
          requestedAt: toDate(cancellationRequest.requestedAt),
          reviewedBy: asString(cancellationRequest.reviewedBy),
          reviewedAt: toDate(cancellationRequest.reviewedAt),
          adminNotes: asString(cancellationRequest.adminNotes),
          refundStatus: asString(cancellationRequest.refundStatus),
          refundError: asString(cancellationRequest.refundError),
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

export function formatBookingMoney(value: number | null) {
  if (value == null) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
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
