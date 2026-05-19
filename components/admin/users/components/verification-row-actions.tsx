"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { doc, increment, serverTimestamp, writeBatch } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { Check, ExternalLink, MoreVerticalIcon, X } from "lucide-react";

import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { buildApprovedVerificationUserUpdate } from "@/lib/admin-verification";
import {
  getFirebaseFirestore,
  getFirebaseStorage,
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
      <SheetContent className="sm:max-w-4xl">
        <SheetHeader className="pr-12">
          <SheetTitle>{displayName}</SheetTitle>
          <SheetDescription>{user.email ?? user.uid}</SheetDescription>
        </SheetHeader>

        <div className="grid flex-1 auto-rows-min gap-4 overflow-y-auto overflow-x-hidden px-4 pb-4">
          <div className="grid gap-3">
            {!submissionId ? (
              <p className="text-sm text-destructive">
                Missing active verification submission.
              </p>
            ) : submissionQuery.isLoading ? (
              <VerificationSubmissionSkeleton />
            ) : submissionError ? (
              <p className="text-sm text-destructive">{submissionError}</p>
            ) : submissionQuery.data ? (
              <VerificationSubmissionDetails
                submission={submissionQuery.data}
                user={user}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Verification submission not found.
              </p>
            )}
          </div>

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
  user,
}: {
  submission: FullVerificationSubmission;
  user: AdminUser;
}) {
  return (
    <div className="grid gap-4">
      <Section title="Request">
        <DetailRow label="Submission ID" value={submission.id} />
        <DetailRow label="Request Type" value={formatRequestType(submission.requestType)} />
        <DetailRow label="Updated Fields" value={formatUpdatedFields(submission.updatedFields)} />
        <DetailRow label="Status" value={submission.status ? <StatusBadge value={submission.status} /> : "Not set"} />
        <DetailRow label="Submitted" value={formatUserDate(submission.submittedAt)} />
        <DetailRow label="Reviewed" value={formatUserDate(submission.reviewedAt)} />
      </Section>

      <ProfileComparison submission={submission} user={user} />

      <Section title="Didit / KYC">
        <DetailRow label="Face KYC" value={submission.faceKycStatus ?? "Not set"} />
        <DetailRow label="Provider" value={submission.verificationProvider ?? "Not set"} />
        <DetailRow label="Didit Status" value={submission.diditStatus ?? "Not set"} />
        <DetailRow label="Session ID" value={submission.diditSessionId ?? "Not set"} />
        <DetailRow label="Workflow ID" value={submission.diditWorkflowId ?? "Not set"} />
        <DetailRow label="Started" value={formatUserDate(submission.diditStartedAt)} />
        <DetailRow label="Completed" value={formatUserDate(submission.diditCompletedAt)} />
        <DetailRow
          label="Decision"
          value={
            submission.diditDecision ? (
              <pre className="max-h-40 overflow-auto rounded-md bg-muted p-2 text-left text-xs">
                {JSON.stringify(submission.diditDecision, null, 2)}
              </pre>
            ) : (
              "Not set"
            )
          }
        />
      </Section>
    </div>
  );
}

function ProfileComparison({
  submission,
  user,
}: {
  submission: FullVerificationSubmission;
  user: AdminUser;
}) {
  return (
    <Section title="Profile Comparison">
      <div className="grid gap-3">
        <div className="grid grid-cols-[7rem_minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b pb-2 text-xs font-medium text-muted-foreground">
          <span>Field</span>
          <span>Current User</span>
          <span>Submitted</span>
        </div>
        <ComparisonRow
          current={<VerificationPhotoPreview photoUrl={user.photoUrl} />}
          field="Photo"
          submitted={<VerificationPhotoPreview photoUrl={submission.photoUrl} />}
          updated={isUpdatedField(submission, "photoUrl")}
        />
        <ComparisonRow
          current={formatUserName(user)}
          field="Name"
          submitted={formatName(submission)}
          updated={isUpdatedField(submission, "fullName")}
        />
        <ComparisonRow
          current={formatUserDate(user.dateOfBirth)}
          field="Date of Birth"
          submitted={formatUserDate(submission.dateOfBirth)}
          updated={isUpdatedField(submission, "dateOfBirth")}
        />
        <ComparisonRow
          current={user.email ?? "Not set"}
          field="Email"
          submitted={submission.email ?? "Not set"}
          updated={isUpdatedField(submission, "email")}
        />
        <ComparisonRow
          current={user.phone ?? "Not set"}
          field="Phone"
          submitted={submission.phone ?? "Not set"}
          updated={isUpdatedField(submission, "phone")}
        />
        <ComparisonRow
          current={formatLocation(asLocationRecord(user.location))}
          field="Location"
          submitted={formatLocation(submission.location)}
          updated={isUpdatedField(submission, "location")}
        />
        <ComparisonRow
          current={<StatusBadge value={user.verified} />}
          field="Verified"
          submitted={submission.status ? <StatusBadge value={submission.status} /> : "Not set"}
        />
        <ComparisonRow
          current={user.uid}
          field="UID"
          submitted={submission.userId || "Not set"}
        />
      </div>
    </Section>
  );
}

