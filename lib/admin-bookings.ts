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
    categoryName: string | null;
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
  paymentFlow: {
    amount: number | null;
    checkoutId: string | null;
    currency: string | null;
    method: string | null;
    methodDetails: Record<string, unknown>;
    paymongoPaymentId: string | null;
    paymongoPaymentIntentId: string | null;
    provider: string | null;
    refundAmount: number | null;
    refundError: string | null;
    refundStatus: string | null;
    refundType: string | null;
    transactionId: string | null;
  } | null;
  priceBreakdown: {
    rentalSubtotal: number | null;
    securityDepositAmount: number | null;
    renterPlatformFee: number | null;
    renterProcessingFee: number | null;
    paymentAmount: number | null;
    ownerProcessingFee: number | null;
    ownerPayoutAmount: number | null;
    ownerPayoutTransferFee: number | null;
    renterDepositReturnTransferFee: number | null;
    securityDepositCollectionProcessingFee: number | null;
    currency: string | null;
  };
  depositFlow: {
    amount: number;
    approvedDeductionAmount: number | null;
    depositCoveredAmount: number | null;
    depositReturnAmount: number | null;
    required: boolean;
    requestedDeductionAmount: number | null;
    renterResponse: string | null;
    status: string | null;
  } | null;
  disputeFlow: {
    adminNotes: string | null;
    approvedAmount: number | null;
    depositCoveredAmount: number | null;
    evidenceUrls: string[];
    notes: string | null;
    outstandingAmount: number | null;
    outstandingPaymentRequestId: string | null;
    outstandingPaymentStatus: string | null;
    paidOutstandingAmount: number | null;
    reason: string | null;
    remainingSecurityDeposit: number | null;
    renterResponse: string | null;
    renterSupportChatId: string | null;
    ownerSupportChatId: string | null;
    requestedAmount: number | null;
    status: string | null;
    supportStatus: string | null;
  } | null;
  payoutFlow: {
    depositReturnAmount: number | null;
    depositReturnStatus: string | null;
    ownerPayoutAmount: number | null;
    ownerPayoutError: string | null;
    ownerPayoutGrossAmount: number | null;
    ownerPayoutStatus: string | null;
    ownerPayoutTransferFee: number | null;
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
  const paymentFlow = asRecord(data.paymentFlow);
  const priceBreakdown = asRecord(data.priceBreakdown);
  const depositFlow = asRecord(data.depositFlow);
  const disputeFlow = asRecord(data.disputeFlow);
  const payoutFlow = asRecord(data.payoutFlow);
  const cancellationRequest = asRecord(data.cancellationRequest);
  const securityDeposit = asRecord(data.securityDeposit);
  const settlement = asRecord(data.settlement);
  const damageDeductionRequest = asRecord(data.damageDeductionRequest);
  const mappedPaymentFlow = mapPaymentFlow(paymentFlow, payment);
  const mappedPriceBreakdown = mapPriceBreakdown(priceBreakdown, payment);
  const mappedDepositFlow = mapDepositFlow(depositFlow, securityDeposit);
  const mappedDisputeFlow = mapDisputeFlow(disputeFlow, damageDeductionRequest, settlement);
  const mappedPayoutFlow = mapPayoutFlow(payoutFlow, settlement, payment);
  const bookingStatus = asString(data.status);
  const isCompletedBooking = bookingStatus?.toLowerCase() === "completed";
  const isResolvedDamageCase =
    isCompletedBooking ||
    mappedDisputeFlow?.status === "resolved" ||
    asString(damageDeductionRequest?.status) === "resolved" ||
    asString(settlement?.status)?.toLowerCase() === "completed";
  const resolvedDamageOutstandingAmount = mappedDisputeFlow?.outstandingAmount ?? 0;
  const hasDamageBalance =
    (mappedDisputeFlow?.paidOutstandingAmount ?? 0) > 0 || (!isResolvedDamageCase && resolvedDamageOutstandingAmount > 0);
  const mappedDamageBalancePaymentStatus =
    mappedDisputeFlow?.outstandingPaymentStatus === "paid"
      ? "paid"
      : asString(settlement?.damageBalancePaymentStatus) ?? mappedDisputeFlow?.outstandingPaymentStatus ?? null;

  return {
    id: asString(data.id) ?? snapshot.id,
    assetId: asString(asset?.id) ?? assetId,
    chatId: asString(data.chatId),
    asset: asset
      ? {
          id: asString(asset.id) ?? assetId,
          title: asString(asset.title),
          categoryName: asString(asset.categoryName),
          owner: mapBookingPerson(asset.owner),
        }
      : null,
    createdAt: toDate(data.createdAt),
    startDate: toDate(data.startDate),
    endDate: toDate(data.endDate),
    numDays: asNumber(data.numDays),
    payment: payment || paymentFlow
      ? {
          amount: asNumber(payment?.amount) ?? mappedPaymentFlow?.amount ?? null,
          currency: asString(payment?.currency) ?? mappedPaymentFlow?.currency ?? null,
          method: asString(payment?.method) ?? mappedPaymentFlow?.method ?? null,
          details: asRecord(payment?.details) ?? mappedPaymentFlow?.methodDetails ?? {},
          rentalSubtotal: asNumber(payment?.rentalSubtotal) ?? mappedPriceBreakdown.rentalSubtotal,
          pricingBreakdown: asRecord(payment?.pricingBreakdown) ?? priceBreakdown ?? {},
          transactionId: asString(payment?.transactionId) ?? mappedPaymentFlow?.transactionId ?? null,
          ownerPayoutAmount: asNumber(payment?.ownerPayoutAmount) ?? mappedPriceBreakdown.ownerPayoutAmount,
          refundStatus: asString(payment?.refundStatus) ?? mappedPaymentFlow?.refundStatus ?? null,
          refundError: asString(payment?.refundError) ?? mappedPaymentFlow?.refundError ?? null,
          refundAmount: asNumber(payment?.refundAmount) ?? mappedPaymentFlow?.refundAmount ?? null,
          refundType: asString(payment?.refundType) ?? mappedPaymentFlow?.refundType ?? null,
          paymongoRefundId: asString(payment?.paymongoRefundId),
        }
      : null,
    paymentFlow: mappedPaymentFlow,
    priceBreakdown: mappedPriceBreakdown,
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
      enabled: mappedDepositFlow?.required ?? securityDeposit?.enabled === true,
      amount: mappedDepositFlow?.amount ?? asNumber(securityDeposit?.amount) ?? 0,
    },
    depositFlow: mappedDepositFlow,
    disputeFlow: mappedDisputeFlow,
    payoutFlow: mappedPayoutFlow,
    settlement: settlement || depositFlow || disputeFlow || payoutFlow
      ? {
          status: isResolvedDamageCase
            ? "completed"
            : asString(settlement?.status) ?? mappedDisputeFlow?.status ?? mappedDepositFlow?.status ?? null,
          depositStatus: asString(settlement?.depositStatus) ?? mappedDepositFlow?.status ?? null,
          renterResponse: asString(settlement?.renterResponse) ?? mappedDisputeFlow?.renterResponse ?? null,
          approvedDamageDeductionAmount: asNumber(
            settlement?.approvedDamageDeductionAmount,
          ) ?? mappedDisputeFlow?.approvedAmount ?? mappedDepositFlow?.approvedDeductionAmount ?? null,
          depositCoveredDamageAmount: asNumber(
            settlement?.depositCoveredDamageAmount,
          ) ?? mappedDisputeFlow?.depositCoveredAmount ?? null,
          outstandingDamageAmount: asNumber(settlement?.outstandingDamageAmount) ?? mappedDisputeFlow?.outstandingAmount ?? null,
          depositReturnAmount: asNumber(settlement?.depositReturnAmount) ?? mappedDepositFlow?.depositReturnAmount ?? mappedPayoutFlow?.depositReturnAmount ?? null,
          ownerPayoutAmount: asNumber(settlement?.ownerPayoutAmount) ?? mappedPayoutFlow?.ownerPayoutAmount ?? null,
          supportStatus: isResolvedDamageCase
            ? "resolved"
            : asString(settlement?.supportStatus) ?? mappedDisputeFlow?.supportStatus ?? null,
          renterSupportChatId: asString(settlement?.renterSupportChatId) ?? mappedDisputeFlow?.renterSupportChatId ?? null,
          ownerSupportChatId: asString(settlement?.ownerSupportChatId) ?? mappedDisputeFlow?.ownerSupportChatId ?? null,
          damageBalancePaymentStatus:
            isResolvedDamageCase && !hasDamageBalance
              ? null
              : mappedDamageBalancePaymentStatus,
          damageBalancePaymentRequestId: asString(
            settlement?.damageBalancePaymentRequestId,
          ) ?? mappedDisputeFlow?.outstandingPaymentRequestId ?? null,
          damageBalanceRequestedAmount:
            isResolvedDamageCase && !hasDamageBalance
              ? null
              : asNumber(settlement?.damageBalanceRequestedAmount) ?? mappedDisputeFlow?.outstandingAmount ?? null,
          ownerDamageBalancePayoutStatus:
            isResolvedDamageCase && !hasDamageBalance
              ? null
              : asString(settlement?.ownerDamageBalancePayoutStatus) ??
                (hasDamageBalance ? mappedPayoutFlow?.ownerPayoutStatus : null) ??
                null,
        }
      : null,
    damageDeductionRequest: damageDeductionRequest || disputeFlow
      ? {
          requestedAmount: asNumber(damageDeductionRequest?.requestedAmount) ?? mappedDisputeFlow?.requestedAmount ?? null,
          approvedAmount: asNumber(damageDeductionRequest?.approvedAmount) ?? mappedDisputeFlow?.approvedAmount ?? null,
          reason: asString(damageDeductionRequest?.reason) ?? mappedDisputeFlow?.reason ?? null,
          notes: asString(damageDeductionRequest?.notes) ?? mappedDisputeFlow?.notes ?? null,
          evidenceUrls: asStringArray(damageDeductionRequest?.evidenceUrls ?? mappedDisputeFlow?.evidenceUrls),
          requiresSupportReview:
            damageDeductionRequest?.requiresSupportReview === true || (mappedDisputeFlow?.outstandingAmount ?? 0) > 0,
          overDepositRequested:
            damageDeductionRequest?.overDepositRequested === true || (mappedDisputeFlow?.outstandingAmount ?? 0) > 0,
          renterResponse: asString(damageDeductionRequest?.renterResponse) ?? mappedDisputeFlow?.renterResponse ?? null,
          status: isResolvedDamageCase
            ? "resolved"
            : asString(damageDeductionRequest?.status) ?? mappedDisputeFlow?.status ?? null,
          adminNotes: asString(damageDeductionRequest?.adminNotes) ?? mappedDisputeFlow?.adminNotes ?? null,
          renterSupportChatId: asString(
            damageDeductionRequest?.renterSupportChatId,
          ) ?? mappedDisputeFlow?.renterSupportChatId ?? null,
          ownerSupportChatId: asString(
            damageDeductionRequest?.ownerSupportChatId,
          ) ?? mappedDisputeFlow?.ownerSupportChatId ?? null,
        }
      : null,
    renter: mapBookingPerson(data.renter),
    status: bookingStatus,
    totalPrice: asNumber(data.totalPrice),
  };
}

