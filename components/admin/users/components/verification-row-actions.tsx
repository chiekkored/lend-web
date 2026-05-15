"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { doc, increment, serverTimestamp, writeBatch } from "firebase/firestore";
import { Check, ExternalLink, MoreVerticalIcon, X } from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatUserDate,
  getUserDisplayName,
  type AdminUser,
  type FullVerificationSubmission,
} from "@/lib/admin-users";
import {
  getFirebaseFirestore,
  hasFirebaseConfig,
  missingFirebaseConfig,
} from "@/lib/firebase";

import {
  fetchFullVerificationSubmission,
  userDirectoryQueryKeys,
} from "../data/user-directory-queries";

type VerificationRowActionsProps = {
  user: AdminUser;
};

type ReviewAction = "Approved" | "Rejected";

export function VerificationRowActions({ user }: VerificationRowActionsProps) {
  const [viewOpen, setViewOpen] = React.useState(false);
  const { error, reviewing, reviewVerification } =
    useVerificationReviewMutation(user);

  async function handleReview(action: ReviewAction) {
    const ok = await reviewVerification(action);

    if (!ok) {
      setViewOpen(true);
    }
  }

  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Open verification actions" size="icon" variant="ghost">
            <MoreVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setViewOpen(true);
            }}
          >
            <ExternalLink />
            View
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={reviewing}
            onSelect={(event) => {
              event.preventDefault();
              void handleReview("Approved");
            }}
          >
            <Check />
            Approve
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            disabled={reviewing}
            onSelect={(event) => {
              event.preventDefault();
              void handleReview("Rejected");
            }}
          >
            <X />
            Reject
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <VerificationViewSheet
        error={error}
        onOpenChange={setViewOpen}
        open={viewOpen}
        reviewVerification={reviewVerification}
        reviewing={reviewing}
        user={user}
      />
    </div>
  );
}

function VerificationViewSheet({
  error,
  onOpenChange,
  open,
  reviewVerification,
  reviewing,
  user,
}: {
  error: string | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  reviewVerification: (action: ReviewAction) => Promise<boolean>;
  reviewing: boolean;
  user: AdminUser;
}) {
  const displayName = getUserDisplayName(user);
  const submissionId = getActiveSubmissionId(user);
  const submissionQuery = useQuery({
    enabled: open && Boolean(submissionId),
    gcTime: 1000 * 60 * 60,
    queryFn: () => fetchFullVerificationSubmission(submissionId ?? ""),
    queryKey: userDirectoryQueryKeys.verificationSubmission(submissionId),
    staleTime: 1000 * 60 * 10,
  });
  const submissionError =
    submissionQuery.error instanceof Error
      ? submissionQuery.error.message
      : submissionQuery.error
        ? "Unable to load verification submission."
        : null;

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader className="pr-12">
          <SheetTitle>{displayName}</SheetTitle>
          <SheetDescription>{user.email ?? user.uid}</SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-4 overflow-y-auto overflow-x-hidden px-4 pb-4">
          <Section title="User">
            <DetailRow label="Name" value={displayName} />
            <DetailRow label="Email" value={user.email ?? "Not set"} />
            <DetailRow label="UID" value={user.uid} />
            <DetailRow label="Verified" value={<StatusBadge value={user.verified} />} />
            <DetailRow
              label="Request"
              value={
                user.fullVerification?.status ? (
                  <StatusBadge value={String(user.fullVerification.status)} />
                ) : (
                  "No request"
                )
              }
            />
          </Section>

          <Section title="Submission">
            {!submissionId ? (
              <p className="text-sm text-destructive">
                Missing active verification submission.
              </p>
            ) : submissionQuery.isLoading ? (
              <VerificationSubmissionSkeleton />
            ) : submissionError ? (
              <p className="text-sm text-destructive">{submissionError}</p>
            ) : submissionQuery.data ? (
              <VerificationSubmissionDetails submission={submissionQuery.data} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Verification submission not found.
              </p>
            )}
          </Section>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              disabled={reviewing}
              onClick={() => void reviewVerification("Approved")}
              type="button"
            >
              <Check className="size-4" />
              Approve
            </Button>
            <Button
              disabled={reviewing}
              onClick={() => void reviewVerification("Rejected")}
              type="button"
              variant="destructive"
            >
              <X className="size-4" />
              Reject
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function VerificationSubmissionDetails({
  submission,
}: {
  submission: FullVerificationSubmission;
}) {
  return (
    <>
      <DetailRow label="Submission ID" value={submission.id} />
      <DetailRow label="Status" value={submission.status ? <StatusBadge value={submission.status} /> : "Not set"} />
      <DetailRow label="Phone" value={submission.phone ?? "Not set"} />
      <DetailRow label="Address" value={submission.address ?? "Not set"} />
      <DetailRow label="Face KYC" value={submission.faceKycStatus ?? "Not set"} />
      <DetailRow label="Submitted" value={formatUserDate(submission.submittedAt)} />
      <DetailRow label="Reviewed" value={formatUserDate(submission.reviewedAt)} />
    </>
  );
}

function VerificationSubmissionSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="flex items-center justify-between gap-3" key={index}>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
      ))}
    </div>
  );
}

function Section({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="grid min-w-0 gap-3 rounded-md border p-4 text-sm">
      <h3 className="font-medium">{title}</h3>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 text-right [overflow-wrap:anywhere]">{value}</span>
    </div>
  );
}

function useVerificationReviewMutation(user: AdminUser) {
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);
  const [reviewing, setReviewing] = React.useState(false);

  async function reviewVerification(action: ReviewAction) {
    setError(null);

    if (!hasFirebaseConfig) {
      setError(`Missing Firebase configuration: ${missingFirebaseConfig.join(", ")}.`);
      return false;
    }

    const submissionId = getActiveSubmissionId(user);
    if (!submissionId) {
      setError("Missing active verification submission.");
      return false;
    }

    setReviewing(true);
    try {
      const db = getFirebaseFirestore();
      const batch = writeBatch(db);
      batch.update(doc(db, "verificationSubmissions", submissionId), {
        reviewedAt: serverTimestamp(),
        status: action,
      });

      const userUpdate: Record<string, unknown> = {
        "fullVerification.reviewedAt": serverTimestamp(),
        "fullVerification.status": action,
        userMetadataVersion: increment(1),
      };

      if (action === "Approved") {
        userUpdate.verified = "Full";
      }

      batch.update(doc(db, "users", user.uid), userUpdate);
      await batch.commit();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userDirectoryQueryKeys.verifications }),
        queryClient.invalidateQueries({ queryKey: userDirectoryQueryKeys.users }),
        queryClient.invalidateQueries({ queryKey: userDirectoryQueryKeys.user(user.uid) }),
        queryClient.invalidateQueries({
          queryKey: userDirectoryQueryKeys.verificationSubmission(submissionId),
        }),
      ]);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Unable to ${action.toLowerCase()} verification.`,
      );
      return false;
    } finally {
      setReviewing(false);
    }
  }

  return { error, reviewVerification, reviewing };
}

function getActiveSubmissionId(user: AdminUser) {
  return typeof user.fullVerification?.activeSubmissionId === "string"
    ? user.fullVerification.activeSubmissionId
    : null;
}