function ComparisonRow({
  current,
  field,
  submitted,
  updated = false,
}: {
  current: React.ReactNode;
  field: string;
  submitted: React.ReactNode;
  updated?: boolean;
}) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)_minmax(0,1fr)] gap-3 border-b py-2 last:border-b-0">
      <div className="grid gap-1 text-xs text-muted-foreground">
        <span>{field}</span>
        {updated ? (
          <span className="w-fit rounded-sm bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary">
            Updated
          </span>
        ) : null}
      </div>
      <div className="min-w-0 text-sm [overflow-wrap:anywhere]">{current}</div>
      <div className="min-w-0 text-sm [overflow-wrap:anywhere]">{submitted}</div>
    </div>
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

function VerificationPhotoPreview({ photoUrl }: { photoUrl: string | null }) {
  const [open, setOpen] = React.useState(false);
  const { error, resolvedUrl } = useResolvedImageUrl(photoUrl);

  if (!photoUrl) {
    return (
      <div className="flex h-20 w-20 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
        No photo
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <>
      <button
        className="group relative h-20 w-20 overflow-hidden rounded-md border bg-muted text-left"
        disabled={!resolvedUrl}
        onClick={() => setOpen(true)}
        type="button"
      >
        {resolvedUrl ? (
          // Use a plain img because Firebase Storage paths can resolve at runtime.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt="Submitted profile"
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
            src={resolvedUrl}
          />
        ) : (
          <span className="flex h-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
            Loading...
          </span>
        )}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Submitted profile photo</DialogTitle>
            <DialogDescription>{photoUrl}</DialogDescription>
          </DialogHeader>
          {resolvedUrl ? (
            <div className="grid gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Submitted profile large preview"
                className="max-h-[70vh] w-full rounded-md object-contain"
                src={resolvedUrl}
              />
              <Button asChild variant="outline">
                <a href={resolvedUrl} rel="noreferrer" target="_blank">
                  <ExternalLink className="size-4" />
                  Open image
                </a>
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function useResolvedImageUrl(photoUrl: string | null) {
  const [resolvedUrl, setResolvedUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setResolvedUrl(null);
    setError(null);

    if (!photoUrl) return;

    if (isUrl(photoUrl)) {
      setResolvedUrl(photoUrl);
      return;
    }

    async function resolveStoragePath() {
      try {
        const url = await getDownloadURL(ref(getFirebaseStorage(), photoUrl ?? ""));
        if (!cancelled) setResolvedUrl(url);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load submitted photo.");
        }
      }
    }

    void resolveStoragePath();

    return () => {
      cancelled = true;
    };
  }, [photoUrl]);

  return { error, resolvedUrl };
}

function isUrl(value: string) {
  return /^https?:\/\//i.test(value) || value.startsWith("/");
}

function formatRequestType(value: string | null) {
  switch (value) {
    case "upgrade_verification":
      return "Upgrade Verification";
    case "account_information_update":
      return "Account Information Update";
    default:
      return "Legacy Request";
  }
}

function formatUpdatedFields(fields: string[]) {
  if (!fields.length) return "Not set";
  return fields.map(formatFieldName).join(", ");
}

function formatFieldName(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatName(submission: FullVerificationSubmission) {
  const name = [submission.firstName, submission.lastName].filter(Boolean).join(" ").trim();
  return name || "Not set";
}

function formatUserName(user: AdminUser) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.displayName || "Not set";
}

function formatLocation(location: Record<string, unknown> | null) {
  if (!location) return "Not set";
  const parts = [
    stringValue(location.formattedAddress),
    stringValue(location.locality),
    stringValue(location.administrativeAreaLevel1),
    stringValue(location.country),
  ].filter(Boolean);
  return Array.from(new Set(parts)).join(", ") || "Not set";
}

function asLocationRecord(value: unknown) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function isUpdatedField(
  submission: FullVerificationSubmission,
  field: string,
) {
  const fields = new Set(submission.updatedFields);
  if (field === "photoUrl") return fields.has("photo") || fields.has("photoUrl");
  if (field === "fullName") {
    return fields.has("fullName") || fields.has("firstName") || fields.has("lastName");
  }
  return fields.has(field);
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
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
      const submission =
        action === "Approved"
          ? user.fullVerificationSubmission ??
            (await fetchFullVerificationSubmission(submissionId))
          : user.fullVerificationSubmission;
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
        Object.assign(
          userUpdate,
          buildApprovedVerificationUserUpdate(submission),
        );
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