function mapPaymentFlow(
  value: unknown,
  legacyPayment?: Record<string, unknown> | null,
): AdminBooking["paymentFlow"] {
  const data = asRecord(value);
  if (!data && !legacyPayment) return null;
  return {
    amount: asNumber(data?.amount) ?? asNumber(legacyPayment?.amount),
    checkoutId: asString(data?.checkoutId) ?? asString(legacyPayment?.checkoutId),
    currency: asString(data?.currency) ?? asString(legacyPayment?.currency),
    method: asString(data?.method) ?? asString(legacyPayment?.method),
    methodDetails:
      asRecord(data?.methodDetails) ?? asRecord(legacyPayment?.details) ?? {},
    paymongoPaymentId:
      asString(data?.paymongoPaymentId) ?? asString(legacyPayment?.paymongoPaymentId),
    paymongoPaymentIntentId:
      asString(data?.paymongoPaymentIntentId) ??
      asString(legacyPayment?.paymongoPaymentIntentId),
    provider: asString(data?.provider) ?? asString(legacyPayment?.provider),
    refundAmount: asNumber(data?.refundAmount) ?? asNumber(legacyPayment?.refundAmount),
    refundError: asString(data?.refundError) ?? asString(legacyPayment?.refundError),
    refundStatus:
      asString(data?.refundStatus) ?? asString(legacyPayment?.refundStatus),
    refundType: asString(data?.refundType) ?? asString(legacyPayment?.refundType),
    transactionId:
      asString(data?.transactionId) ?? asString(legacyPayment?.transactionId),
  };
}

