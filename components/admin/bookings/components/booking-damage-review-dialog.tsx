"use client";

import * as React from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatBookingMoney, getBookingAssetTitle, type AdminBooking } from "@/lib/admin-bookings";

import { useBookingMutation } from "../hooks/use-booking-mutation";

type DamageDecision = "approve_full" | "approve_adjusted" | "reject";

type BookingDamageReviewDialogProps = {
  booking: AdminBooking;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function BookingDamageReviewDialog({
  booking,
  onOpenChange,
  open,
}: BookingDamageReviewDialogProps) {
  const [decision, setDecision] = React.useState<DamageDecision>("approve_full");
  const [approvedAmount, setApprovedAmount] = React.useState("");
  const [adminNotes, setAdminNotes] = React.useState("");
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const { error, resetError, reviewDamageDeduction, submitting } = useBookingMutation(booking);
  const requestedAmount = booking.damageDeductionRequest?.requestedAmount ?? 0;
  const depositAmount = booking.securityDeposit.amount;
  const reason = booking.damageDeductionRequest?.reason ?? "";
  const isSupportReviewRequest =
    booking.damageDeductionRequest?.requiresSupportReview === true ||
    reason === "Total loss/damage" ||
    reason === "Higher than security deposit";
  const defaultApprovedAmount = String(
    booking.damageDeductionRequest?.approvedAmount ??
      (isSupportReviewRequest ? depositAmount : requestedAmount),
  );

  React.useEffect(() => {
    if (!open) return;
    setDecision(isSupportReviewRequest ? "approve_adjusted" : "approve_full");
    setApprovedAmount(defaultApprovedAmount);
    setAdminNotes("");
    setValidationError(null);
    resetError();
  }, [defaultApprovedAmount, isSupportReviewRequest, open, resetError]);

  async function onConfirm() {
    setValidationError(null);
    const amount =
      decision === "approve_adjusted"
        ? Number(approvedAmount)
        : decision === "approve_full"
          ? requestedAmount
          : 0;

    if (decision === "approve_adjusted" && (!Number.isFinite(amount) || amount < 0)) {
      setValidationError("Enter a valid adjusted amount.");
      return;
    }

    if (decision === "approve_adjusted" && !isSupportReviewRequest && amount > requestedAmount) {
      setValidationError("Enter an adjusted amount from 0 up to the requested amount.");
      return;
    }

    const success = await reviewDamageDeduction({
      decision,
      approvedAmount: amount,
      adminNotes,
    });
    if (success) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review damage deduction</DialogTitle>
          <DialogDescription>Approve, adjust, or reject the requested security deposit deduction.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="rounded-md border p-4 text-sm">
            <p className="font-medium">{getBookingAssetTitle(booking)}</p>
            <p className="mt-1 text-muted-foreground">Booking: {booking.id}</p>
            <p className="mt-1 text-muted-foreground">
              Requested: {formatBookingMoney(booking.damageDeductionRequest?.requestedAmount ?? null)}
            </p>
            <p className="mt-1 text-muted-foreground">
              Deposit: {formatBookingMoney(depositAmount)}
            </p>
            <p className="mt-1 text-muted-foreground">
              Renter response: {booking.damageDeductionRequest?.renterResponse ?? "Not set"}
            </p>
            <p className="mt-1 text-muted-foreground">Reason: {booking.damageDeductionRequest?.reason ?? "Not set"}</p>
            {isSupportReviewRequest ? (
              <p className="mt-2 rounded-md bg-muted px-3 py-2 text-muted-foreground">
                Above-deposit approval will be recorded as a pending Lend Support balance. Separate support chats can
                be created for the renter and owner after approval.
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="damage-decision">Decision</Label>
            <Select onValueChange={(value) => setDecision(value as DamageDecision)} value={decision}>
              <SelectTrigger id="damage-decision">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approve_full">Approve full requested amount</SelectItem>
                <SelectItem value="approve_adjusted">Approve adjusted amount</SelectItem>
                <SelectItem value="reject">Reject deduction</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {decision === "approve_adjusted" ? (
            <div className="grid gap-2">
              <Label htmlFor="approved-amount">Approved amount</Label>
              <Input
                disabled={submitting}
                id="approved-amount"
                inputMode="decimal"
                min="0"
                onChange={(event) => setApprovedAmount(event.target.value)}
                placeholder={isSupportReviewRequest ? "Enter support review amount" : "Enter amount"}
                type="number"
                value={approvedAmount}
              />
              {isSupportReviewRequest ? (
                <p className="text-xs text-muted-foreground">
                  Amounts above {formatBookingMoney(depositAmount)} stay pending with Lend Support.
                </p>
              ) : null}
            </div>
          ) : null}
          <Textarea
            disabled={submitting}
            onChange={(event) => setAdminNotes(event.target.value)}
            placeholder="Admin notes"
            value={adminNotes}
          />
          {validationError || error ? (
            <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{validationError ?? error}</span>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={submitting} type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button disabled={submitting} onClick={onConfirm} type="button">
            {submitting ? <Loader2 className="animate-spin" /> : null}
            Submit review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
