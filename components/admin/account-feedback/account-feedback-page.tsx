"use client";

import { AccountFeedbackTable } from "./components";
import { useAccountFeedback } from "./hooks/use-account-feedback";

export function AccountFeedbackPage() {
  const { data, error, loading, pagination } = useAccountFeedback();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">
          Account Feedback
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Anonymous reasons submitted before users disable or delete their
          accounts.
        </p>
      </div>
      <AccountFeedbackTable data={data} error={error} loading={loading} pagination={pagination} />
    </div>
  );
}