function mapPriceBreakdown(
  value: unknown,
  legacyPayment?: Record<string, unknown> | null,
): AdminBooking["priceBreakdown"] {
  const data = asRecord(value) ?? asRecord(legacyPayment?.pricingBreakdown);
  return {
    rentalSubtotal:
      asNumber(data?.rentalSubtotal) ?? asNumber(legacyPayment?.rentalSubtotal),
    securityDepositAmount: asNumber(data?.securityDepositAmount),
    renterPlatformFee: asNumber(data?.renterPlatformFee),
    renterProcessingFee: asNumber(data?.renterProcessingFee),
    paymentAmount: asNumber(data?.paymentAmount) ?? asNumber(legacyPayment?.amount),
    ownerProcessingFee: asNumber(data?.ownerProcessingFee),
    ownerPayoutAmount:
      asNumber(data?.ownerPayoutAmount) ?? asNumber(legacyPayment?.ownerPayoutAmount),
    ownerPayoutTransferFee: asNumber(data?.ownerPayoutTransferFee),
    renterDepositReturnTransferFee: asNumber(data?.renterDepositReturnTransferFee),
    securityDepositCollectionProcessingFee: asNumber(
      data?.securityDepositCollectionProcessingFee,
    ),
    currency: asString(data?.currency) ?? asString(legacyPayment?.currency),
  };
}

