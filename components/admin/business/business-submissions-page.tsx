"use client";

import * as React from "react";

import { BusinessSubmissionReviewSheet } from "./components/business-submission-review-sheet";
import { getBusinessSubmissionColumns } from "./components/business-submission-columns";
import { BusinessSubmissionTable } from "./components/business-submission-table";
import type { BusinessSubmissionItem } from "./data/business-submission-queries";
import { useBusinessSubmissions } from "./hooks/use-business-submissions";

export function BusinessSubmissionsPage() {
  const { data, error, loading, pagination } = useBusinessSubmissions();
  const [selected, setSelected] = React.useState<BusinessSubmissionItem | null>(null);
  const columns = React.useMemo(
    () => getBusinessSubmissionColumns({ onOpen: setSelected }),
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">
          Business registration submissions
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Review pending business registration and compliance document submissions from owners.
        </p>
      </div>

      <BusinessSubmissionTable
        columns={columns}
        data={data}
        error={error}
        loading={loading}
        pagination={pagination}
      />
      <BusinessSubmissionReviewSheet
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        open={selected != null}
        submission={selected}
      />
    </div>
  );
}
