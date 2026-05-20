import type { FullVerificationSubmission } from "@/lib/admin-users";

export function buildApprovedVerificationUserUpdate(
  submission: FullVerificationSubmission | null,
) {
  const update: Record<string, unknown> = {
    verified: "Full",
  };

  if (!submission) {
    return update;
  }

  if (submission.requestType !== "account_information_update") {
    update.firstName = submission.firstName ?? "";
    update.lastName = submission.lastName ?? "";

    if (submission.dateOfBirth) {
      update.dateOfBirth = submission.dateOfBirth;
    }

    if (submission.email) {
      update.email = submission.email;
    }

    if (submission.phone) {
      update.phone = submission.phone;
    }

    if (submission.location) {
      update.location = submission.location;
    }

    update.photoUrl = submission.photoUrl ?? null;
    return update;
  }

  const updatedFields = new Set(submission.updatedFields);

  if (hasAny(updatedFields, ["fullName", "firstName", "lastName"])) {
    update.firstName = submission.firstName ?? "";
    update.lastName = submission.lastName ?? "";
  }

  if (updatedFields.has("dateOfBirth") && submission.dateOfBirth) {
    update.dateOfBirth = submission.dateOfBirth;
  }

  if (updatedFields.has("phone") && submission.phone) {
    update.phone = submission.phone;
  }

  if (updatedFields.has("location") && submission.location) {
    update.location = submission.location;
  }

  if (hasAny(updatedFields, ["photo", "photoUrl"])) {
    update.photoUrl = submission.photoUrl ?? null;
  }

  if (updatedFields.has("email") && submission.email) {
    update.email = submission.email;
  }

  return update;
}

function hasAny(fields: Set<string>, candidates: string[]) {
  return candidates.some((field) => fields.has(field));
}