function mapDepositFlow(
  value: unknown,
  legacySecurityDeposit?: Record<string, unknown> | null,
): AdminBooking["depositFlow"] {
  const data = asRecord(value);
  if (!data && !legacySecurityDeposit) return null;
  const amount =
    asNumber(data?.amount) ??
    asNumber(legacySecurityDeposit?.amount) ??
    0;
  return {
    amount,
    approvedDeductionAmount: asNumber(data?.approvedDeductionAmount),
    depositCoveredAmount: asNumber(data?.depositCoveredAmount),
    depositReturnAmount: asNumber(data?.depositReturnAmount),
    required: data?.required === true || legacySecurityDeposit?.enabled === true,
    requestedDeductionAmount: asNumber(data?.requestedDeductionAmount),
    renterResponse: asString(data?.renterResponse),
    status: asString(data?.status),
  };
}

function mapDisputeFlow(
  value: unknown,
  legacyRequest?: Record<string, unknown> | null,
  legacySettlement?: Record<string, unknown> | null,
): AdminBooking["disputeFlow"] {
  const data = asRecord(value);
  if (!data && !legacyRequest && !legacySettlement) return null;
  return {
    adminNotes: asString(data?.adminNotes) ?? asString(legacyRequest?.adminNotes),
    approvedAmount:
      asNumber(data?.approvedAmount) ??
      asNumber(legacyRequest?.approvedAmount) ??
      asNumber(legacySettlement?.approvedDamageDeductionAmount),
    depositCoveredAmount:
      asNumber(data?.depositCoveredAmount) ??
      asNumber(legacySettlement?.depositCoveredDamageAmount),
    evidenceUrls: asStringArray(data?.evidenceUrls ?? legacyRequest?.evidenceUrls),
    notes: asString(data?.notes) ?? asString(legacyRequest?.notes),
    outstandingAmount:
      asNumber(data?.outstandingAmount) ??
      asNumber(legacySettlement?.outstandingDamageAmount),
    outstandingPaymentRequestId:
      asString(data?.outstandingPaymentRequestId) ??
      asString(legacySettlement?.damageBalancePaymentRequestId),
    outstandingPaymentStatus:
      asString(data?.outstandingPaymentStatus) ??
      asString(legacySettlement?.damageBalancePaymentStatus),
    paidOutstandingAmount: asNumber(data?.paidOutstandingAmount),
    reason: asString(data?.reason) ?? asString(legacyRequest?.reason),
    remainingSecurityDeposit: asNumber(data?.remainingSecurityDeposit),
    renterResponse:
      asString(data?.renterResponse) ??
      asString(legacyRequest?.renterResponse) ??
      asString(legacySettlement?.renterResponse),
    renterSupportChatId:
      asString(data?.renterSupportChatId) ??
      asString(legacyRequest?.renterSupportChatId) ??
      asString(legacySettlement?.renterSupportChatId),
    ownerSupportChatId:
      asString(data?.ownerSupportChatId) ??
      asString(legacyRequest?.ownerSupportChatId) ??
      asString(legacySettlement?.ownerSupportChatId),
    requestedAmount:
      asNumber(data?.requestedAmount) ?? asNumber(legacyRequest?.requestedAmount),
    status:
      asString(data?.status) ??
      asString(legacyRequest?.status) ??
      asString(legacySettlement?.status),
    supportStatus:
      asString(data?.supportStatus) ?? asString(legacySettlement?.supportStatus),
  };
}

function mapPayoutFlow(
  value: unknown,
  legacySettlement?: Record<string, unknown> | null,
  legacyPayment?: Record<string, unknown> | null,
): AdminBooking["payoutFlow"] {
  const data = asRecord(value);
  if (!data && !legacySettlement && !legacyPayment) return null;
  return {
    depositReturnAmount:
      asNumber(data?.depositReturnAmount) ??
      asNumber(legacySettlement?.depositReturnAmount),
    depositReturnStatus:
      asString(data?.depositReturnStatus) ??
      asString(legacySettlement?.depositReturnStatus),
    ownerPayoutAmount:
      asNumber(data?.ownerPayoutAmount) ??
      asNumber(legacySettlement?.ownerPayoutAmount) ??
      asNumber(legacyPayment?.ownerPayoutAmount),
    ownerPayoutError: asString(data?.ownerPayoutError),
    ownerPayoutGrossAmount: asNumber(data?.ownerPayoutGrossAmount),
    ownerPayoutStatus:
      asString(data?.ownerPayoutStatus) ?? asString(legacyPayment?.payoutStatus),
    ownerPayoutTransferFee: asNumber(data?.ownerPayoutTransferFee),
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
  const status = booking.disputeFlow?.status ?? "";
  const supportStatus = booking.disputeFlow?.supportStatus ?? "";
  const depositStatus = booking.depositFlow?.status ?? "";
  const waitingForRenterResponse =
    status === "requested" || depositStatus === "awaiting_renter_response";

  return (
    Boolean(booking.disputeFlow) &&
    !waitingForRenterResponse &&
    !["resolved", "closed"].includes(status) &&
    !["resolved", "closed"].includes(supportStatus)
  );
}

export function isCompletedDamageBooking(booking: AdminBooking) {
  return (
    booking.disputeFlow?.status === "resolved" ||
    ["resolved", "closed"].includes(booking.disputeFlow?.supportStatus ?? "")
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

export function formatBookingMoney(value: number | null | undefined, currency = "PHP") {
  if (value == null) {
    return "Not set";
  }

  return `${currency || "PHP"} ${formatExactNumber(value)}`;
}

export function formatExactNumber(value: number | null | undefined) {
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
